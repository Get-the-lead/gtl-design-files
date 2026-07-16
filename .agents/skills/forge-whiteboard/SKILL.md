---
name: forge-whiteboard
description: Create, update, and visually verify documented flows in The Forge Blueprint. Use when a sequence, relationship, architecture, or decision path is materially clearer as a whiteboard than prose alone. Open every saved board in the in-app browser and inspect the rendered canvas before completion. Keep important rules, edge cases, and decisions in the relevant Blueprint document.
---

# Forge Whiteboard

Use the bundled script so headless sessions authenticate through Forge's operator API rather than a browser cookie. Resolve `<skill-directory>` as the directory containing this `SKILL.md`; do not look for the script in the active project's `scripts/` directory.

## Workflow

1. Read the Forge project slug from the repository's `AGENTS.md`. Never infer another project.
2. List current boards and documents before creating anything. Extend the relevant artifacts when possible.
3. Draft the flow in chat when its structure is ambiguous. An explicit request to create or update it authorizes the matching write; otherwise propose it first.
4. Use stable node and edge ids. Use node `data.label` for the title and `data.description` for supporting detail. Write every node title in Title Case, while preserving the correct casing of acronyms and product names such as `TGA`, `PDF`, `MVP`, `Xero`, and `Stripe`.
5. Sketch lanes and merge points before assigning coordinates. Keep the primary path left-to-right; place alternate branches in parallel lanes and rejoin them once.
6. Set `sourceHandle` and `targetHandle` on every edge. Never rely on Forge's missing-handle fallback: it hydrates as `bottom` → `top`, which makes horizontal flows loop around cards.
7. Connect operational transitions only. Mandatory transactional notifications are operational transitions: model each as a specifically named `system_action` node and connect it to its trigger and the following step. Leave only titles, explanatory notes, legends, and discussion/open-question nodes disconnected. Set `data.role` to `annotation` or `discussion` only on those non-operational nodes.
8. Run `validate` before every create or update. Fix every error and review warnings before writing.
9. Create or update the relevant Blueprint document with rules, edge cases, decisions, and open questions that the canvas cannot express clearly.
10. Read the saved board back and verify node/edge counts and handles.
11. Open the exact saved whiteboard in the in-app browser and complete the rendered visual QA procedure below. This gate is mandatory for this skill because structural validation cannot detect every visual collision or confusing route.
12. Report both artifact ids only after visual QA passes. If authentication blocks inspection, report that work is waiting for sign-in rather than claiming completion.

## Rendered visual QA

After every create or update, open this URL in the in-app browser, substituting the configured `FORGE_URL`, project slug, and saved whiteboard id:

```text
<FORGE_URL>/projects/<project-slug>/blueprint/whiteboards/<whiteboard-id>
```

Use the `browser:control-in-app-browser` skill for this step. Keep the same browser and tab throughout the review.

1. Navigate the in-app browser to the exact whiteboard URL immediately after readback verification.
2. If Forge displays authentication, pause and ask the user to sign in in that in-app browser and reply when ready. Do not inspect credentials, cookies, or storage, and do not substitute another browser.
3. Once authenticated, refresh or revisit the same URL. Fit the canvas to show the full map, then inspect both the overview and any dense branch or merge areas.
4. Confirm all of the following:
   - the primary path reads left-to-right without tracing ambiguity;
   - nodes, edge paths, arrowheads, handles, and edge labels do not collide;
   - branch lanes remain visually distinct and do not cross each other;
   - branches rejoin once at an intentional merge point;
   - decision outcomes are readable and visibly attached to the correct edges;
   - every node title uses Title Case consistently, with acronyms and product names correctly cased;
   - retry loops stay in their dedicated lane and do not cross forward paths;
   - transactional notification actions are specifically named, connected to the correct trigger, and show the recipient or channel in their description;
   - titles, explanatory notes, legends, and Open Questions are disconnected and spatially associated with the right flow area;
   - text is not unexpectedly truncated and the map has balanced spacing without excessive empty gaps;
   - the Open Questions node is easy to find and open without appearing to be an operational step.
5. If any check fails, adjust positions, handles, or connections in the payload; validate and update the board; refresh the same browser tab; and inspect again. Repeat until the rendered map is clean.
6. In the final response, explicitly say whether rendered visual QA passed. Never infer a pass solely from payload validation or API readback.

## Layout rules

- Use Title Case for every node `data.label`, including titles, decisions, actions, notes, and Open Questions. Descriptions remain sentence case. Edge labels may use concise sentence case.
- Place primary steps on one horizontal baseline with 320–360px between node origins.
- Use `right` → `left` handles for forward horizontal edges.
- Put two-way decision branches at least 240px above and below the primary lane. Exit with `top` or `bottom`, then use `right` → `left` within each branch.
- Put the merge node to the right of every branch endpoint. Each branch connects once to that merge; do not connect branches through explanatory nodes.
- Keep retry/resubmission loops in a dedicated lower lane at least 320px from the primary path. Return to the `bottom` handle of the repeated step and avoid crossing forward edges.
- Prefer one labelled edge over an intermediate node that only says “Yes”, “No”, or “Trigger”.
- Use `decision` only for a real fork. Label every outgoing decision edge with the outcome.
- Treat an off-platform action as an operational node only when completing it gates the next step. Otherwise record it as a disconnected note or in the supporting document.
- Represent every mandatory transactional notification as a connected `system_action` node with an action label such as `Send Payment Invoice`, `Send Approval Email`, or `Notify Staff of TGA Rejection`. Never use a generic label such as `Mandatory Notifications`.
- Put the recipient, channel, and message purpose in `data.description`, for example `Email to pharmacy — invoice attached and payment due`. If one trigger sends materially different messages to different recipients, use separate nodes.
- Place notification actions directly after the event that triggers them. If the business process continues independently of delivery, branch the notification from the trigger and leave it as a short terminal branch; otherwise keep it inline when sending the message gates the next user action.
- Place one disconnected `question` node named `Open Questions — …` below the map. Give it `data.role: "discussion"` so Forge users can open it and discuss unresolved points.
- Keep titles and annotation blocks handle-less in practice: never create edges to or from them.

## Edge handles

Valid handle ids are `top`, `right`, `bottom`, and `left`.

```json
{"id":"e-main","source":"step-a","target":"step-b","sourceHandle":"right","targetHandle":"left","endStyle":"arrow"}
```

For a decision with upper and lower branches:

```json
[
  {"id":"e-yes","source":"decision","target":"upper","sourceHandle":"top","targetHandle":"left","label":"Yes","labelTone":"positive","endStyle":"arrow"},
  {"id":"e-no","source":"decision","target":"lower","sourceHandle":"bottom","targetHandle":"left","label":"No","labelTone":"negative","endStyle":"arrow"}
]
```

## Commands

Set `FORGE_OPERATOR_API_TOKEN`; `FORGE_URL` defaults to `http://localhost:3000`.

```bash
node <skill-directory>/scripts/forge-whiteboard.mjs list --project brighthope
node <skill-directory>/scripts/forge-whiteboard.mjs get WHITEBOARD_ID --project brighthope
node <skill-directory>/scripts/forge-whiteboard.mjs validate --file /absolute/path/board.json
node <skill-directory>/scripts/forge-whiteboard.mjs create --project brighthope --file /absolute/path/board.json
node <skill-directory>/scripts/forge-whiteboard.mjs update WHITEBOARD_ID --project brighthope --file /absolute/path/board.json
```

Board types are `user_flow`, `architecture`, `ideation`, and `decision_tree`. Nodes require `id`, `kind`, `position`, and `data`; edges require `id`, `source`, `target`, `sourceHandle`, and `targetHandle`. The bundled script validates create/update payloads automatically.
