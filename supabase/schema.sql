-- WordPop schema — run in the Supabase SQL editor

-- ─── words ────────────────────────────────────────────────────────────────────
create table if not exists public.words (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  word        text        not null,
  definition  text        not null,
  sentence    text        not null,
  created_at  timestamptz not null default now()
);

alter table public.words enable row level security;

create policy "words: users manage own" on public.words
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists words_user_created_idx
  on public.words (user_id, created_at desc);

-- ─── attempts ─────────────────────────────────────────────────────────────────
create table if not exists public.attempts (
  id          uuid        primary key default gen_random_uuid(),
  word_id     uuid        not null references public.words (id) on delete cascade,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  correct     boolean     not null,
  created_at  timestamptz not null default now()
);

alter table public.attempts enable row level security;

create policy "attempts: users manage own" on public.attempts
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists attempts_user_word_idx
  on public.attempts (user_id, word_id);

-- ─── push_subscriptions ───────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null unique references auth.users (id) on delete cascade,
  subscription     jsonb       not null,
  interval_minutes integer     not null default 60,
  last_notified_at timestamptz,
  updated_at       timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions: users manage own" on public.push_subscriptions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
