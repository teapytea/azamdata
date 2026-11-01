create table public.connected_tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 160),
  normalized_name text not null check (char_length(normalized_name) between 1 and 160),
  domain text,
  account_email text,
  category text not null default 'unknown' check (category in ('ai', 'development', 'design', 'productivity', 'finance', 'other', 'unknown')),
  status text not null default 'unknown' check (status in ('account_only', 'free', 'trial', 'grant', 'paid', 'expired', 'cancelled', 'unknown')),
  plan_name text,
  billing_cycle text check (billing_cycle is null or billing_cycle in ('monthly', 'yearly', 'usage', 'none', 'unknown')),
  amount_minor bigint check (amount_minor is null or amount_minor >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  quota_remaining numeric check (quota_remaining is null or quota_remaining >= 0),
  quota_limit numeric check (quota_limit is null or quota_limit >= 0),
  quota_unit text,
  website_url text,
  confidence numeric(5,4) not null default 0 check (confidence between 0 and 1),
  first_discovered_at timestamptz not null default now(),
  last_discovered_at timestamptz not null default now(),
  last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  identity_key text generated always as (
    normalized_name || '|' || coalesce(lower(domain), '') || '|' || coalesce(lower(account_email), '')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, identity_key)
);

create index connected_tools_status_idx
  on public.connected_tools (user_id, status, last_discovered_at desc)
  where deleted_at is null;

create table public.discovery_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connected_tool_id uuid references public.connected_tools(id) on delete set null,
  source text not null check (source in ('google_connected_apps', 'gmail', 'provider_dashboard', 'manual')),
  evidence_type text not null check (evidence_type in ('account_connection', 'email', 'plan_status', 'billing', 'quota', 'manual_note')),
  source_ref_hash text not null check (char_length(source_ref_hash) = 64),
  title text check (title is null or char_length(title) <= 300),
  sender text check (sender is null or char_length(sender) <= 300),
  excerpt text check (excerpt is null or char_length(excerpt) <= 1200),
  evidence_date timestamptz,
  status_hint text check (status_hint is null or status_hint in ('account_only', 'free', 'trial', 'grant', 'paid', 'expired', 'cancelled', 'unknown')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, source, source_ref_hash)
);

create index discovery_evidence_tool_idx
  on public.discovery_evidence (connected_tool_id, evidence_date desc)
  where connected_tool_id is not null and deleted_at is null;

create table public.scan_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('google_connected_apps', 'gmail', 'provider_dashboard')),
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  records_found integer not null default 0 check (records_found >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index scan_jobs_latest_idx
  on public.scan_jobs (user_id, started_at desc)
  where deleted_at is null;

create table public.extension_pairings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique check (char_length(code_hash) = 64),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (expires_at > created_at)
);

create index extension_pairings_user_idx
  on public.extension_pairings (user_id, expires_at desc)
  where deleted_at is null;

create table public.extension_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  token_hash text not null unique check (char_length(token_hash) = 64),
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index extension_devices_user_idx
  on public.extension_devices (user_id, last_seen_at desc)
  where deleted_at is null;

create trigger discovery_evidence_tool_owner
  before insert or update of user_id, connected_tool_id on public.discovery_evidence
  for each row execute function public.enforce_owned_reference('connected_tool_id', 'connected_tools');

create or replace function public.claim_extension_pairing(
  pairing_code_hash text,
  device_name text,
  device_token_hash text
)
returns table (device_id uuid, owner_user_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_user_id uuid;
  claimed_device_id uuid;
begin
  update public.extension_pairings
  set claimed_at = now()
  where code_hash = pairing_code_hash
    and claimed_at is null
    and deleted_at is null
    and expires_at > now()
  returning user_id into claimed_user_id;

  if claimed_user_id is null then
    raise exception 'Pairing code is invalid, expired, or already used'
      using errcode = '22023';
  end if;

  insert into public.extension_devices (user_id, name, token_hash, last_seen_at)
  values (claimed_user_id, left(trim(device_name), 120), device_token_hash, now())
  returning id into claimed_device_id;

  return query select claimed_device_id, claimed_user_id;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'connected_tools', 'discovery_evidence', 'scan_jobs',
    'extension_pairings', 'extension_devices'
  ]
  loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy "Users manage their own rows" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );
    execute format('revoke all on public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end;
$$;

revoke all on function public.claim_extension_pairing(text, text, text) from public;
grant execute on function public.claim_extension_pairing(text, text, text) to service_role;
