-- Update Existing Members Password to Hashed Version
-- Created: 2026-07-15
-- Purpose: Update plaintext passwords to bcrypt hashed passwords

-- Default password for all members: MANGAN
-- Bcrypt hash: $2b$10$TeNdPy6T.wgAIWeb9JPpWef3MgHWodTlDf7c6Aa1WIO5FMak7P0my

-- Update all existing members with plaintext password to hashed password
UPDATE public.squad_members
SET password = '$2b$10$TeNdPy6T.wgAIWeb9JPpWef3MgHWodTlDf7c6Aa1WIO5FMak7P0my'
WHERE password NOT LIKE '$2%' -- Only update non-hashed passwords
  AND role = 'user';

-- Update admin password if exists
-- Admin password: ADMIN123
-- Bcrypt hash: $2b$10$7PuxccOKLzKj/dAsLeYMZu5gE5JFMlEi8.MH36jb62.JyygroTIbC
UPDATE public.squad_members
SET password = '$2b$10$7PuxccOKLzKj/dAsLeYMZu5gE5JFMlEi8.MH36jb62.JyygroTIbC'
WHERE nama = 'ADMIN'
  AND password NOT LIKE '$2%';

-- Verify updated records
SELECT nama, role, 
       CASE 
         WHEN password LIKE '$2%' THEN 'HASHED ✓'
         ELSE 'PLAINTEXT ✗'
       END as password_status,
       created_at
FROM public.squad_members
ORDER BY role DESC, nama ASC;
