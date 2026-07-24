# GTL app deployment

`app-designs` is the source branch for the full design repository. `main` is a
deployment branch containing the production prototype under `gtl-app/` only.
The branches are not intended to have matching commit ancestry.

## Rules

1. Never merge `app-designs` into `main`.
2. Fetch the latest remote branches before preparing a deployment.
3. Compare `origin/main:gtl-app` with `app-designs:gtl-app`; commit IDs alone do
   not show whether an app change has already been deployed.
4. Start from the latest `origin/main` and copy only the required `gtl-app/`
   files from `app-designs`.
5. Before committing, confirm every changed path starts with `gtl-app/`.
6. Run the available syntax and content checks, create one focused deployment
   commit on `main`, then push it to `origin/main`.
7. Leave `design_system/`, `review/`, `supabase/`, `.agents/`, `.codex/`, and
   other repository-only files on `app-designs`.

For a targeted release, prefer copying the exact changed app files rather than
the entire directory. This preserves deliberate production-only differences
and makes the deployment diff easy to audit.
