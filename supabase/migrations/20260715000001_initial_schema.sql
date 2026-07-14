 kiro-cli --resume-id ec492abd-0e6e-4633-a656-7bd40263a031-- Initial Schema Migration for MNG Absensi System
-- Created: 2026-07-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: squad_members
-- Stores user accounts with hashed passwords
CREATE TABLE IF NOT EXISTS public.squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL, -- bcrypt hashed password
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: absensi
-- Stores attendance records with image proof
CREATE TABLE IF NOT EXISTS public.absensi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: announcements
-- Stores global announcements/broadcasts
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: mvps
-- Stores MVP rankings
CREATE TABLE IF NOT EXISTS public.mvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 3),
  nama VARCHAR(100) NOT NULL,
  pts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rank)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_absensi_nama ON public.absensi(nama);
CREATE INDEX IF NOT EXISTS idx_absensi_created_at ON public.absensi(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_mvps_rank ON public.mvps(rank);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on squad_members
CREATE TRIGGER update_squad_members_updated_at
  BEFORE UPDATE ON public.squad_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Note: Adjust these based on your Supabase auth setup

-- Enable RLS
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvps ENABLE ROW LEVEL SECURITY;

-- Allow public read access (since we handle auth via JWT in app)
CREATE POLICY "Allow public read access on squad_members" ON public.squad_members FOR SELECT USING (true);
CREATE POLICY "Allow public read access on absensi" ON public.absensi FOR SELECT USING (true);
CREATE POLICY "Allow public read access on announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public read access on mvps" ON public.mvps FOR SELECT USING (true);

-- Allow public insert/update/delete (auth is handled in application layer)
CREATE POLICY "Allow public insert on squad_members" ON public.squad_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on squad_members" ON public.squad_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on squad_members" ON public.squad_members FOR DELETE USING (true);

CREATE POLICY "Allow public insert on absensi" ON public.absensi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on announcements" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on announcements" ON public.announcements FOR DELETE USING (true);

CREATE POLICY "Allow public insert on mvps" ON public.mvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on mvps" ON public.mvps FOR DELETE USING (true);

-- Comments for documentation
COMMENT ON TABLE public.squad_members IS 'Stores squad member accounts with hashed passwords';
COMMENT ON TABLE public.absensi IS 'Attendance records with image proof URLs';
COMMENT ON TABLE public.announcements IS 'Global broadcast announcements';
COMMENT ON TABLE public.mvps IS 'MVP rankings and scores';
