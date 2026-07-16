---
name: forge-task
description: Track confirmed implementation work, bugs, and follow-ups in The Forge. Use when the user explicitly asks to create, list, update, complete, or otherwise persist a project task. Do not turn tentative ideas or unanswered questions into tasks.
---

# Forge Task

Use the bundled script so headless sessions authenticate through Forge's operator API rather than a browser cookie. Resolve `<skill-directory>` as the directory containing this `SKILL.md`; do not look for the script in the active project's `scripts/` directory.

## Workflow

1. Read the Forge project slug from the repository's `AGENTS.md`. Never infer another project.
2. List current tasks before creating one when duplication is plausible.
3. Treat an explicit request to track or change a task as authorization for that write. If persistence is only inferred, propose it first.
4. Keep the title outcome-focused. Put durable context and done-when detail in `description.markdown`.
5. Run the operation and report the resulting task id and state. Surface non-2xx responses unchanged.

## Commands

Set `FORGE_OPERATOR_API_TOKEN`; `FORGE_URL` defaults to `http://localhost:3000`.

```bash
node <skill-directory>/scripts/forge-task.mjs list --project brighthope
node <skill-directory>/scripts/forge-task.mjs create --project brighthope --json '{"title":"...","description":{"markdown":"..."},"type":"feature","priority":"med"}'
node <skill-directory>/scripts/forge-task.mjs update TASK_ID --project brighthope --json '{"status":"done"}'
```

For complex payloads, use `--file /absolute/path/payload.json` instead of `--json`.
