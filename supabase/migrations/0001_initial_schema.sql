-- 0001_init.sql
-- Guanacaste Real — Supabase/Postgres schema

-- =========== Extensions ===========
create extension if not exists pgcrypto;         -- gen_random_uuid()
create extension if not exists pg_trgm;          -- trigram search
create extension if not exists vector;           -- pgvector for embeddings

-- =========== Helper (updated_at) ===========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- =========== Enums ===========
do $$ begin
  perform 1 from pg_type where typname = 'user_role';
  if not found then
    create type public.user_role as enum ('buyer','owner','realtor','admin');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'subscription_tier';
  if not found then
    create type public.subscription_tier as enum ('free','owner_featured','realtor_pro');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'billing_provider';
  if not found then
    create type public.billing_provider as enum ('stripe','paypal');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'subscription_status';
  if not found then
    create type public.subscription_status as enum ('active','past_due','canceled');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'property_status';
  if not found then
    create type public.property_status as enum ('draft','pending','published','suspended','archived');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'property_type';
  if not found then
    create type public.property_type as enum ('lot','house','condo','commercial','farm','hotel','mixed');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'currency_code';
  if not found then
    create type public.currency_code as enum ('USD','CRC');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'doc_type';
  if not found then
    create type public.doc_type as enum ('plano_catastrado','water_letter','tax_receipt','uso_de_suelo','permits','hoa_bylaws','escrow_instructions','other');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'media_kind';
  if not found then
    create type public.media_kind as enum ('photo','video','floorplan','tour3d');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'contact_method';
  if not found then
    create type public.contact_method as enum ('email','phone','whatsapp','in_app');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'verification_method';
  if not found then
    create type public.verification_method as enum ('id','ownership_attestation','doc_review');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'verification_status';
  if not found then
    create type public.verification_status as enum ('pending','verified','rejected');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'reported_entity';
  if not found then
    create type public.reported_entity as enum ('property','profile','message');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'boost_slot';
  if not found then
    create type public.boost_slot as enum ('home_hero','top_category','newsletter');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'title_type';
  if not found then
    create type public.title_type as enum ('titled','maritime_concession','cooperative','other');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'water_source';
  if not found then
    create type public.water_source as enum ('AYA','ASADA','well','truck','other');
  end if;
end $$;

do $$ begin
  perform 1 from pg_type where typname = 'alert_channel';
  if not found then
    create type public.alert_channel as enum ('email','whatsapp');
  end if;
end $$;

-- =========== Utility: admin check (for policies) ===========
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- =========== Tables ===========

-- profiles: mirrors auth.users(id) 1:1
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          public.user_role not null default 'buyer',
  full_name     text,
  phone_e164    text,
  locale        text not null default 'en',
  verified_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint phone_format_chk check (phone_e164 is null or phone_e164 ~ '^\+[1-9]\d{6,14}$')
);
comment on table public.profiles is 'User profiles keyed to auth.users(id).';
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- subscriptions
create table if not exists public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null references public.profiles(id) on delete cascade,
  tier                 public.subscription_tier not null,
  provider             public.billing_provider not null,
  status               public.subscription_status not null,
  current_period_end   timestamptz not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists idx_subscriptions_profile on public.subscriptions(profile_id);
create unique index if not exists uq_subscriptions_active_one
  on public.subscriptions(profile_id)
  where status = 'active';
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- properties
create table if not exists public.properties (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references public.profiles(id) on delete cascade,
  status            public.property_status not null default 'draft',
  title             text not null,
  type              public.property_type not null,
  price_numeric     numeric(14,2) not null check (price_numeric >= 0),
  currency          public.currency_code not null default 'USD',
  area_m2           integer check (area_m2 is null or area_m2 >= 0),
  lot_m2            integer check (lot_m2 is null or lot_m2 >= 0),
  beds              integer check (beds is null or beds >= 0),
  baths             integer check (baths is null or baths >= 0),
  year_built        integer check (year_built is null or year_built between 1800 and 2100),
  hoa               boolean,
  address_text      text,
  town              text,
  lat               numeric(8,6) check (lat is null or (lat >= -90 and lat <= 90)),
  lng               numeric(9,6) check (lng is null or (lng >= -180 and lng <= 180)),
  zoning_text       text,
  title_type        public.title_type not null default 'titled',
  concession_until  date,
  water_source      public.water_source,
  electric_provider text,
  internet_provider text,
  description_md    text,
  quality_score     integer not null default 0 check (quality_score between 0 and 100),
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  is_demo           boolean not null default false,
  -- Full-text search vector (generated; weights A=title, B=town, C=description)
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(town,'')),  'B') ||
    setweight(to_tsvector('simple', coalesce(description_md,'')), 'C')
  ) stored
);
create index if not exists idx_properties_owner on public.properties(owner_id);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_pub_at on public.properties(published_at);
create index if not exists idx_properties_search on public.properties using gin (search_vector);
create index if not exists idx_properties_title_trgm on public.properties using gin (title gin_trgm_ops);
create index if not exists idx_properties_point_gist on public.properties using gist (point(lng, lat));
create trigger trg_properties_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

-- overlays
create table if not exists public.overlays (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  overlay_type  text not null check (overlay_type in ('beach', 'clinic')),
  lat           numeric(8,6) not null check (lat >= -90 and lat <= 90),
  lng           numeric(9,6) not null check (lng >= -180 and lng <= 180),
  is_demo       boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists idx_overlays_name_trgm on public.overlays using gin (name gin_trgm_ops);
create index if not exists idx_overlays_point_gist on public.overlays using gist (point(lng, lat));

-- property_docs
create table if not exists public.property_docs (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties(id) on delete cascade,
  doc_type      public.doc_type not null,
  storage_path  text not null,
  is_public     boolean not null default false,
  verified      boolean not null default false,
  verified_at   timestamptz,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_docs_property on public.property_docs(property_id);
create index if not exists idx_docs_public on public.property_docs(property_id, is_public);
create trigger trg_property_docs_updated_at
before update on public.property_docs
for each row execute function public.set_updated_at();

-- Only one primary media per property (partial unique index)
-- media
create table if not exists public.media (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties(id) on delete cascade,
  kind          public.media_kind not null,
  storage_path  text not null,
  exif_json     jsonb,
  is_primary    boolean not null default false,
  order_idx     integer not null default 0 check (order_idx >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_media_property on public.media(property_id);
create unique index if not exists uq_media_primary_one
  on public.media(property_id)
  where is_primary is true;
create trigger trg_media_updated_at
before update on public.media
for each row execute function public.set_updated_at();

-- AI embeddings (global, verified-only content preferred)
create table if not exists public.ai_embeddings_global (
  id           uuid primary key default gen_random_uuid(),
  chunk        text not null,
  embedding    vector(1536) not null, -- adjust dim to your model
  source_ref   text not null,
  verified     boolean not null default false,
  verified_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists idx_ai_global_vec on public.ai_embeddings_global using ivfflat (embedding vector_l2_ops) with (lists = 100);
create index if not exists idx_ai_global_verified on public.ai_embeddings_global(verified);

-- AI embeddings (per property)
create table if not exists public.ai_embeddings_property (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  chunk        text not null,
  embedding    vector(1536) not null,
  source_ref   text not null,
  created_at   timestamptz not null default now()
);
create index if not exists idx_ai_prop_vec on public.ai_embeddings_property using ivfflat (embedding vector_l2_ops) with (lists = 100);
create index if not exists idx_ai_prop_property on public.ai_embeddings_property(property_id);

-- leads
create table if not exists public.leads (
  id                   uuid primary key default gen_random_uuid(),
  property_id          uuid not null references public.properties(id) on delete cascade,
  visitor_profile_id   uuid references public.profiles(id) on delete set null,
  contact_method       public.contact_method not null,
  message              text,
  consent_flags        jsonb,
  created_at           timestamptz not null default now()
);
create index if not exists idx_leads_property on public.leads(property_id);
create index if not exists idx_leads_visitor on public.leads(visitor_profile_id);

-- messages (simple threaded model)
create table if not exists public.messages (
  id                uuid primary key default gen_random_uuid(),
  thread_id         uuid not null, -- group messages logically
  property_id       uuid references public.properties(id) on delete set null,
  from_profile_id   uuid not null references public.profiles(id) on delete cascade,
  to_profile_id     uuid not null references public.profiles(id) on delete cascade,
  body              text not null,
  attachments       jsonb,
  read_at           timestamptz,
  created_at        timestamptz not null default now()
);
create index if not exists idx_messages_thread on public.messages(thread_id);
create index if not exists idx_messages_participants on public.messages(from_profile_id, to_profile_id);

-- saved searches & alerts
create table if not exists public.saved_searches (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  query_json   jsonb not null,
  created_at   timestamptz not null default now()
);
create index if not exists idx_saved_searches_profile on public.saved_searches(profile_id);

create table if not exists public.alerts (
  id                uuid primary key default gen_random_uuid(),
  saved_search_id   uuid not null references public.saved_searches(id) on delete cascade,
  channel           public.alert_channel not null,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);
create index if not exists idx_alerts_search on public.alerts(saved_search_id);

-- boosts
create table if not exists public.boosts (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  slot         public.boost_slot not null,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  created_at   timestamptz not null default now(),
  constraint boost_time_chk check (ends_at > starts_at)
);
create index if not exists idx_boosts_property on public.boosts(property_id);
create index if not exists idx_boosts_slot_time on public.boosts(slot, starts_at, ends_at);

-- verifications
create table if not exists public.verifications (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  method       public.verification_method not null,
  status       public.verification_status not null default 'pending',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_verifications_profile on public.verifications(profile_id);
create trigger trg_verifications_updated_at
before update on public.verifications
for each row execute function public.set_updated_at();

-- abuse reports
create table if not exists public.abuse_reports (
  id                   uuid primary key default gen_random_uuid(),
  reported_entity      public.reported_entity not null,
  entity_id            uuid not null,
  reporter_profile_id  uuid not null references public.profiles(id) on delete cascade,
  reason               text,
  created_at           timestamptz not null default now()
);
create index if not exists idx_abuse_entity on public.abuse_reports(reported_entity, entity_id);

-- audit logs
create table if not exists public.audit_logs (
  id                 uuid primary key default gen_random_uuid(),
  actor_profile_id   uuid references public.profiles(id) on delete set null,
  action             text not null,
  entity             text not null,
  entity_id          uuid not null,
  diff               jsonb,
  created_at         timestamptz not null default now()
);
create index if not exists idx_audit_entity on public.audit_logs(entity, entity_id);

-- content pages (verified cornerstone content)
create table if not exists public.content_pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  summary         text,
  body_md         text not null,
  last_verified_at timestamptz,
  sources         jsonb,           -- [{title, url}]
  author          text,
  reviewer        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_content_pages_updated_at
before update on public.content_pages
for each row execute function public.set_updated_at();

-- =========== Row Level Security ===========
alter table public.profiles          enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.properties        enable row level security;
alter table public.overlays          enable row level security;
alter table public.property_docs     enable row level security;
alter table public.media             enable row level security;
alter table public.ai_embeddings_global  enable row level security;
alter table public.ai_embeddings_property enable row level security;
alter table public.leads             enable row level security;
alter table public.messages          enable row level security;
alter table public.saved_searches    enable row level security;
alter table public.alerts            enable row level security;
alter table public.boosts            enable row level security;
alter table public.verifications     enable row level security;
alter table public.abuse_reports     enable row level security;
alter table public.audit_logs        enable row level security;
alter table public.content_pages     enable row level security;

-- ---- profiles
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select
on public.profiles for select
using ( id = auth.uid() or public.is_admin() );

drop policy if exists profiles_self_modify on public.profiles;
create policy profiles_self_modify
on public.profiles for update
using ( id = auth.uid() or public.is_admin() );

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert
on public.profiles for insert
with check ( id = auth.uid() or public.is_admin() );

-- ---- subscriptions (user sees own; admin sees all)
drop policy if exists subs_owner_select on public.subscriptions;
create policy subs_owner_select
on public.subscriptions for select
using ( profile_id = auth.uid() or public.is_admin() );

drop policy if exists subs_owner_modify on public.subscriptions;
create policy subs_owner_modify
on public.subscriptions for insert
with check ( profile_id = auth.uid() or public.is_admin() );

create policy subs_owner_update
on public.subscriptions for update
using ( profile_id = auth.uid() or public.is_admin() );

-- ---- properties
drop policy if exists props_public_read on public.properties;
create policy props_public_read
on public.properties for select
using ( status = 'published' or owner_id = auth.uid() or public.is_admin() or is_demo = true );

drop policy if exists props_owner_write on public.properties;
create policy props_owner_write
on public.properties for insert
with check ( owner_id = auth.uid() or public.is_admin() );

create policy props_owner_update
on public.properties for update
using ( owner_id = auth.uid() or public.is_admin() );

create policy props_owner_delete
on public.properties for delete
using ( owner_id = auth.uid() or public.is_admin() );

-- ---- overlays
drop policy if exists overlays_public_read on public.overlays;
create policy overlays_public_read
on public.overlays for select
using ( true );

drop policy if exists overlays_admin_write on public.overlays;
create policy overlays_admin_write
on public.overlays for all
using ( public.is_admin() ) with check ( public.is_admin() );

-- ---- media (inherits access via property)
drop policy if exists media_public_read on public.media;
create policy media_public_read
on public.media for select
using (
  exists (select 1 from public.properties p
          where p.id = media.property_id
            and (p.status='published' or p.owner_id = auth.uid() or public.is_admin() or p.is_demo = true))
);

drop policy if exists media_owner_write on public.media;
create policy media_owner_write
on public.media for insert
with check (
  exists (select 1 from public.properties p
          where p.id = media.property_id
            and (p.owner_id = auth.uid() or public.is_admin()))
);

create policy media_owner_update
on public.media for update
using (
  exists (select 1 from public.properties p
          where p.id = media.property_id
            and (p.owner_id = auth.uid() or public.is_admin()))
);

create policy media_owner_delete
on public.media for delete
using (
  exists (select 1 from public.properties p
          where p.id = media.property_id
            and (p.owner_id = auth.uid() or public.is_admin()))
);

-- ---- property_docs (public read only when both property is published AND is_public=true)
drop policy if exists docs_public_read on public.property_docs;
create policy docs_public_read
on public.property_docs for select
using (
  is_public is true and
  exists (select 1 from public.properties p
          where p.id = property_docs.property_id
            and p.status='published')
  or public.is_admin()
  or exists (select 1 from public.properties p where p.id=property_docs.property_id and p.owner_id=auth.uid())
);

drop policy if exists docs_owner_write on public.property_docs;
create policy docs_owner_write
on public.property_docs for insert
with check (
  exists (select 1 from public.properties p
          where p.id = property_docs.property_id
            and (p.owner_id = auth.uid() or public.is_admin()))
);

create policy docs_owner_update
on public.property_docs for update
using (
  exists (select 1 from public.properties p
          where p.id = property_docs.property_id
            and (p.owner_id = auth.uid() or public.is_admin()))
);

create policy docs_owner_delete
on public.property_docs for delete
using (
  exists (select 1 from public.properties p
          where p.id = property_docs.property_id
            and (p.owner_id = auth.uid() or public.is_admin()))
);

-- ---- ai_embeddings_* (service role only; accessed from Edge Functions)
-- To keep embeddings private, do NOT create open select policies.
-- If you prefer limited client reads, add a read policy scoped to published properties.
create policy ai_global_service_select
on public.ai_embeddings_global for select
using ( auth.role() = 'service_role' );

create policy ai_prop_service_select
on public.ai_embeddings_property for select
using ( auth.role() = 'service_role' );

create policy ai_prop_service_modify
on public.ai_embeddings_property for insert
with check ( auth.role() = 'service_role' );

create policy ai_global_service_modify
on public.ai_embeddings_global for insert
with check ( auth.role() = 'service_role' );

-- ---- leads
drop policy if exists leads_visibility on public.leads;
create policy leads_visibility
on public.leads for select
using (
  (visitor_profile_id = auth.uid())
  or public.is_admin()
  or exists (select 1 from public.properties p where p.id = leads.property_id and p.owner_id = auth.uid())
);

drop policy if exists leads_insert on public.leads;
create policy leads_insert
on public.leads for insert
with check ( true ); -- anyone can submit a lead (anonymous allowed via null visitor_profile_id)

-- ---- messages (participants or admin)
drop policy if exists msgs_visibility on public.messages;
create policy msgs_visibility
on public.messages for select
using ( from_profile_id = auth.uid() or to_profile_id = auth.uid() or public.is_admin() );

drop policy if exists msgs_insert on public.messages;
create policy msgs_insert
on public.messages for insert
with check ( from_profile_id = auth.uid() or public.is_admin() );

drop policy if exists msgs_update on public.messages;
create policy msgs_update
on public.messages for update
using ( from_profile_id = auth.uid() or to_profile_id = auth.uid() or public.is_admin() );

-- ---- saved searches & alerts (owner only)
create policy ss_select on public.saved_searches for select using (profile_id = auth.uid() or public.is_admin());
create policy ss_modify on public.saved_searches for insert with check (profile_id = auth.uid() or public.is_admin());
create policy ss_update on public.saved_searches for update using (profile_id = auth.uid() or public.is_admin());
create policy ss_delete on public.saved_searches for delete using (profile_id = auth.uid() or public.is_admin());

create policy alerts_select on public.alerts for select using (
  exists (select 1 from public.saved_searches s where s.id = alerts.saved_search_id and (s.profile_id = auth.uid() or public.is_admin()))
);
create policy alerts_modify on public.alerts for insert with check (
  exists (select 1 from public.saved_searches s where s.id = alerts.saved_search_id and (s.profile_id = auth.uid() or public.is_admin()))
);
create policy alerts_update on public.alerts for update using (
  exists (select 1 from public.saved_searches s where s.id = alerts.saved_search_id and (s.profile_id = auth.uid() or public.is_admin()))
);
create policy alerts_delete on public.alerts for delete using (
  exists (select 1 from public.saved_searches s where s.id = alerts.saved_search_id and (s.profile_id = auth.uid() or public.is_admin()))
);

-- ---- boosts (admin only)
create policy boosts_admin_select on public.boosts for select using (public.is_admin());
create policy boosts_admin_modify on public.boosts for all using (public.is_admin()) with check (public.is_admin());

-- ---- verifications (subject or admin)
create policy verif_select on public.verifications for select using (profile_id = auth.uid() or public.is_admin());
create policy verif_modify on public.verifications for insert with check (profile_id = auth.uid() or public.is_admin());
create policy verif_update on public.verifications for update using (profile_id = auth.uid() or public.is_admin());

-- ---- abuse reports (reporter or admin)
create policy abuse_select on public.abuse_reports for select using (reporter_profile_id = auth.uid() or public.is_admin());
create policy abuse_insert on public.abuse_reports for insert with check (reporter_profile_id = auth.uid() or public.is_admin());

-- ---- audit logs (admin only)
create policy audit_admin on public.audit_logs for select using (public.is_admin());
create policy audit_admin_write on public.audit_logs for insert with check (public.is_admin());

-- ---- content pages (public read; admin write)
create policy content_public_read on public.content_pages for select using (true);
create policy content_admin_write on public.content_pages for all using (public.is_admin()) with check (public.is_admin());

-- =========== Helpful defaults & comments ===========
comment on column public.properties.search_vector is 'Generated FTS vector (title/town/description).';
comment on column public.property_docs.is_public is 'If true AND property is published, doc can be shown publicly.';
comment on column public.ai_embeddings_global.verified is 'Only verified items are used for public answers by default.';

-- =========== Seed Data ===========
-- Seed admin account (assuming auth.users is handled separately)
insert into public.profiles (id, role, full_name, email) values
(gen_random_uuid(), 'admin', 'Admin User', 'admin@guanacaste.com')
on conflict do nothing;

-- Seed DEMO_ONLY properties
insert into public.properties (owner_id, status, title, type, price_numeric, currency, town, lat, lng, description_md, is_demo, published_at) values
((select id from public.profiles where role = 'admin' limit 1), 'published', 'Demo Beachfront House', 'house', 500000.00, 'USD', 'Tamarindo', 10.3000, -85.8000, 'Beautiful demo beachfront house in Guanacaste.', true, now()),
((select id from public.profiles where role = 'admin' limit 1), 'published', 'Demo Mountain Villa', 'house', 350000.00, 'USD', 'Liberia', 10.6000, -85.4000, 'Stunning demo villa in the mountains.', true, now());

-- Seed DEMO_ONLY overlays
insert into public.overlays (name, overlay_type, lat, lng, is_demo) values
('Playa Tamarindo', 'beach', 10.3000, -85.8000, true),
('Hospital Liberia', 'clinic', 10.6000, -85.4000, true);