---
name: forge-document
description: Maintain durable project specifications, decisions, rules, and explanations in The Forge Blueprint. Use when the user asks to create, read, or update Forge documentation, or when agreed context must persist beyond the current conversation.
---

# Forge Document

Use the bundled script so headless sessions authenticate through Forge's operator API rather than a browser cookie. Resolve `<skill-directory>` as the directory containing this `SKILL.md`; do not look for the script in the active project's `scripts/` directory.

## Workflow

1. Read the Forge project slug from the repository's `AGENTS.md`. Never infer another project.
2. List current documents and update the relevant one before creating a competing document.
3. Save durable product context, not chat transcripts or temporary implementation notes.
4. Treat an explicit create or update request as authorization. If persistence is inferred, propose it first.
5. Store Markdown as `{ "markdown": "..." }` in `content` and report the resulting document id.

## Commands

Set `FORGE_OPERATOR_API_TOKEN`; `FORGE_URL` defaults to `http://localhost:3000`.

```bash
node <skill-directory>/scripts/forge-document.mjs list --project brighthope
node <skill-directory>/scripts/forge-document.mjs get DOCUMENT_ID --project brighthope
node <skill-directory>/scripts/forge-document.mjs create --project brighthope --json '{"title":"...","type":"feature","content":{"markdown":"..."}}'
node <skill-directory>/scripts/forge-document.mjs update DOCUMENT_ID --project brighthope --file /absolute/path/payload.json
```

Document types are `prd`, `feature`, `note`, and `adr`.
