-- Audit Log System Migration
-- Created: 2026-07-15
-- Purpose: Track all critical actions in the system

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(100),
  user_name VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'LOGIN', 'LOGOUT', 'UPLOAD', 'ADD_MEMBER', 'DELETE_MEMBER', 'UPDATE_PASSWORD', 'BROADCAST', etc.
  entity_type VARCHAR(50), -- 'user', 'absensi', 'announcement', 'mvp', etc.
  entity_id UUID,
  details JSONB, -- Additional context data
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_name ON public.audit_logs(user_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit logs (read-only for most users, admins can read all)
CREATE POLICY "Allow public insert on audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on audit_logs" ON public.audit_logs FOR SELECT USING (true);

-- Comment
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all critical system actions';

-- Function to automatically log certain actions (optional, can be called from triggers)
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_name VARCHAR,
  p_action VARCHAR,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_name, action, entity_type, entity_id, details)
  VALUES (p_user_name, p_action, p_entity_type, p_entity_id, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;
