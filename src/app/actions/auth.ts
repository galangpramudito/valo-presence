'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/password';
import { createSessionToken } from '@/lib/session';
import { loginSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/rate-limit';
import { getRateLimitIdentifier } from '@/lib/rate-limit-utils';
import { AUTH_COOKIE_NAME, SESSION_DURATION, RATE_LIMIT } from '@/lib/constants';

const loginRateLimiter = rateLimit('login', RATE_LIMIT.LOGIN);

export async function login(formData: FormData) {
  try {
    // Get unique identifier for rate limiting (IP + User Agent)
    const identifier = await getRateLimitIdentifier();

    // Rate limiting
    const rateLimitResult = loginRateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      const waitMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
      return { 
        error: `Terlalu banyak percobaan login. Coba lagi dalam ${waitMinutes} menit.` 
      };
    }

    // Validate input
    const validation = loginSchema.safeParse({
      nama: formData.get('nama'),
      password: formData.get('password'),
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { nama, password } = validation.data;



    // Fetch from DB
    const { data, error } = await supabase
      .from('squad_members')
      .select('*')
      .eq('nama', nama)
      .single();

    if (error || !data) {
      return { error: 'Username atau password salah' };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, data.password);
    if (!isPasswordValid) {
      return { error: 'Username atau password salah' };
    }

    // Create session token
    const token = await createSessionToken({
      userId: data.id,
      nama: data.nama,
      role: data.role || 'user',
    });

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION,
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Terjadi kesalahan saat login. Silakan coba lagi.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect('/login');
}
