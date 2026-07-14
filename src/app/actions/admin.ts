'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/password';
import { 
  addMemberSchema, 
  updatePasswordSchema, 
  deleteMemberSchema, 
  broadcastSchema,
  mvpArraySchema 
} from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import { AUTH_COOKIE_NAME, RATE_LIMIT } from '@/lib/constants';
import { z } from 'zod';

const adminRateLimiter = rateLimit('admin', RATE_LIMIT.ADMIN_ACTION);

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  
  if (!token) {
    throw new Error('Unauthorized: No session');
  }

  const session = await getSession(token);
  
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  return session;
}

async function checkRateLimit(session: any): Promise<void> {
  // Use user ID for rate limiting admin actions
  const identifier = `user:${session.userId}`;
  
  const rateLimitResult = adminRateLimiter.check(identifier);
  if (!rateLimitResult.success) {
    throw new Error('Terlalu banyak request. Silakan tunggu sebentar.');
  }
}

export async function addMember(formData: FormData) {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const validation = addMemberSchema.safeParse({
      nama: formData.get('nama'),
      password: formData.get('password'),
      role: formData.get('role') || 'user',
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { nama, password, role } = validation.data;

    // Additional security: only allow creating users, not admins
    // To create admin, must be done manually via database
    if (role === 'admin') {
      return { error: 'Pembuatan akun admin harus dilakukan melalui database!' };
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    const { error } = await supabase
      .from('squad_members')
      .insert([{ 
        nama: nama.toUpperCase(), 
        password: hashedPassword, 
        role 
      }]);

    if (error) {
      if (error.code === '23505') {
        return { error: 'Nama anggota sudah ada!' };
      }
      console.error('Database error:', error);
      return { error: 'Gagal menambahkan anggota' };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Add member error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const validation = updatePasswordSchema.safeParse({
      id: formData.get('id'),
      password: formData.get('password'),
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { id, password } = validation.data;

    // Check if trying to change another admin's password
    const { data: targetUser } = await supabase
      .from('squad_members')
      .select('role, nama')
      .eq('id', id)
      .single();

    // Only allow changing own admin password or any user password
    if (targetUser?.role === 'admin' && id !== session.userId) {
      return { error: 'Tidak dapat mengubah password admin lain!' };
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    const { error } = await supabase
      .from('squad_members')
      .update({ password: hashedPassword })
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Gagal mengubah password' };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}

export async function deleteMember(formData: FormData) {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const validation = deleteMemberSchema.safeParse({
      id: formData.get('id'),
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { id } = validation.data;

    // Prevent admin from deleting themselves
    if (id === session.userId) {
      return { error: 'Tidak dapat menghapus akun admin yang sedang aktif!' };
    }

    // Check if trying to delete another admin
    const { data: targetUser } = await supabase
      .from('squad_members')
      .select('role, nama')
      .eq('id', id)
      .single();

    if (targetUser?.role === 'admin') {
      return { error: 'Tidak dapat menghapus akun admin lain!' };
    }

    const { error } = await supabase
      .from('squad_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Gagal menghapus anggota' };
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Delete member error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}

export async function broadcastAnnouncement(formData: FormData) {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const validation = broadcastSchema.safeParse({
      message: formData.get('message'),
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    let { message } = validation.data;

    // Basic XSS protection: remove script tags and dangerous HTML
    message = message
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
      .trim();

    if (!message) {
      return { error: 'Pesan tidak boleh kosong setelah sanitasi!' };
    }

    // Use transaction-like behavior: first deactivate all, then insert new
    // This prevents race condition by using database operations
    const { error: deactivateError } = await supabase
      .from('announcements')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Database error:', deactivateError);
      return { error: 'Gagal menonaktifkan pengumuman lama' };
    }

    const { error: insertError } = await supabase
      .from('announcements')
      .insert([{ message, is_active: true }]);

    if (insertError) {
      console.error('Database error:', insertError);
      return { error: 'Gagal menyimpan pengumuman' };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Broadcast error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}

export async function clearAnnouncement() {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('is_active', true);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Gagal membersihkan pengumuman' };
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Clear announcement error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}

export async function updateMVPs(formData: FormData) {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const payloadString = formData.get('payload') as string;
    let payload;

    try {
      payload = JSON.parse(payloadString);
    } catch {
      return { error: 'Format data tidak valid' };
    }

    const validation = mvpArraySchema.safeParse(payload);

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const mvps = validation.data;

    // Delete all existing MVPs
    const { error: deleteError } = await supabase
      .from('mvps')
      .delete()
      .neq('rank', 0);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return { error: 'Gagal menghapus MVP lama' };
    }

    // Insert new MVPs if any
    if (mvps.length > 0) {
      const { error: insertError } = await supabase
        .from('mvps')
        .insert(mvps);

      if (insertError) {
        console.error('Database error:', insertError);
        return { error: 'Gagal menyimpan MVP baru' };
      }
    }

    revalidatePath('/riwayat');
    return { success: true };
  } catch (error) {
    console.error('Update MVPs error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}

export async function clearMVPs() {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const { error } = await supabase
      .from('mvps')
      .delete()
      .neq('rank', 0);

    if (error) {
      console.error('Database error:', error);
      return { error: 'Gagal membersihkan MVP' };
    }

    revalidatePath('/riwayat');
    return { success: true };
  } catch (error) {
    console.error('Clear MVPs error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}

export async function createSchedule(formData: FormData) {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const title = formData.get('title') as string;
    const startTimeStr = formData.get('start_time') as string;
    const endTimeStr = formData.get('end_time') as string;

    if (!title || !startTimeStr || !endTimeStr) {
      return { error: 'Semua field harus diisi' };
    }

    const { error } = await supabase.from('schedules').insert({
      title,
      start_time: startTimeStr,
      end_time: endTimeStr,
    });

    if (error) return { error: error.message };
    
    revalidatePath('/admin');
    revalidatePath('/absen');
    return { success: true };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}

export async function deleteSchedule(formData: FormData) {
  try {
    const session = await checkAdmin();
    await checkRateLimit(session);

    const id = formData.get('id') as string;

    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) return { error: error.message };
    
    revalidatePath('/admin');
    revalidatePath('/absen');
    return { success: true };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Terjadi kesalahan' 
    };
  }
}
