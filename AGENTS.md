# Get The Lead (GTL)

GTL is a live-sports betting experience built around fast, repeatable bets on
whether a team will get the lead, keep the lead, or tie during a game. The MVP
focuses on making the core live-game betting loop simple and quick.

## Product context

The GTL project in Forge Blueprint is the durable source for product
specifications, decisions, flows, and rules. Read the relevant document before
changing product behaviour and update it when an agreed decision makes it
inaccurate.

`../GTL_MVP_Plan.md` defines the current MVP scope and deferred functionality.

## Stack

Plain HTML · CSS · JavaScript

There is no package manager, build step, or automated test suite in this repo.

## Structure

- `gtl-app/` — active application pages, styles, scripts, and assets
- `design_system/` — active visual reference and component catalogue
- `archive/` — superseded explorations; do not extend these

## Design rules

- Treat `gtl-app/tokens.css` as the source of truth for design tokens. Reuse
  existing tokens, components, and interaction patterns before adding new ones.
- Keep shared foundations in `gtl-app/styles.css`; put page-specific styling in
  the closest existing page stylesheet.
- Maintain mobile, tablet, and desktop states when changing shared UI.
- Keep `design_system/` aligned when introducing or materially changing a
  reusable component, token, or pattern.
- Never expose, print, or commit the private preview passphrase or other
  credentials. `gtl-app/gate.config.js` is local-only.

## Forge

Forge project: `get-the-lead` (Get The Lead).

### Private MCP connection

Use the project-pinned production Forge MCP endpoint for live Forge context:

`https://www.app-theforge.com/api/mcp?project=get-the-lead`

The repository-local `.codex/config.toml` reuses the shared read-only
`FORGE_MCP_TOKEN`; Forge enforces the `get-the-lead` project pin server-side.
The token is shown once: never paste it into this repository, an agent
instruction, a committed MCP configuration, logs, or chat messages.

For a terminal session, load the credential without adding it to shell history:

```bash
export FORGE_MCP_URL="https://www.app-theforge.com/api/mcp?project=get-the-lead"
read -s "FORGE_MCP_TOKEN?Paste Forge token: "
export FORGE_MCP_TOKEN
echo
```

Register the endpoint with the agent or chat client using Bearer authentication
from `FORGE_MCP_TOKEN`. Verify the connection from the Forge repository:

```bash
cd /Users/samblandford/Developer/applications/the-forge
pnpm mcp:smoke
```

A working project-pinned connection reports eight discovered tools, identifies
`get-the-lead` in `forge_health`, returns only `get-the-lead` from
`forge_list_projects`, and ends with `Forge MCP read smoke passed.` Never request
another project slug. Project-pinned connections intentionally omit the
cross-project Daily Focus tool. If Forge MCP authentication, transport, or
project pinning fails, report that failure explicitly; do not silently treat
repository files as fresh Forge state. Revoke unused or exposed credentials
from **Account → Agent access**.

Use Forge when work needs to persist beyond the current conversation:

- Use `forge-task` for confirmed implementation work, bugs, or follow-ups. Do
  not turn tentative ideas or unanswered questions into tasks.
- Use `forge-document` for durable specifications, decisions, rules, or
  explanations. Update the relevant document before creating a competing one.
- Use `forge-whiteboard` when a sequence, relationship, or decision path is
  materially clearer as a visual flow. Keep important rules and decisions in
  the relevant Blueprint document rather than only on the canvas.
- An explicit request to create or update a Forge artifact authorises that
  write. If the need is inferred, propose it before writing.
- Never infer another Forge project when the target is `get-the-lead`.
