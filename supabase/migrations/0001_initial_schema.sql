-- Bond — Phase 1 schema + RLS migration
-- Confirm before running against your Supabase project.

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users select own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);

create index idx_profiles_username on public.profiles (username);

-- ============================================================
-- CONNECTIONS (must exist before avatars, interactions, gifts, rooms)
-- ============================================================
create table public.connections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  partner_id uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'pending'
             check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, partner_id)
);

alter table public.connections enable row level security;

create policy "user sees own connections" on public.connections
  for select using (
    auth.uid() = user_id or auth.uid() = partner_id
  );

create policy "user initiates own connection" on public.connections
  for insert with check (auth.uid() = user_id);

create policy "user updates own connection" on public.connections
  for update using (auth.uid() = user_id or auth.uid() = partner_id);

create index idx_connections_user on public.connections (user_id);
create index idx_connections_partner on public.connections (partner_id);

-- ============================================================
-- AVATARS
-- ============================================================
create table public.avatars (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  character  text not null,
  face       text not null,
  hair       text not null,
  outfit     text not null,
  accessory  text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

alter table public.avatars enable row level security;

create policy "avatar visible to owner or connection" on public.avatars
  for select using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.connections c
      where c.status = 'accepted'
        and (
          (c.user_id = auth.uid() and c.partner_id = avatars.owner_id)
          or (c.partner_id = auth.uid() and c.user_id = avatars.owner_id)
        )
    )
  );

create policy "owner inserts own avatar" on public.avatars
  for insert with check (auth.uid() = owner_id);

create policy "owner updates own avatar" on public.avatars
  for update using (auth.uid() = owner_id);

create index idx_avatars_owner on public.avatars (owner_id);

-- ============================================================
-- LOVE CODES
-- ============================================================
create table public.love_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  used_by    uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.love_codes enable row level security;

-- Codes are meant to be shared; any authenticated user may look one up by
-- its code string during the claim flow. The owner can always see their own.
create policy "codes readable by authenticated users" on public.love_codes
  for select using (auth.role() = 'authenticated');

-- The owner can list/keep their own codes, and the claimer can mark a code
-- as used (setting used_by) when claiming it.
create policy "any user can create a code entry" on public.love_codes
  for insert with check (auth.uid() = owner_id or used_by = auth.uid());

create policy "owner or claimer updates code" on public.love_codes
  for update using (auth.uid() = owner_id or auth.uid() = used_by);

create index idx_love_codes_owner on public.love_codes (owner_id);
create index idx_love_codes_code on public.love_codes (code);

-- ============================================================
-- INTERACTIONS
-- ============================================================
create table public.interactions (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  type         text not null,
  animation_id text not null,
  created_at   timestamptz not null default now()
);

alter table public.interactions enable row level security;

create policy "sender or receiver reads interaction" on public.interactions
  for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "sender writes interaction" on public.interactions
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.connections c
      where c.status = 'accepted'
        and (
          (c.user_id = auth.uid() and c.partner_id = interactions.receiver_id)
          or (c.partner_id = auth.uid() and c.user_id = interactions.receiver_id)
        )
    )
  );

create index idx_interactions_sender on public.interactions (sender_id);
create index idx_interactions_receiver on public.interactions (receiver_id);
create index idx_interactions_created on public.interactions (created_at desc);

-- ============================================================
-- GIFTS
-- ============================================================
create table public.gifts (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  gift_type   text not null,
  message     text,
  created_at  timestamptz not null default now()
);

alter table public.gifts enable row level security;

create policy "sender or receiver reads gift" on public.gifts
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "sender writes gift" on public.gifts
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.connections c
      where c.status = 'accepted'
        and (
          (c.user_id = auth.uid() and c.partner_id = gifts.receiver_id)
          or (c.partner_id = auth.uid() and c.user_id = gifts.receiver_id)
        )
    )
  );

create index idx_gifts_sender on public.gifts (sender_id);
create index idx_gifts_receiver on public.gifts (receiver_id);

-- ============================================================
-- ROOMS
-- ============================================================
create table public.rooms (
  id            uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  theme         text not null default 'cozy',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.rooms enable row level security;

create policy "room visible to connection parties" on public.rooms
  for select using (
    exists (
      select 1 from public.connections c
      where c.id = rooms.connection_id
        and (c.user_id = auth.uid() or c.partner_id = auth.uid())
    )
  );

create policy "room insert for connection parties" on public.rooms
  for insert with check (
    exists (
      select 1 from public.connections c
      where c.id = rooms.connection_id
        and (c.user_id = auth.uid() or c.partner_id = auth.uid())
    )
  );

create policy "room update for connection parties" on public.rooms
  for update using (
    exists (
      select 1 from public.connections c
      where c.id = rooms.connection_id
        and (c.user_id = auth.uid() or c.partner_id = auth.uid())
    )
  );

create index idx_rooms_connection on public.rooms (connection_id);

-- ============================================================
-- TRIGGERS: keep updated_at fresh + auto-create profile
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'friend' || substr(new.id::text, 1, 6)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Atomically validate and claim a Love Code, then create the pending
-- connection. Runs security-definer so the claimer never needs to read
-- another user's code row directly (avoids the RLS read/update gap).
create or replace function public.claim_love_code(p_code text)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  code_row public.love_codes%rowtype;
begin
  select * into code_row
  from public.love_codes
  where code = upper(p_code);

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Oops! That Love Code doesn''t seem to work.');
  end if;

  if code_row.owner_id = auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'That''s your own Love Code - share it with your person instead.');
  end if;

  if code_row.used_by is not null then
    return jsonb_build_object('ok', false, 'error', 'That Love Code has already been claimed.');
  end if;

  if code_row.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'That Love Code has expired. Ask for a fresh one!');
  end if;

  if exists (
    select 1 from public.connections c
    where (c.user_id = auth.uid() and c.partner_id = code_row.owner_id)
       or (c.user_id = code_row.owner_id and c.partner_id = auth.uid())
  ) then
    return jsonb_build_object('ok', false, 'error', 'You two already have a connection - check your requests.');
  end if;

  update public.love_codes set used_by = auth.uid() where id = code_row.id;

  insert into public.connections (user_id, partner_id, status)
  values (code_row.owner_id, auth.uid(), 'pending');

  return jsonb_build_object('ok', true);
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger avatars_set_updated_at before update on public.avatars
  for each row execute procedure public.set_updated_at();

create trigger connections_set_updated_at before update on public.connections
  for each row execute procedure public.set_updated_at();

create trigger rooms_set_updated_at before update on public.rooms
  for each row execute procedure public.set_updated_at();
