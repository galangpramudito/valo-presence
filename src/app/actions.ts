'use server';

import { supabase } from '@/lib/supabase';
import { validateFile, generateUniqueFilename } from '@/lib/file-utils';
import { rateLimit } from '@/lib/rate-limit';
import { getRateLimitIdentifier } from '@/lib/rate-limit-utils';
import { STORAGE_BUCKET, RATE_LIMIT } from '@/lib/constants';

const uploadRateLimiter = rateLimit('upload', RATE_LIMIT.UPLOAD);

export async function uploadAbsensi(formData: FormData) {
  try {
    // Get unique identifier for rate limiting (IP + User Agent)
    const identifier = await getRateLimitIdentifier();

    // Rate limiting
    const rateLimitResult = uploadRateLimiter.check(identifier);
    if (!rateLimitResult.success) {
      const waitMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
      return { 
        error: `Terlalu banyak upload. Coba lagi dalam ${waitMinutes} menit.` 
      };
    }

    const nama = formData.get('nama') as string;
    const file = formData.get('file') as File;
    const scheduleId = formData.get('schedule_id') as string | null;

    if (!nama || !file) {
      return { error: 'Nama dan file diperlukan' };
    }

    // Determine status if schedule exists
    let status = 'PRESENT';
    if (scheduleId) {
      const { data: schedule } = await supabase.from('schedules').select('start_time, end_time').eq('id', scheduleId).single();
      
      if (schedule) {
        const now = new Date();
        const startTime = new Date(schedule.start_time);
        const endTime = new Date(schedule.end_time);
        
        if (now < startTime) {
          const startTimeStr = startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
          return { error: `Absen belum dibuka! Silakan kembali pada pukul ${startTimeStr}` };
        }
        
        if (now > endTime) {
          status = 'LATE';
        }
      }
    }

    // Validate file on server-side
    const validation = validateFile(file);
    if (!validation.valid) {
      return { error: validation.error };
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
