# GTL review layer

Private, Supabase-backed design comments for the GTL prototype. The review shell
loads the existing pages in a same-origin iframe and injects pins at runtime.
Nothing in `gtl-app/` imports or ships the review interface.

## Start locally

From the repository root:

```sh
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/review/` and sign in with an invited reviewer
account. Use **Browse** to operate the prototype and **Comment** to place pins.

Do not open `review/index.html` directly from Finder. The iframe and ES module
need an HTTP origin.

## Supabase

The linked project is **GTL Review**. Schema changes live in
`supabase/migrations/` and are deployed with:

```sh
supabase db push --dry-run
supabase db push
```

Authentication is invite-only. In the Supabase dashboard:

1. Disable new-user sign-ups under Authentication settings.
2. Set the production review URL as the Site URL when it exists.
3. Keep `http://127.0.0.1:4173/**` as an additional redirect URL for local use.
4. Invite Sam, the developer, and Naiade from Authentication → Users.

Invited accounts automatically receive a `reviewers` membership row. RLS uses
that membership for all reads and writes.

## Deployment boundary

- Production prototype: deploy `gtl-app/` as the site root.
- Private review site: deploy the repository root and open `/review/`.
- Never add `review.js`, `review.css`, or the Supabase client to a `gtl-app` page.

Comments use relative page paths and DOM-relative anchors, so pins created on
localhost carry over to the deployed review site without data migration.
