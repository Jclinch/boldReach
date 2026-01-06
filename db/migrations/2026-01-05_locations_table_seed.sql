-- Migration
-- Date: 2026-01-05
-- Purpose:
--   - Add DB-backed locations table
--   - Seed initial location list used by the app
-- Notes:
--   - Safe to re-run (idempotent)

BEGIN;

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique name so we can upsert by name.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'locations_name_key'
      AND conrelid = 'public.locations'::regclass
  ) THEN
    ALTER TABLE public.locations
      ADD CONSTRAINT locations_name_key UNIQUE (name);
  END IF;
END $$;

-- Helpful for ordering/searching.
CREATE INDEX IF NOT EXISTS idx_locations_active_name ON public.locations (is_active, name);

-- Seed initial locations (taken from previous hardcoded UI list).
INSERT INTO public.locations (name, is_active)
VALUES
  ('ASC-M-Darigo Communication 03 LTD-Lafia', true),
  ('ASC-M-Carosammy Concept Ltd-Benue', true),
  ('ASC-M-Crescita Global Resources Ltd-Adamawa', true),
  ('ASC-M-Don-Yellow Tech-Borno', true),
  ('ASC-M-Midas touch-Jos', true),
  ('ASC-M-Midas Touch-Kaduna', true),
  ('ASC-M-Zikniks-Maiduguri-Maiduguri', true),
  ('ASC-M-Zikniks-Minna-Minna', true),
  ('ASC-M-Zikniks-Suleja', true),
  ('ASRP ELOHIM GADGETS-Abuja', true),
  ('OSC-Carlcare-Abuja', true),
  ('OSC-Carlcare-Kano', true),
  ('CP-Abdul Hisbah Communication LTD-Damaturu', true),
  ('CP-Dynasteia Gwagwalada-Abuja', true),
  ('CP-Easy Way Comm (Anyigba)-Kogi', true),
  ('Cp-Jibo Ventures-Zamfara', true),
  ('CP-Excel phones idah-Kogi', true),
  ('ASC-M-Jufel-Tech Communications Ltd-Nasarawa', true),
  ('ASC-M-Magic Brother-Abuja', true),
  ('CP-May Royal Communication-Otukpo', true),
  ('ASC-M-Midas Touch Sokoto-Sokoto', true),
  ('CP-MOSIE SOLID HUB-Kuje', true),
  ('CP-Ndubest-Benue', true),
  ('ASC-M-Reedlim Global Enterprise-Bauchi', true),
  ('ASC-M-Reedlim Global Enterprise-Gombe', true),
  ('ASC-M-SmartPhone Global-Katsina', true),
  ('ASC-M-Smartphone Global Sensible-Duste', true),
  ('ASC-M-Smartphone Global Sensible-Funtua', true),
  ('ASC-M-Switrat limited-Mubi', true),
  ('ASC-M-Ustaz Exclusive Store-Jalingo', true),
  ('ASC-M-Yisab Nig. Ltd. (Lokoja)-Kogi', true)
ON CONFLICT (name) DO NOTHING;

COMMIT;
