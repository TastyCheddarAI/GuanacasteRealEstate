-- Add reputation & expertise fields to contributors
alter table contributors add column if not exists rep_score numeric not null default 1, -- baseline
add column if not exists expertise jsonb not null default '[]', -- ["legal","local_expert","engineer",...]
add column if not exists badges jsonb not null default '[]', -- ["verified_notary","municipal_staff",...]
add column if not exists slashed boolean not null default false, -- hard flag for serious misconduct
add column if not exists rep_last_update timestamptz not null default now();

-- Voting policy enhancements
-- Weighted voting formula (default): base weight = rep_score; multipliers via badges
-- We'll store current snapshot per vote for auditability
alter table dao_votes add column if not exists weight_calc jsonb, -- snapshot: {rep: n, badge_mult: 1.2, final: n*1.2}
add column if not exists rep_snapshot numeric, -- contributor rep at vote time
add column if not exists badges_snapshot jsonb; -- badges at vote time

-- Proposal thresholds & auto-exec controls
alter table dao_proposals add column if not exists quorum numeric not null default 1, -- minimal total weight required
add column if not exists pass_ratio numeric not null default 0.6, -- yes / (yes+no) needed to pass
add column if not exists exec_fn text, -- optional server-side action name
add column if not exists executed_at timestamptz; -- when executed

-- Content outcome tracking (helps slashing & rewards)
create table if not exists kb_outcomes (
  id bigserial primary key,
  kb_doc_id uuid references kb_docs(id) on delete cascade,
  version_no int not null,
  outcome text not null check (outcome in ('approved','rejected','retracted','corrected')),
  decided_by uuid references contributors(id),
  notes text,
  created_at timestamptz not null default now()
);

-- Simple slashing registry
create table if not exists rep_slash_events (
  id bigserial primary key,
  contributor_id uuid references contributors(id),
  reason text not null,
  delta numeric not null, -- negative values slash; can be positive for reward
  related_doc uuid,
  adjudicator uuid references contributors(id), -- who triggered the slash
  created_at timestamptz not null default now()
);

-- Helper functions
-- Calculate badge multiplier: verified_notary (x1.3), municipal_staff (x1.2), legal (x1.15)
create or replace function badge_multiplier(badges jsonb)
returns numeric language plpgsql immutable as $$
declare mult numeric := 1;
begin
  if badges ? 'verified_notary' then mult := mult * 1.30; end if;
  if badges ? 'municipal_staff' then mult := mult * 1.20; end if;
  if badges ? 'legal' then mult := mult * 1.15; end if;
  if badges ? 'local_expert' then mult := mult * 1.10; end if;
  return mult;
end;
$$;

-- Compute current weight for a contributor (rep * badge multiplier); if slashed, clamp
create or replace function contributor_weight(c_id uuid)
returns numeric language plpgsql stable as $$
declare r record;
mult numeric;
w numeric;
begin
  select rep_score, badges, slashed into r from contributors where id=c_id;
  if not found then return 0; end if;
  if r.slashed then return 0.1; end if; -- hard clamp for slashed contributors
  mult := badge_multiplier(r.badges);
  w := greatest(0.1, r.rep_score) * mult;
  return w;
end;
$$;

-- Reputation updates
-- reward_type: 'doc_approved','doc_rejected','doc_retracted','attestation_good','attestation_bad','manual'
create or replace function reputation_update(c_id uuid, reward_type text, magnitude numeric, note text default '')
returns numeric language plpgsql as $$
declare cur numeric;
begin
  update contributors set rep_score = greatest(0, rep_score + magnitude), rep_last_update = now()
  where id = c_id returning rep_score into cur;
  insert into rep_slash_events (contributor_id, reason, delta, related_doc, adjudicator)
  values (c_id, reward_type || ': ' || note, magnitude, null, null);
  return cur;
end;
$$;

-- Slash or reward explicitly, linked to a doc and adjudicator
create or replace function reputation_slash(c_id uuid, delta numeric, reason text, doc uuid, judge uuid)
returns numeric language plpgsql as $$
declare cur numeric;
begin
  update contributors set
    rep_score = greatest(0, rep_score + delta), -- delta negative -> slash
    slashed = case when (rep_score + delta) < 0.5 then true else slashed end,
    rep_last_update = now()
  where id = c_id returning rep_score into cur;
  insert into rep_slash_events (contributor_id, reason, delta, related_doc, adjudicator)
  values (c_id, reason, delta, doc, judge);
  return cur;
end;
$$;

-- Tally a proposal with weights (snapshotting)
create or replace function dao_tally(proposal uuid)
returns table (yes numeric, no numeric, abstain numeric, total numeric)
language plpgsql as $$
declare v record;
y numeric := 0;
n numeric := 0;
a numeric := 0;
begin
  for v in select dv.*, c.rep_score, c.badges from dao_votes dv join contributors c on c.id = dv.voter where dv.proposal_id = proposal loop
    -- weight snapshot at tally time
    -- If snapshots missing, compute and store them
    if v.rep_snapshot is null or v.badges_snapshot is null or v.weight_calc is null then
      update dao_votes set
        rep_snapshot = v.rep_score,
        badges_snapshot = c.badges,
        weight_calc = jsonb_build_object(
          'rep', v.rep_score,
          'badge_mult', badge_multiplier(c.badges),
          'final', contributor_weight(v.voter)
        )
      where id = v.id;
    end if;
    if v.choice = 'yes' then y := y + contributor_weight(v.voter);
    elsif v.choice = 'no' then n := n + contributor_weight(v.voter);
    else a := a + contributor_weight(v.voter);
    end if;
  end loop;
  return query select y, n, a, (y+n+a);
end;
$$;

-- Decide proposal status based on quorum and pass_ratio
create or replace function dao_decide(proposal uuid)
returns text language plpgsql as $$
declare p record;
t record;
ratio numeric;
status text;
begin
  select * into p from dao_proposals where id = proposal;
  select * into t from dao_tally(proposal);
  if t.total < p.quorum then status := 'open';
  else
    ratio := case when (t.yes + t.no) > 0 then (t.yes / (t.yes + t.no)) else 0 end;
    if ratio >= p.pass_ratio then status := 'passed';
    else status := 'failed';
    end if;
  end if;
  update dao_proposals set status = status where id = proposal;
  return status;
end;
$$;

-- Execute proposal payloads after 'passed'
-- Supported exec_fn: 'publish_doc' -> calls kb_publish re-embed path (handled by your function endpoint),
-- 'reward_contributor', 'slash_contributor'
create or replace function dao_execute(proposal uuid)
returns text language plpgsql as $$
declare p record;
action text;
begin
  select * into p from dao_proposals where id = proposal;
  if p.status <> 'passed' then return 'not_passed'; end if;
  action := coalesce(p.payload->>'action', p.exec_fn);
  -- Execution is mostly app-layer; here we just mark executed and rely on functions/endpoints to act.
  update dao_proposals set executed_at = now(), status = 'executed' where id = proposal;
  return coalesce(action, 'noop');
end;
$$;