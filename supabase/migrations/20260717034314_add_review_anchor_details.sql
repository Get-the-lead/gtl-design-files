-- Store a reviewer-friendly description of each DOM target and allow invited
-- reviewers to repair an anchor when the underlying design markup changes.

alter table public.review_threads
  add column page_hash text not null default ''
  check (char_length(page_hash) <= 500),
  add column anchor_label text not null default 'Selected element'
  check (char_length(btrim(anchor_label)) between 1 and 240);

update public.review_threads
set anchor_label = left(anchor_path, 240)
where anchor_label = 'Selected element';

grant update (
  page_path,
  page_hash,
  anchor_path,
  anchor_label,
  anchor_rx,
  anchor_ry,
  viewport_width
) on table public.review_threads to authenticated;

-- Keep the original six-argument overload for already-open review tabs. New
-- clients call this overload so the label and opening comment remain atomic.
create or replace function public.create_review_thread(
  p_page_path text,
  p_anchor_path text,
  p_anchor_rx double precision,
  p_anchor_ry double precision,
  p_viewport_width integer,
  p_body text,
  p_page_hash text,
  p_anchor_label text
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
    anchor_path,
    anchor_label,
    anchor_rx,
    anchor_ry,
    viewport_width,
    created_by
  ) values (
    p_page_path,
    p_page_hash,
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
  text
) from public, anon;

grant execute on function public.create_review_thread(
  text,
  text,
  double precision,
  double precision,
  integer,
  text,
  text,
  text
) to authenticated;
