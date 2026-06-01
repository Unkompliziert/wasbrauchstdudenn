# wasbrauchstdudenn.de

Phase 1 — one page, one input, one conversation, one solution. Nothing more.

## Stack (M1 decision)

- **Framework:** Next.js (App Router, TypeScript) — one page + one secure server endpoint in one deployable unit.
- **Hosting:** Vercel (Hobby tier) for production. Git-push deploys, global CDN, $0 at Phase 1 volume.
- **Database:** None. Radical data minimization is a product requirement. No DB until a feature needs one.
- **AI provider:** Anthropic Claude (model choice owned by the Conversation Agent).

Full rationale and per-session cost estimate live in the WAS-2 stack decision document.

## Run it locally

Requires Node 20+ (built and verified on Node 24).

```bash
npm install      # already done if node_modules exists
npm run build
npm run start    # serves http://localhost:3000
```

Then open **http://localhost:3000** — you should see a quiet cream page showing
`wasbrauchstdudenn.de`. That confirms the build → serve pipeline works (M1).

For live development with hot reload: `npm run dev`.

## What is intentionally NOT here yet

The product question, the input field, copy, and the conversation logic belong to
later milestones (M2+) and to the UX Designer / Conversation Agent. Manual before
automatic: we do not build infrastructure for features that do not exist yet.

## Engineering notes for later milestones

These are standing requirements for when the work lands — recorded here so they are
not lost on a closed ticket.

- **Prompt caching (M2/M3 AI conversation endpoint).** Enable Anthropic prompt
  caching on the system prompt — automatic caching via `cache_control` — so repeated
  context (system prompt, dialogue spec, few-shot examples) is not re-billed on every
  turn. This materially cuts per-session API cost. Board directive (Felix), WAS-2,
  2026-05-29.
