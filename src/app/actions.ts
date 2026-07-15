'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { validateFile, generateUniqueFilename } from '@/lib/file-utils';
import { rateLimit } from '@/lib/rate-limit';
import { STORAGE_BUCKET, RATE_LIMIT, AUTH_COOKIE_NAME } from '@/lib/constants';
import { uploadAbsensiSchema, submitIzinSchema } from '@/lib/validations';
import { getSession } from '@/lib/session';


const uploadRateLimiter = rateLimit('upload', RATE_LIMIT.UPLOAD);

async function checkAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new Error('Unauthorized: No session');
  }

  const session = await getSession(token);

  if (!session) {
    throw new Error('Unauthorized: Invalid session');
  }

  return session;
}

export async function uploadAbsensi(formData: FormData) {
  try {
    const session = await checkAuthenticatedUser();

    // Use user ID for rate limiting
    const identifier = `user:${session.userId}`;

    // Rate limiting
    const rateLimitResult = uploadRateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      const waitMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
      return { 
        error: `Terlalu banyak upload. Coba lagi dalam ${waitMinutes} menit.` 
      };
    }

    const validation = uploadAbsensiSchema.safeParse({
      nama: session.nama, // SECURITY FIX: force use session name instead of client input
      file: formData.get('file'),
      schedule_id: formData.get('schedule_id'),
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { nama, file, schedule_id: scheduleId } = validation.data;


    // Check for duplicate attendance
    const { data: existingAbsensi } = await supabase
      .from('absensi')
      .select('id')
      .eq('nama', nama)
      .eq('schedule_id', scheduleId)
      .maybeSingle();

    if (existingAbsensi) {
      return { error: 'Kamu sudah mengisi absensi untuk jadwal ini!' };
    }

    // Determine status
    let status = 'PRESENT';
    const { data: schedule } = await supabase.from('schedules').select('start_time, end_time').eq('id', scheduleId).single();
    
    if (schedule) {
      const now = new Date();
      const startStr = schedule.start_time.includes('+') || schedule.start_time.endsWith('Z') ? schedule.start_time : schedule.start_time + '+07:00';
      const endStr = schedule.end_time.includes('+') || schedule.end_time.endsWith('Z') ? schedule.end_time : schedule.end_time + '+07:00';
      
      const startTime = new Date(startStr);
      const endTime = new Date(endStr);
      
      if (now < startTime) {
        const startTimeStr = startTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
        return { error: `Absen belum dibuka! Silakan kembali pada pukul ${startTimeStr} WIB` };
      }
      
      if (now > endTime) {
        status = 'LATE';
      }
    } else {
      return { error: 'Jadwal tidak ditemukan di sistem' };
    }

    // Validate file on server-side
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return { error: fileValidation.error };
    }

    // Generate unique filename
    const fileName = generateUniqueFilename(file.name, `${nama.replace(/\s+/g, '-')}-`);

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage using Storage API (not S3 SDK)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: `Gagal upload file: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Insert into Supabase table
    const insertPayload: any = { nama, image_url: publicUrl, status };
    if (scheduleId) insertPayload.schedule_id = scheduleId;

    const { error: insertError } = await supabase
      .from('absensi')
      .insert([insertPayload]);

    if (insertError) {
      console.error('Database error:', insertError);
      
      // Cleanup: delete uploaded file if database insert fails
      await supabase.storage.from(STORAGE_BUCKET).remove([fileName]);
      
      return { error: `Gagal menyimpan data: ${insertError.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      error: error instanceof Error ? error.message : 'Gagal upload file' 
    };
  }
}

export async function submitIzin(formData: FormData) {
  try {
    const session = await checkAuthenticatedUser();

    // Use user ID for rate limiting
    const identifier = `user:${session.userId}`;
    const rateLimitResult = uploadRateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      const waitMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
      return { error: `Terlalu banyak request. Coba lagi dalam ${waitMinutes} menit.` };
    }

    const validation = submitIzinSchema.safeParse({
      nama: session.nama, // SECURITY FIX: force use session name instead of client input
      schedule_id: formData.get('schedule_id'),
      alasan: formData.get('alasan'),
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { nama, schedule_id: scheduleId, alasan } = validation.data;

    // Validate schedule exists
    const { data: schedule } = await supabase.from('schedules').select('id').eq('id', scheduleId).maybeSingle();
    if (!schedule) {
      return { error: 'Jadwal tidak valid atau tidak ditemukan' };
    }

    // Check for duplicate attendance
    const { data: existingAbsensi } = await supabase
      .from('absensi')
      .select('id')
      .eq('nama', nama)
      .eq('schedule_id', scheduleId)
      .maybeSingle();

    if (existingAbsensi) {
      return { error: 'Kamu sudah mengisi absensi/izin untuk jadwal ini!' };
    }

    const insertPayload = { 
      nama, 
      schedule_id: scheduleId, 
      status: 'IZIN', 
      alasan: alasan.trim(),
      image_url: null 
    };

    const { error: insertError } = await supabase
      .from('absensi')
      .insert([insertPayload]);

    if (insertError) {
      console.error('Database error:', insertError);
      return { error: `Gagal menyimpan data: ${insertError.message}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Submit Izin error:', error);
    return { error: error instanceof Error ? error.message : 'Gagal submit izin' };
  }
}
