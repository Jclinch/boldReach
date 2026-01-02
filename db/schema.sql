-- Supabase / Postgres SQL
-- File: create_shipments.sql
-- Purpose: Create all tables, types, sequences, triggers and RLS policies
-- required to persist data from the "New Shipment" page.
-- Run this in your Supabase SQL editor (or psql) as a superuser.

-- 1) Enable required extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Create a sequence for human-friendly tracking numbers
CREATE SEQUENCE IF NOT EXISTS shipment_tracking_seq START 100000;

-- 3) Create an enum type for shipment status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_status') THEN
    CREATE TYPE shipment_status AS ENUM (
      'draft',
      'created',
      'confirmed',
      'in_transit',
      'delivered',
      'cancelled',
      'returned'
    );
  END IF;
END$$;

-- 4) Main shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,

  -- Business fields from the New Shipment page
  sender_name text NOT NULL,
  sender_contact jsonb,        -- optional: {"phone": "...", "email": "..."}
  receiver_name text NOT NULL,
  receiver_contact jsonb,      -- optional: {"phone": "...", "email": "..."}
  items_description text NOT NULL,
  weight numeric(10,2),        -- weight in kg (supports decimals)
  origin_location text,
  destination text,
  shipment_date date,

  -- Image / attachment references (store storage bucket/path or public url)
  package_image_bucket text,
  package_image_path text,
  package_image_url text,

  -- Operational fields
  status shipment_status NOT NULL DEFAULT 'created',
  tracking_number text UNIQUE,

  metadata jsonb DEFAULT '{}'::jsonb, -- free-form metadata for extras

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- 5) Attachments table (supports multiple attachments per shipment)
CREATE TABLE IF NOT EXISTS public.shipment_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES public.shipments (id) ON DELETE CASCADE,
  bucket text,
  path text,
  url text,
  filename text,
  size_bytes integer,
  mime_type text,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6) Shipment events / history table (for tracking status changes)
CREATE TABLE IF NOT EXISTS public.shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES public.shipments (id) ON DELETE CASCADE,
  event_type text NOT NULL,        -- e.g. "created", "picked_up", "in_transit", "delivered"
  description text,
  location text,
  event_time timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7) Indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON public.shipments (user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON public.shipments (tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON public.shipments (created_at);
CREATE INDEX IF NOT EXISTS idx_attachments_shipment_id ON public.shipment_attachments (shipment_id);
CREATE INDEX IF NOT EXISTS idx_events_shipment_id ON public.shipment_events (shipment_id);

-- 8) Trigger function to set updated_at automatically
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to shipments
DROP TRIGGER IF EXISTS trg_set_updated_at_shipments ON public.shipments;
CREATE TRIGGER trg_set_updated_at_shipments
BEFORE UPDATE ON public.shipments
FOR EACH ROW EXECUTE PROCEDURE public.fn_set_updated_at();

-- 9) Trigger function to auto-generate a tracking number when none provided
CREATE OR REPLACE FUNCTION public.fn_generate_tracking_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_val bigint;
  prefix text := 'BR';
  date_part text;
BEGIN
  IF NEW.tracking_number IS NOT NULL AND NEW.tracking_number <> '' THEN
    RETURN NEW;
  END IF;

  seq_val := nextval('shipment_tracking_seq');
  date_part := to_char(now(), 'YYMMDD');

  -- Example: BR-251211-100001  (BR-{YYMMDD}-{seq})
  NEW.tracking_number := prefix || '-' || date_part || '-' || lpad(seq_val::text, 6, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to shipments BEFORE INSERT
DROP TRIGGER IF EXISTS trg_generate_tracking_number ON public.shipments;
CREATE TRIGGER trg_generate_tracking_number
BEFORE INSERT ON public.shipments
FOR EACH ROW EXECUTE PROCEDURE public.fn_generate_tracking_number();

-- 10) Row Level Security (RLS) policies so users can only access their own shipments
-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

-- Shipments policies:
-- Allow SELECT for owner
CREATE POLICY "shipments_select_owner" ON public.shipments
  FOR SELECT USING (auth.uid() = user_id);

-- Allow INSERT only when auth.uid() = user_id
CREATE POLICY "shipments_insert_owner" ON public.shipments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow UPDATE only when owner
CREATE POLICY "shipments_update_owner" ON public.shipments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow DELETE only when owner
CREATE POLICY "shipments_delete_owner" ON public.shipments
  FOR DELETE USING (auth.uid() = user_id);

-- Attachments policies:
CREATE POLICY "attachments_select_owner" ON public.shipment_attachments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_attachments.shipment_id AND s.user_id = auth.uid()));

CREATE POLICY "attachments_insert_owner" ON public.shipment_attachments
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_attachments.shipment_id AND s.user_id = auth.uid()));

CREATE POLICY "attachments_delete_owner" ON public.shipment_attachments
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_attachments.shipment_id AND s.user_id = auth.uid()));

-- Events policies:
CREATE POLICY "events_select_owner" ON public.shipment_events
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_events.shipment_id AND s.user_id = auth.uid()));

CREATE POLICY "events_insert_owner" ON public.shipment_events
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_events.shipment_id AND s.user_id = auth.uid()));

CREATE POLICY "events_delete_owner" ON public.shipment_events
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.shipments s WHERE s.id = shipment_events.shipment_id AND s.user_id = auth.uid()));

-- Note: service_role (server-side) requests bypass RLS when using Supabase service key.
-- If you want to allow public read access to shipments for specific roles, create additional policies.

-- 11) Example helper view: shipments with latest event
CREATE OR REPLACE VIEW public.v_shipments_with_latest_event AS
SELECT
  s.*,
  le.latest_event_type,
  le.latest_event_time
FROM public.shipments s
LEFT JOIN LATERAL (
  SELECT se.event_type AS latest_event_type, se.event_time AS latest_event_time
  FROM public.shipment_events se
  WHERE se.shipment_id = s.id
  ORDER BY se.event_time DESC
  LIMIT 1
) le ON true;

-- 12) Grant usage to anon/authenticated roles if you want (optional)
-- WARNING: granting too much to anon may expose data. Use policies first.
-- Example: allow authenticated role to call SELECT on v_shipments_with_latest_event (policies on underlying tables still apply).
GRANT SELECT ON public.v_shipments_with_latest_event TO authenticated;

-- 13) Final sanity check comment:
-- After running this file:
--  - Use Supabase Storage to store actual files (buckets). Save bucket + path in package_image_bucket / package_image_path.
--  - Save a public or signed URL in package_image_url if you need direct access.
--  - Insert shipments either client-side (with RLS/INSERT policy) or server-side using the service role key.

-- Fix: recreate dependent views without referencing a non-existent column
-- Error encountered: "column s.estimated_delivery_date does not exist"
-- This script drops and recreates the views that reference shipments.status
-- and ensures they do NOT reference estimated_delivery_date.
--
-- Run as a DB admin in Supabase SQL editor or psql. It's safe to run multiple times.

--updated script for shipments.status
BEGIN;

-- Drop views if present (these depend on shipments.status)
DROP VIEW IF EXISTS public.v_shipments_with_latest_event CASCADE;
DROP VIEW IF EXISTS public.v_shipments_history_list CASCADE;

-- Recreate v_shipments_with_latest_event without estimated_delivery_date
CREATE OR REPLACE VIEW public.v_shipments_with_latest_event AS
SELECT
  s.id,
  s.user_id,
  s.sender_name,
  s.sender_contact,
  s.receiver_name,
  s.receiver_contact,
  s.items_description,
  s.weight,
  s.origin_location,
  s.destination,
  s.package_image_bucket,
  s.package_image_path,
  s.package_image_url,
  s.status,
  s.tracking_number,
  s.metadata,
  s.created_at,
  s.updated_at,
  s.deleted_at,
  le.latest_event_type,
  le.latest_event_time
FROM
  public.shipments s
  LEFT JOIN LATERAL (
    SELECT
      se.event_type AS latest_event_type,
      se.event_time AS latest_event_time
    FROM
      public.shipment_events se
    WHERE
      se.shipment_id = s.id
    ORDER BY
      se.event_time DESC
    LIMIT 1
  ) le ON true;

-- Recreate v_shipments_history_list without estimated_delivery_date
CREATE OR REPLACE VIEW public.v_shipments_history_list AS
SELECT
  s.id,
  s.user_id,
  s.tracking_number,
  s.origin_location,
  s.destination,
  s.items_description,
  s.weight,
  s.status,
  s.created_at,
  le.latest_event_time,
  le.latest_event_type,
  le.latest_event_description
FROM public.shipments s
LEFT JOIN LATERAL (
  SELECT
    se.event_time AS latest_event_time,
    se.event_type AS latest_event_type,
    se.description AS latest_event_description
  FROM public.shipment_events se
  WHERE se.shipment_id = s.id
  ORDER BY se.event_time DESC
  LIMIT 1
) le ON true;

-- (Optional) Grant SELECT to authenticated role if desired
GRANT SELECT ON public.v_shipments_with_latest_event TO authenticated;
GRANT SELECT ON public.v_shipments_history_list TO authenticated;

COMMIT;

-- End of file