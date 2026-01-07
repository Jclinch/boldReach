-- Migration
-- Date: 2026-01-07
-- Purpose: Add package_quantity to shipments for new shipment creation.
-- Notes:
--  - Safe to re-run.
--  - Existing rows default to 1.

BEGIN;

ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS package_quantity integer NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shipments_package_quantity_positive'
      AND conrelid = 'public.shipments'::regclass
  ) THEN
    ALTER TABLE public.shipments
      ADD CONSTRAINT shipments_package_quantity_positive
      CHECK (package_quantity >= 1);
  END IF;
END $$;

COMMIT;
