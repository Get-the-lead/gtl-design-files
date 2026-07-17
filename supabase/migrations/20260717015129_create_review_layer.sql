-- GTL review layer: invite-only reviewers, anchored threads, and replies.
-- The browser receives only a publishable key. Membership is enforced here.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.reviewers (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table public.review_threads (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  anchor_path text not null,
  anchor_rx double precision not null check (anchor_rx between 0 and 1),
  anchor_ry double precision not null check (anchor_ry between 0 and 1),
  viewport_width integer not null check (viewport_width > 0),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_by uuid not null references public.reviewers (id) on delete restrict,
  created_at timestamptz not null default now(),
  resolved_by uuid references public.reviewers (id) on delete set null,
  resolved_at timestamptz,
  constraint review_threads_resolution_consistent check (
    (status = 'open' and resolved_by is null and resolved_at is null)
    or
    (status = 'resolved' and resolved_by is not null and resolved_at is not null)
  )
);

create index review_threads_page_status_idx
  on public.review_threads (page_path, status, created_at);

create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.review_threads (id) on delete cascade,
  author_id uuid not null references public.reviewers (id) on delete restrict,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index review_comments_thread_created_idx
  on public.review_comments (thread_id, created_at);

-- Auth users are only created by an operator invite. Open sign-up must remain
-- disabled in the hosted project. The trigger turns each invite into membership.
create or replace function private.handle_new_reviewer()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.reviewers (id, email, display_name)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(nullif(new.raw_app_meta_data ->> 'display_name', ''), split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_reviewer() from public, anon, authenticated;

create trigger on_auth_user_created_for_review
  after insert on auth.users
  for each row execute function private.handle_new_reviewer();

-- RLS policies call this private helper to authorize actual review membership,
-- rather than treating every authenticated token as a reviewer.
create or replace function private.is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.reviewers
      where id = (select auth.uid())
    );
$$;

revoke all on function private.is_reviewer() from public, anon;
grant execute on function private.is_reviewer() to authenticated;

alter table public.reviewers enable row level security;
alter table public.review_threads enable row level security;
alter table public.review_comments enable row level security;

create policy reviewers_read_for_members
  on public.reviewers for select
  to authenticated
  using ((select private.is_reviewer()));

create policy reviewers_update_self
  on public.reviewers for update
  to authenticated
  using ((select private.is_reviewer()) and id = (select auth.uid()))
  with check ((select private.is_reviewer()) and id = (select auth.uid()));

create policy threads_read_for_members
  on public.review_threads for select
  to authenticated
  using ((select private.is_reviewer()));

create policy threads_create_for_members
  on public.review_threads for insert
  to authenticated
  with check (
    (select private.is_reviewer())
    and created_by = (select auth.uid())
    and status = 'open'
    and resolved_by is null
    and resolved_at is null
  );

create policy threads_resolve_for_members
  on public.review_threads for update
  to authenticated
  using ((select private.is_reviewer()))
  with check (
    (select private.is_reviewer())
    and (
      (status = 'open' and resolved_by is null and resolved_at is null)
      or
      (status = 'resolved' and resolved_by = (select auth.uid()) and resolved_at is not null)
    )
  );

create policy comments_read_for_members
  on public.review_comments for select
  to authenticated
  using ((select private.is_reviewer()));

create policy comments_create_for_members
  on public.review_comments for insert
  to authenticated
  with check (
    (select private.is_reviewer())
    and author_id = (select auth.uid())
  );

create policy comments_delete_own
  on public.review_comments for delete
  to authenticated
  using (
    (select private.is_reviewer())
    and author_id = (select auth.uid())
  );

revoke all on table public.reviewers, public.review_threads, public.review_comments from anon;
revoke all on table public.reviewers, public.review_threads, public.review_comments from authenticated;

grant select on table public.reviewers to authenticated;
grant update (display_name) on table public.reviewers to authenticated;
grant select, insert on table public.review_threads to authenticated;
grant update (status, resolved_by, resolved_at) on table public.review_threads to authenticated;
grant select, insert, delete on table public.review_comments to authenticated;

-- Create a pin and its opening message atomically. This is SECURITY INVOKER,
-- so the table grants and RLS policies above still govern every insert.
create or replace function public.create_review_thread(
  p_page_path text,
  p_anchor_path text,
  p_anchor_rx double precision,
  p_anchor_ry double precision,
  p_viewport_width integer,
  p_body text
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  new_thread_id uuid;
begin
  insert into public.review_threads (
    page_path,
    anchor_path,
    anchor_rx,
    anchor_ry,
    viewport_width,
    created_by
  ) values (
    p_page_path,
    p_anchor_path,
    p_anchor_rx,
    p_anchor_ry,
    p_viewport_width,
    (select auth.uid())
  )
  returning id into new_thread_id;

  insert into public.review_comments (thread_id, author_id, body)
  values (new_thread_id, (select auth.uid()), p_body);

  return new_thread_id;
end;
$$;

revoke all on function public.create_review_thread(text, text, double precision, double precision, integer, text)
  from public, anon;
grant execute on function public.create_review_thread(text, text, double precision, double precision, integer, text)
  to authenticated;

-- Postgres Changes powers live collaboration. RLS still filters every payload.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'review_threads'
  ) then
    alter publication supabase_realtime add table public.review_threads;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'review_comments'
  ) then
    alter publication supabase_realtime add table public.review_comments;
  end if;
end;
$$;
