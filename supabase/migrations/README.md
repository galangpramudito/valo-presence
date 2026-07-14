# Database Migrations

This directory contains SQL migration files for the MNG Absensi system.

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

### Option 2: Manual Application

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the content of each migration file in order
3. Execute them one by one

## Migration Files

- `20260715000001_initial_schema.sql` - Initial database schema (tables, indexes, RLS)
- `20260715000002_audit_logs.sql` - Audit logging system

## Important Notes

1. **Run migrations in order** - The timestamp prefix ensures correct execution order
2. **Backup first** - Always backup your database before running migrations
3. **RLS Policies** - Current policies allow public access since auth is handled in app layer. Adjust if needed.
4. **Password Migration** - Existing plaintext passwords need to be migrated to bcrypt hashes

## Password Migration Script

After running initial schema migration, existing users need password re-hashing:

```sql
-- This should be run AFTER users update their passwords through the new system
-- or you can manually hash existing passwords using bcrypt and update them

-- Example: Update a single user's password to bcrypt hash
UPDATE public.squad_members 
SET password = '$2a$10$...' -- bcrypt hash of 'MANGAN'
WHERE nama = 'EXISTING_USER';
```

## Storage Bucket Setup

Don't forget to create the storage bucket in Supabase:

1. Go to Storage in Supabase Dashboard
2. Create a new public bucket named `image`
3. Set up policies to allow public uploads and reads

## Helpful Commands

```bash
# Check migration status
supabase db status

# Create a new migration
supabase migration new migration_name

# Reset database (CAUTION: destroys all data)
supabase db reset
```
