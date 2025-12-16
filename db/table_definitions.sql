create table public.shipment_attachments (
  id uuid not null default gen_random_uuid (),
  shipment_id uuid null,
  bucket text null,
  path text null,
  url text null,
  filename text null,
  size_bytes integer null,
  mime_type text null,
  meta jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint shipment_attachments_pkey primary key (id),
  constraint shipment_attachments_shipment_id_fkey foreign KEY (shipment_id) references shipments (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_attachments_shipment_id on public.shipment_attachments using btree (shipment_id) TABLESPACE pg_default;
-------------

create table public.shipment_event_type_map (
  event_type text not null,
  progress_step public.shipment_progress_step not null,
  constraint shipment_event_type_map_pkey primary key (event_type)
) TABLESPACE pg_default;
---------

create table public.shipment_events (
  id uuid not null default gen_random_uuid (),
  shipment_id uuid null,
  event_type text not null,
  description text null,
  location text null,
  event_time timestamp with time zone not null default now(),
  created_by uuid null,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint shipment_events_pkey primary key (id),
  constraint shipment_events_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null,
  constraint shipment_events_shipment_id_fkey foreign KEY (shipment_id) references shipments (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_events_shipment_id on public.shipment_events using btree (shipment_id) TABLESPACE pg_default;

create trigger trg_sync_progress_step_on_event
after INSERT on shipment_events for EACH row
execute FUNCTION fn_sync_shipment_progress_step ();
------------------------

create table public.shipments (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  sender_name text not null,
  sender_contact jsonb null,
  receiver_name text not null,
  receiver_contact jsonb null,
  items_description text not null,
  weight numeric(10, 2) null,
  origin_location text null,
  destination text null,
  package_image_bucket text null,
  package_image_path text null,
  package_image_url text null,
  status public.shipment_status not null default 'created'::shipment_status,
  tracking_number text null,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone null,
  progress_step public.shipment_progress_step not null default 'pending'::shipment_progress_step,
  constraint shipments_pkey primary key (id),
  constraint shipments_tracking_number_key unique (tracking_number),
  constraint shipments_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_shipments_user_id on public.shipments using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_shipments_tracking_number on public.shipments using btree (tracking_number) TABLESPACE pg_default;

create index IF not exists idx_shipments_created_at on public.shipments using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_shipments_progress_step on public.shipments using btree (progress_step) TABLESPACE pg_default;

create trigger trg_set_updated_at_shipments BEFORE
update on shipments for EACH row
execute FUNCTION fn_set_updated_at ();

create trigger trg_generate_tracking_number BEFORE INSERT on shipments for EACH row
execute FUNCTION fn_generate_tracking_number ();
---------

create view public.v_shipments_history_list as
select
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
from
  shipments s
  left join lateral (
    select
      se.event_time as latest_event_time,
      se.event_type as latest_event_type,
      se.description as latest_event_description
    from
      shipment_events se
    where
      se.shipment_id = s.id
    order by
      se.event_time desc
    limit
      1
  ) le on true;
  ----------

  create view public.v_shipments_with_latest_event as
select
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
from
  shipments s
  left join lateral (
    select
      se.event_type as latest_event_type,
      se.event_time as latest_event_time
    from
      shipment_events se
    where
      se.shipment_id = s.id
    order by
      se.event_time desc
    limit
      1
  ) le on true;

  create table public.users (
  id uuid not null,
  email text not null,
  full_name text null,
  role text not null default 'user'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  last_sign_in_at timestamp with time zone null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint users_role_check check ((role = any (array['user'::text, 'admin'::text])))
) TABLESPACE pg_default;

create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

create index IF not exists idx_users_role on public.users using btree (role) TABLESPACE pg_default;

create trigger trg_prevent_role_change BEFORE
update on users for EACH row
execute FUNCTION prevent_role_change ();