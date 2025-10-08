-- Enable pgcrypto (uuid) and pgvector
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- KB documents (governance + content)
create table if not exists kb_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  topic text not null,
  location_scope text not null check (location_scope in ('guanacaste','national')),
  sensitivity text not null default 'public' check (sensitivity in ('public','internal','secret')),
  verified boolean not null default true,
  law_refs jsonb not null default '[]',
  content_md text not null,
  updated_at timestamptz not null default now()
);

-- Global embeddings table
create table if not exists embeddings_global (
  id bigserial primary key,
  kb_doc_id uuid references kb_docs(id) on delete cascade,
  chunk text not null,
  embedding vector(1536) not null,
  sensitivity text not null default 'public' check (sensitivity in ('public','internal','secret')),
  verified boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_embeddings_global_embedding on embeddings_global using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_embeddings_global_verified on embeddings_global (verified);
create index if not exists idx_embeddings_global_sensitivity on embeddings_global (sensitivity);

-- Optional property embeddings (if you vectorize listing text later)
create table if not exists embeddings_property (
  id bigserial primary key,
  property_id uuid not null,
  chunk text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_embeddings_property_embedding on embeddings_property using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Answer audit
create table if not exists answers_audit (
  id bigserial primary key,
  user_id uuid,
  ip text,
  question text not null,
  answer text not null,
  model text not null,
  citations jsonb not null,
  context_hash text not null,
  created_at timestamptz not null default now()
);

-- RLS (public read; writes via service role only)
alter table kb_docs enable row level security;
alter table embeddings_global enable row level security;
alter table embeddings_property enable row level security;
alter table answers_audit enable row level security;
create policy public_read_kb on kb_docs for select using (sensitivity = 'public');
create policy public_read_emb_global on embeddings_global for select using (sensitivity = 'public');

-- RPC: match_kb (global retrieval)
create or replace function match_kb(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  kb_doc_id uuid,
  chunk text,
  source_ref text,
  similarity float,
  verified boolean
)
language sql stable
as $$
  select
    g.kb_doc_id,
    g.chunk,
    d.title as source_ref,
    1 - (g.embedding <=> query_embedding) as similarity,
    g.verified
  from embeddings_global g
  join kb_docs d on d.id = g.kb_doc_id
  where g.sensitivity = 'public'
  order by g.embedding <=> query_embedding
  limit match_count
$$;

-- RPC: match_property (optional; if you later embed listing text)
create or replace function match_property(
  query_embedding vector(1536),
  prop_id uuid,
  match_count int default 5
)
returns table (
  property_id uuid,
  chunk text,
  similarity float
)
language sql stable
as $$
  select
    e.property_id,
    e.chunk,
    1 - (e.embedding <=> query_embedding) as similarity
  from embeddings_property e
  where e.property_id = prop_id
  order by e.embedding <=> query_embedding
  limit match_count
$$;