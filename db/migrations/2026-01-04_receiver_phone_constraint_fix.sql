-- Migration
-- Date: 2026-01-04
-- Purpose: Ensure shipments.receiver_phone format constraint matches the app's normalization.
--
-- Constraint target (local): exactly 11 digits (e.g. 08012345678).
-- This migration is safe to re-run.

BEGIN;

-- Normalize existing values before tightening the constraint.
-- Convert +234XXXXXXXXXX / 234XXXXXXXXXX into 0XXXXXXXXXX.
UPDATE public.shipments
SET receiver_phone = '0' || substr(regexp_replace(receiver_phone, '\\D', '', 'g'), 4)
WHERE receiver_phone IS NOT NULL
  AND regexp_replace(receiver_phone, '\\D', '', 'g') ~ '^234[0-9]{10}$';

UPDATE public.shipments
SET receiver_contact =
  CASE
    WHEN receiver_contact IS NULL THEN NULL
    WHEN (receiver_contact ? 'phone') THEN
      jsonb_set(
        receiver_contact,
        '{phone}',
        to_jsonb('0' || substr(regexp_replace(receiver_contact->>'phone', '\\D', '', 'g'), 4)),
        true
      )
    ELSE receiver_contact
  END
WHERE receiver_contact IS NOT NULL
  AND (receiver_contact ? 'phone')
  AND regexp_replace(receiver_contact->>'phone', '\\D', '', 'g') ~ '^234[0-9]{10}$';

-- Ensure DB-side sync logic matches the local-only format.
CREATE OR REPLACE FUNCTION public.fn_sync_receiver_phone()
RETURNS TRIGGER AS $$
DECLARE
  normalized text;
BEGIN
  normalized := NULL;

  IF NEW.receiver_phone IS NOT NULL AND btrim(NEW.receiver_phone) <> '' THEN
    normalized := NEW.receiver_phone;
  ELSIF NEW.receiver_contact IS NOT NULL AND (NEW.receiver_contact ? 'phone') THEN
    normalized := NEW.receiver_contact->>'phone';
  END IF;

  IF normalized IS NOT NULL THEN
    -- Digits only
    normalized := regexp_replace(normalized, '\\D', '', 'g');

    -- Convert country code format to local 11-digit format
    IF left(normalized, 3) = '234' AND length(normalized) = 13 THEN
      normalized := '0' || substr(normalized, 4);
    END IF;

    NEW.receiver_phone := normalized;
    NEW.receiver_contact := COALESCE(NEW.receiver_contact, '{}'::jsonb) || jsonb_build_object('phone', normalized);
  ELSE
    NEW.receiver_phone := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the constraint if it already exists (it might have been created with a stricter/incorrect regex).
ALTER TABLE public.shipments
  DROP CONSTRAINT IF EXISTS shipments_receiver_phone_format;

-- Recreate with the intended format.
ALTER TABLE public.shipments
  ADD CONSTRAINT shipments_receiver_phone_format
  CHECK (receiver_phone IS NULL OR receiver_phone ~ '^[0-9]{11}$');

COMMIT;
