-- Application-level schema export (exclude Supabase-managed schemas/services)
-- Paste this into Supabase SQL editor on a new project/database

-- Create enums used by your app
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_progress_step') THEN
    CREATE TYPE public.shipment_progress_step AS ENUM ('pending','in_transit','out_for_delivery','delivered');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_status') THEN
    CREATE TYPE public.shipment_status AS ENUM ('draft','created','confirmed','in_transit','delivered','cancelled','returned');
  END IF;
END
$$;

-- Table: public.shipments
CREATE TABLE IF NOT EXISTS public.shipments (
  progress_step public.shipment_progress_step DEFAULT 'pending'::public.shipment_progress_step,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status public.shipment_status DEFAULT 'created'::public.shipment_status,
  metadata jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  sender_name text,
  sender_contact jsonb,
  receiver_name text,
  receiver_contact jsonb,
  items_description text,
  weight numeric,
  origin_location text,
  destination text,
  package_image_bucket text,
  package_image_path text,
  package_image_url text,
  tracking_number text UNIQUE,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Table: public.shipment_attachments
CREATE TABLE IF NOT EXISTS public.shipment_attachments (
  shipment_id uuid,
  bucket text,
  path text,
  url text,
  filename text,
  size_bytes integer,
  mime_type text,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.shipment_attachments ENABLE ROW LEVEL SECURITY;

-- Table: public.shipment_events
CREATE TABLE IF NOT EXISTS public.shipment_events (
  shipment_id uuid,
  event_type text,
  description text,
  location text,
  created_by uuid,
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_time timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

-- Table: public.shipment_event_type_map
CREATE TABLE IF NOT EXISTS public.shipment_event_type_map (
  event_type text PRIMARY KEY,
  progress_step public.shipment_progress_step
);

-- Table: public.users (app-level)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  full_name text,
  last_sign_in_at timestamptz,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Foreign keys (commented out if auth schema is not present)
-- Uncomment the following if you have the auth schema & auth.users table present.

-- ALTER TABLE public.shipments
--   ADD CONSTRAINT shipments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE public.shipment_events
  ADD CONSTRAINT shipment_events_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);

-- If you replicate auth.users, enable created_by FK to auth.users:
-- ALTER TABLE public.shipment_events
--   ADD CONSTRAINT shipment_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.shipment_attachments
  ADD CONSTRAINT shipment_attachments_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);

-- Helpful indexes (add if needed)
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON public.shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_attachments_shipment_id ON public.shipment_attachments(shipment_id);

-- Notes:
-- 1) gen_random_uuid() requires the pgcrypto extension. If not available, run:
--    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--    (Supabase projects typically have pgcrypto installed)
-- 2) RLS policies are not exported. Enable and create policies appropriate for your app after import.
-- 3) If you want me to also export RLS policies, triggers, functions, or seed data, tell me which ones.

-- Enable RLS on public tables (idempotent)
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Recommended helper: function to safely get current user id (optional)
-- This function simply returns auth.uid() and is SECURITY DEFINER so policies can call it.
-- If you prefer not to create functions, policies can use (SELECT auth.uid()) inline.
CREATE OR REPLACE FUNCTION public.current_user_id() RETURNS uuid
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.current_user_id() FROM PUBLIC;
-- Note: Revoke from PUBLIC so only roles with explicit grants can call if desired.

-- Policies for public.users
-- Allow a user to read their own profile
CREATE POLICY "Users: select own profile" ON public.users
  FOR SELECT TO authenticated
  USING ((public.current_user_id() IS NOT NULL) AND (id = public.current_user_id()));

-- Allow users to update their own profile
CREATE POLICY "Users: update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (id = public.current_user_id())
  WITH CHECK (id = public.current_user_id());

-- Allow authenticated users to create their profile (only for their own id)
CREATE POLICY "Users: insert own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = public.current_user_id());

-- Optionally allow admins to manage all users (uncomment & adjust role check if you set admin claim)
-- CREATE POLICY "Users: admin access" ON public.users
--   FOR ALL TO authenticated
--   USING ((auth.jwt() ->> 'user_role') = 'admin');

-- Policies for public.shipments
-- Allow authenticated users to SELECT shipments where they are the owner
CREATE POLICY "Shipments: select own" ON public.shipments
  FOR SELECT TO authenticated
  USING (user_id = public.current_user_id());

-- Allow users to INSERT shipments but ensure user_id matches auth.uid()
CREATE POLICY "Shipments: insert own" ON public.shipments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_user_id());

-- Allow users to UPDATE shipments they own
CREATE POLICY "Shipments: update own" ON public.shipments
  FOR UPDATE TO authenticated
  USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

-- Allow users to DELETE shipments they own
CREATE POLICY "Shipments: delete own" ON public.shipments
  FOR DELETE TO authenticated
  USING (user_id = public.current_user_id());

-- Policies for public.shipment_attachments
-- Users can read attachments for shipments they own (join to shipments)
CREATE POLICY "Shipment attachments: select by shipment owner" ON public.shipment_attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  );

-- Allow insert only if the user owns the referenced shipment
CREATE POLICY "Shipment attachments: insert by shipment owner" ON public.shipment_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  );

-- Allow update/delete only if the user owns the referenced shipment
CREATE POLICY "Shipment attachments: update by shipment owner" ON public.shipment_attachments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  );

CREATE POLICY "Shipment attachments: delete by shipment owner" ON public.shipment_attachments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  );

-- Policies for public.shipment_events
-- Users can view events for shipments they own
CREATE POLICY "Shipment events: select by shipment owner" ON public.shipment_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  );

-- Allow users to insert events only if they own the shipment or are the creator (created_by)
CREATE POLICY "Shipment events: insert by shipment owner or creator" ON public.shipment_events
  FOR INSERT TO authenticated
  WITH CHECK (
    (created_by = public.current_user_id())
    OR EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  );

-- Allow update/delete only if the user created the event or owns the shipment
CREATE POLICY "Shipment events: update by owner/creator" ON public.shipment_events
  FOR UPDATE TO authenticated
  USING (
    (created_by = public.current_user_id())
    OR EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  )
  WITH CHECK (
    (created_by = public.current_user_id())
    OR EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  );

CREATE POLICY "Shipment events: delete by owner/creator" ON public.shipment_events
  FOR DELETE TO authenticated
  USING (
    (created_by = public.current_user_id())
    OR EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id
      AND s.user_id = public.current_user_id()
    )
  );

-- Optional: allow service_role to bypass RLS (service_role JWT has role claim 'service_role')
-- DO NOT enable for anon users. Uncomment if you want server-side code to bypass RLS via JWT claim.
-- CREATE POLICY "Service role bypass" ON public.shipments
--   FOR ALL TO authenticated
--   USING ((auth.jwt() ->> 'role') = 'service_role');

-- Validate policies by running a simple query as an authenticated user in your app.
-- Example: SELECT * FROM public.shipments; (should only return rows where user_id = auth.uid())