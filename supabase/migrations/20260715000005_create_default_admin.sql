-- Create Default Admin Account
-- Password: ADMIN123 (please change after first login!)
-- Created: 2026-07-15

-- Insert admin account if it doesn't exist
INSERT INTO public.squad_members (nama, password, role)
VALUES ('ADMIN', '$2b$10$2Klc4xHOg23ZDxvyZogwIODfXpG1MMmIaLls6Q.mIopeLqAaHADUy', 'admin')
ON CONFLICT (nama) DO NOTHING;
