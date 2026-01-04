-- Non-destructive migration
-- Date: 2026-01-03
-- Purpose:
--   - Add receiver phone support for shipments
--   - Extend history view to expose receiver phone
-- Notes:
--   - Safe to run multiple times.
--   - Does NOT drop columns/tables.

BEGIN;

-- 1) Add a dedicated receiver_phone column (kept in sync with receiver_contact->>'phone')
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS receiver_phone text;

-- 2) Keep receiver_phone and receiver_contact.phone synchronized
CREATE OR REPLACE FUNCTION public.fn_sync_receiver_phone()
RETURNS TRIGGER AS $$
DECLARE
  normalized text;
BEGIN
  -- Prefer explicit receiver_phone; otherwise derive from receiver_contact.phone
  normalized := NULL;

  IF NEW.receiver_phone IS NOT NULL AND btrim(NEW.receiver_phone) <> '' THEN
    normalized := NEW.receiver_phone;
  ELSIF NEW.receiver_contact IS NOT NULL AND (NEW.receiver_contact ? 'phone') THEN
    normalized := NEW.receiver_contact->>'phone';
  END IF;

  IF normalized IS NOT NULL THEN
    -- Normalize: keep digits and a single leading '+' only
    normalized := regexp_replace(normalized, '[^0-9+]', '', 'g');

    -- If '+' appears not at the start, strip all pluses
    IF position('+' in normalized) > 1 THEN
      normalized := regexp_replace(normalized, '\\+', '', 'g');
    END IF;

    -- If there are multiple leading '+', keep just one
    IF left(normalized, 1) = '+' THEN
      normalized := '+' || regexp_replace(substr(normalized, 2), '\\+', '', 'g');
    END IF;

    NEW.receiver_phone := normalized;
    NEW.receiver_contact := COALESCE(NEW.receiver_contact, '{}'::jsonb) || jsonb_build_object('phone', normalized);
  ELSE
    NEW.receiver_phone := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_receiver_phone ON public.shipments;
CREATE TRIGGER trg_sync_receiver_phone
BEFORE INSERT OR UPDATE OF receiver_phone, receiver_contact ON public.shipments
FOR EACH ROW EXECUTE PROCEDURE public.fn_sync_receiver_phone();

-- 3) Add a conservative format constraint (E.164-ish): optional '+' then 7..15 digits
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shipments_receiver_phone_format'
  ) THEN
    ALTER TABLE public.shipments
      ADD CONSTRAINT shipments_receiver_phone_format
      CHECK (receiver_phone IS NULL OR receiver_phone ~ '^\\+?[0-9]{7,15}$');
  END IF;
END $$;

-- 4) Extend the history view to include receiver_phone
--    (origin_location is already part of the view; we keep it and add receiver_phone)
DROP VIEW IF EXISTS public.v_shipments_history_list;

CREATE OR REPLACE VIEW public.v_shipments_history_list AS
SELECT
  s.id,
  s.user_id,
  s.tracking_number,
  s.origin_location,
  s.destination,
  COALESCE(s.receiver_phone, s.receiver_contact->>'phone') AS receiver_phone,
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

GRANT SELECT ON public.v_shipments_history_list TO authenticated;

COMMIT;
