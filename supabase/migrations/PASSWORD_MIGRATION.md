# Password Migration Guide

## Problem
Setelah implementasi bcrypt password hashing, password lama yang plaintext tidak bisa digunakan untuk login.

## Default Passwords (After Migration)

### Admin Account
- **Username**: `ADMIN`
- **Password**: `ADMIN123`

### Regular Members
- **Password**: `MANGAN` (untuk semua anggota)

## How to Migrate

### Option 1: Run SQL Migration (Recommended)
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi file `20260715000003_update_passwords.sql`
3. Execute
4. Semua password otomatis ter-hash dengan bcrypt

### Option 2: Manual via Supabase Dashboard
Update setiap member satu per satu:

```sql
-- Update specific member
UPDATE public.squad_members
SET password = '$2b$10$TeNdPy6T.wgAIWeb9JPpWef3MgHWodTlDf7c6Aa1WIO5FMak7P0my'
WHERE nama = 'NAMA_MEMBER';
```

### Option 3: Recreate Members via Admin Panel
1. Login sebagai ADMIN
2. Hapus member lama (jika ada)
3. Tambah member baru dengan password baru
4. Password otomatis ter-hash

## After Migration

Semua anggota bisa login dengan:
- Password: `MANGAN`

Admin tetap bisa login dengan:
- Username: `ADMIN`
- Password: `ADMIN123`

**PENTING**: Setelah login pertama kali, sangat disarankan untuk mengganti password melalui admin panel!

## Generate New Password Hash

Jika ingin generate hash untuk password baru:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_PASSWORD', 10));"
```

## Verify Migration Success

Run this query to check:

```sql
SELECT nama, role, 
       CASE 
         WHEN password LIKE '$2%' THEN 'HASHED ✓'
         ELSE 'PLAINTEXT ✗'
       END as password_status
FROM public.squad_members
ORDER BY role DESC, nama ASC;
```

Semua harus menunjukkan `HASHED ✓`.
