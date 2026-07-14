-- Add Schedules table and relationships
-- Created: 2026-07-15

CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.absensi 
ADD COLUMN schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
ADD COLUMN status TEXT DEFAULT 'PRESENT';

-- Enable RLS for schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (auth is handled in app layer)
CREATE POLICY "Allow public read access on schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert on schedules" ON public.schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on schedules" ON public.schedules FOR DELETE USING (true);

-- Comments for documentation
COMMENT ON TABLE public.schedules IS 'Stores schedules for meetings/shifts';
COMMENT ON COLUMN public.absensi.status IS 'Status of attendance: PRESENT or LATE';
