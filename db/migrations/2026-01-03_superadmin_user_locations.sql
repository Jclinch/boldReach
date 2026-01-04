-- Non-destructive migration
-- Date: 2026-01-03
-- Purpose:
--   - Introduce super_admin role in public.users
--   - Add location to public.users for SuperAdmin-managed user provisioning
-- Notes:
--   - Safe to run multiple times.

BEGIN;

-- 1) Add location column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS location text;

-- 2) Expand role constraint to include super_admin
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_role_check'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_role_check;
  END IF;
END $$;

-- 3) Normalize existing role values BEFORE adding the constraint
--    Keep legacy 'admin' as a distinct role.
UPDATE public.users
SET role = CASE
  WHEN role IS NULL OR btrim(role) = '' THEN 'user'
  WHEN lower(role) IN ('superadmin', 'super_admin', 'super-admin', 'super admin') THEN 'super_admin'
  WHEN lower(role) IN ('admin') THEN 'admin'
  WHEN lower(role) IN ('user') THEN 'user'
  ELSE 'user'
END;

-- 4) Re-add role constraint allowing user/admin/super_admin
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'super_admin'::text]));

-- 5) Helpful index for filtering/reporting
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users (location);

COMMIT;
