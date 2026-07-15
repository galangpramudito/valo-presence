import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AbsensiRecord = {
  id: string;
  created_at: string;
  nama: string;
  image_url?: string;
  status?: string;
  alasan?: string;
  schedule_id?: string;
  schedules?: Schedule; // joined data
};

export type Schedule = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
};
