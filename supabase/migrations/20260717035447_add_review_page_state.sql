-- Capture the visible interactive state surrounding a selected design element
-- so opening a thread can restore tabs, device variants, and disclosures.

alter table public.review_threads
  add column page_state jsonb not null default '{}'::jsonb
  check (jsonb_typeof(page_state) = 'object');

grant update (page_state) on table public.review_threads to authenticated;

create or replace function public.create_review_thread(
  p_page_path text,
  p_anchor_path text,
  p_anchor_rx double precision,
  p_anchor_ry double precision,
  p_viewport_width integer,
  p_body text,
  p_page_hash text,
  p_anchor_label text,
  p_page_state jsonb
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
    page_hash,
    page_state,
    anchor_path,
    anchor_label,
    anchor_rx,
    anchor_ry,
    viewport_width,
    created_by
  ) values (
    p_page_path,
    p_page_hash,
    coalesce(p_page_state, '{}'::jsonb),
    p_anchor_path,
    btrim(p_anchor_label),
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

revoke all on function public.create_review_thread(
  text,
  text,
  double precision,
  double precision,
  integer,
  text,
  text,
  text,
  jsonb
) from public, anon;

grant execute on function public.create_review_thread(
  text,
  text,
  double precision,
  double precision,
  integer,
  text,
  text,
  text,
  jsonb
) to authenticated;
