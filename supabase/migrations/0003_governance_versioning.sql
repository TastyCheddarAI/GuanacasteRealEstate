-- PREREQS
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- CONTRIBUTORS: who can propose/curate content
create table if not exists contributors (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text not null,
  role text not null check (role in ('admin','curator','author','viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- SOURCE REGISTRY: where facts come from (laws, PDFs, municipal plans)
create table if not exists kb_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null check (source_type in ('law','municipal_plan','guide','website','pdf','dataset')),
  url text,
  jurisdiction text, -- e.g., 'Santa Cruz', 'Carrillo', 'Nicoya', 'National'
  summary text,
  added_by uuid references contributors(id),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MUNICIPAL INDEX
create table if not exists municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  canton text not null, -- e.g., 'Santa Cruz', 'Carrillo', 'Nicoya', 'Liberia'
  region text not null default 'Guanacaste',
  plan_regulador_url text, -- official link if any
  notes text,
  created_at timestamptz not null default now()
);

-- VERSIONING: every kb_doc has immutable versions
create table if not exists kb_doc_versions (
  id uuid primary key default gen_random_uuid(),
  kb_doc_id uuid references kb_docs(id) on delete cascade,
  version_no int not null,
  title text not null,
  topic text not null,
  location_scope text not null,
  sensitivity text not null,
  verified boolean not null,
  law_refs jsonb not null default '[]',
  content_md text not null,
  changelog text not null default '',
  created_by uuid references contributors(id),
  created_at timestamptz not null default now(),
  unique (kb_doc_id, version_no)
);

-- PUBLISH QUEUE: proposed new docs or updates awaiting review
create table if not exists kb_publish_queue (
  id uuid primary key default gen_random_uuid(),
  proposed_doc jsonb not null, -- frontmatter + content_md
  proposed_by uuid references contributors(id),
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  reviewer uuid references contributors(id),
  review_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- DOC ↔ SOURCE LINKS (provenance)
create table if not exists kb_doc_sources (
  id bigserial primary key,
  kb_doc_id uuid references kb_docs(id) on delete cascade,
  source_id uuid references kb_sources(id) on delete cascade,
  note text,
  unique (kb_doc_id, source_id)
);

-- ATTESTATIONS: who checked what
create table if not exists kb_attestations (
  id bigserial primary key,
  kb_doc_id uuid references kb_docs(id) on delete cascade,
  contributor_id uuid references contributors(id),
  level text not null check (level in ('fact-check','legal-review','local-expert')),
  comment text,
  created_at timestamptz not null default now()
);

-- DAO PROPOSALS/VOTES (light-weight)
create table if not exists dao_proposals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  payload jsonb not null, -- e.g., {"action":"publish_doc","kb_doc_id":"...","version":2}
  status text not null check (status in ('open','passed','failed','executed')) default 'open',
  created_by uuid references contributors(id),
  created_at timestamptz not null default now(),
  closes_at timestamptz not null default (now() + interval '7 days')
);

create table if not exists dao_votes (
  id bigserial primary key,
  proposal_id uuid references dao_proposals(id) on delete cascade,
  voter uuid references contributors(id),
  choice text not null check (choice in ('yes','no','abstain')),
  weight numeric not null default 1,
  created_at timestamptz not null default now(),
  unique (proposal_id, voter)
);

-- RLS
alter table contributors enable row level security;
alter table kb_sources enable row level security;
alter table municipalities enable row level security;
alter table kb_doc_versions enable row level security;
alter table kb_publish_queue enable row level security;
alter table kb_doc_sources enable row level security;
alter table kb_attestations enable row level security;
alter table dao_proposals enable row level security;
alter table dao_votes enable row level security;

-- Policies (public read where safe; writes via service role)
create policy public_read_contributors on contributors for select using (true);
create policy public_read_sources on kb_sources for select using (verified = true);
create policy public_read_munis on municipalities for select using (true);
create policy public_read_versions on kb_doc_versions for select using (true);
create policy public_read_publish_queue on kb_publish_queue for select using (false); -- private
create policy public_read_doc_sources on kb_doc_sources for select using (true);
create policy public_read_attest on kb_attestations for select using (true);
create policy public_read_proposals on dao_proposals for select using (true);
create policy public_read_votes on dao_votes for select using (true);

-- WRITE policies (service role only; you can extend with auth.jwt() claims)
create policy svc_write_contributors on contributors for all using (false) with check (false);
create policy svc_write_sources on kb_sources for all using (false) with check (false);
create policy svc_write_munis on municipalities for all using (false) with check (false);
create policy svc_write_versions on kb_doc_versions for all using (false) with check (false);
create policy svc_write_queue on kb_publish_queue for all using (false) with check (false);
create policy svc_write_doc_sources on kb_doc_sources for all using (false) with check (false);
create policy svc_write_attest on kb_attestations for all using (false) with check (false);
create policy svc_write_proposals on dao_proposals for all using (false) with check (false);
create policy svc_write_votes on dao_votes for all using (false) with check (false);

-- Helper RPCs
-- Create or get contributor
create or replace function upsert_contributor(p_email text, p_name text, p_role text)
returns uuid language plpgsql as $$
declare cid uuid;
begin
  insert into contributors (email, display_name, role) values (p_email, p_name, p_role)
  on conflict (email) do update set display_name=excluded.display_name, role=excluded.role
  returning id into cid;
  return cid;
end;
$$;

-- Propose new/updated doc to the queue
create or replace function queue_proposed_doc(p_doc jsonb, p_contributor uuid)
returns uuid language plpgsql as $$
declare qid uuid;
begin
  insert into kb_publish_queue (proposed_doc, proposed_by) values (p_doc, p_contributor)
  returning id into qid;
  return qid;
end;
$$;

-- Approve queue item → write to kb_docs + kb_doc_versions
create or replace function approve_queue_item(p_queue_id uuid, p_reviewer uuid, p_changelog text)
returns uuid language plpgsql as $$
declare q record;
doc_id uuid;
vnum int;
begin
  select * into q from kb_publish_queue where id=p_queue_id for update;
  if q.status <> 'pending' then raise exception 'Not pending'; end if;

  -- Extract fields
  -- expected p_doc schema: {title, topic, location_scope, sensitivity, verified, law_refs, content_md}
  -- If new doc, insert; else update existing by title/topic combo (simple heuristic — adjust as needed)
  select id into doc_id from kb_docs where title = (q.proposed_doc->>'title') and topic = (q.proposed_doc->>'topic') limit 1;
  if doc_id is null then
    insert into kb_docs (title, topic, location_scope, sensitivity, verified, law_refs, content_md)
    values (
      q.proposed_doc->>'title',
      q.proposed_doc->>'topic',
      q.proposed_doc->>'location_scope',
      coalesce(q.proposed_doc->>'sensitivity','public'),
      coalesce((q.proposed_doc->>'verified')::boolean, true),
      coalesce(q.proposed_doc->'law_refs','[]'::jsonb),
      q.proposed_doc->>'content_md'
    ) returning id into doc_id;
    vnum := 1;
  else
    -- increment version
    select coalesce(max(version_no),0)+1 into vnum from kb_doc_versions where kb_doc_id=doc_id;
    -- update working copy for latest content (kb_docs mirrors latest for retrieval convenience)
    update kb_docs set
      location_scope = q.proposed_doc->>'location_scope',
      sensitivity = coalesce(q.proposed_doc->>'sensitivity','public'),
      verified = coalesce((q.proposed_doc->>'verified')::boolean, true),
      law_refs = coalesce(q.proposed_doc->'law_refs','[]'::jsonb),
      content_md = q.proposed_doc->>'content_md',
      updated_at = now()
    where id=doc_id;
  end if;

  -- Write immutable version row
  insert into kb_doc_versions (
    kb_doc_id, version_no, title, topic, location_scope, sensitivity, verified, law_refs, content_md, changelog, created_by
  ) values (
    doc_id, vnum,
    q.proposed_doc->>'title',
    q.proposed_doc->>'topic',
    q.proposed_doc->>'location_scope',
    coalesce(q.proposed_doc->>'sensitivity','public'),
    coalesce((q.proposed_doc->>'verified')::boolean, true),
    coalesce(q.proposed_doc->'law_refs','[]'::jsonb),
    q.proposed_doc->>'content_md',
    p_changelog,
    p_reviewer
  );

  -- Mark queue item
  update kb_publish_queue set status='approved', reviewer=p_reviewer, review_notes=p_changelog, reviewed_at=now()
  where id=p_queue_id;

  return doc_id;
end;
$$;

-- Reject queue item (with notes)
create or replace function reject_queue_item(p_queue_id uuid, p_reviewer uuid, p_notes text)
returns void language plpgsql as $$
begin
  update kb_publish_queue set status='rejected', reviewer=p_reviewer, review_notes=p_notes, reviewed_at=now()
  where id=p_queue_id;
end;
$$;

-- Link doc to sources (bulk)
create or replace function link_doc_sources(p_kb_doc_id uuid, p_source_ids uuid[])
returns void language plpgsql as $$
begin
  insert into kb_doc_sources(kb_doc_id, source_id)
  select p_kb_doc_id, unnest(p_source_ids)
  on conflict do nothing;
end;
$$;