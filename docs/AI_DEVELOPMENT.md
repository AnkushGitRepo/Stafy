> Status: Living   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/prompts/, docs/DECISIONS.md

# AI Development Log

One entry per meaningful prompt. The README "AI Development Process" section is generated from the best 5–8 entries at submission.

## Entry: P-000

- **Prompt**: [`docs/prompts/P-000-requirement-analysis.md`](./prompts/P-000-requirement-analysis.md) — owner shared the assessment PDF and asked Claude to analyze requirements and ask clarifying questions.
- **Tool**: Claude chat.
- **Why I used it**: Needed a structured requirements pass and risk flagging before committing to an architecture, given a hard one-day deadline.
- **AI's approach/output**: Flagged build-order risk, web-checklist overreach, GSAP-slop risk, and doc overlap; asked 16 clarifying questions covering stack, deployment, auth, authorization layering, leave routing, statuses, time handling, balance model, org model, checklist scope, motion ambition, platform scope, testing, build order, HR-correction scope, and demo safety.
- **What I accepted**: All 16 answers as recorded in `docs/prompts/P-001-project-setup.md` §2 and expanded into `docs/DECISIONS.md`.
- **What I changed or rejected**: Two-manager leave approval (reverted to single-approver, ADR-009); page-by-page build order (replaced with foundation-first, ADR-021); "Impeccable" design tool (removed, folded into DESIGN.md, ADR-015); cookie consent banner (dropped, ADR-016).
- **Commit(s)**: none (chat-only, pre-repo).

## Entry: P-001

- **Prompt**: [`docs/prompts/P-001-project-setup.md`](./prompts/P-001-project-setup.md) — full project setup: docs system, Claude Code configuration, monorepo scaffold, executed under the renamed brand "Stafy" (ADR-018).
- **Tool**: Claude Code.
- **Why I used it**: Needed the entire documentation system, agent/skill configuration, and scaffold created consistently and quickly, with every ADR/BR traceable back to the planning conversation.
- **AI's approach/output**: Entered Plan Mode, produced a full file-by-file plan (including the Stafy rename mapping), got explicit approval on two naming decisions (brand suffix, demo domain) via clarifying questions, then executed: created `docs/*` (00-INDEX, CONTEXT, PRD, PLANNING, ARCHITECTURE, SECURITY, DATABASE, BUSINESS_RULES, TESTING, PHASES, DECISIONS with ADR-001…024, DESIGN, AI_DEVELOPMENT, AI_CODE_REVIEW, prompts/), `.claude/` config, and the monorepo scaffold (client, server, api, supabase/migrations, CI). Verified two live technical questions against current docs before writing dependent ADRs: Vercel's current Express-on-Vercel-Functions guidance (confirmed `api/index.js` exporting the app remains correct under Fluid Compute) and Supabase's current server-side JWT verification/key-naming guidance (chose `getClaims()` over `getUser()`, and the new `SUPABASE_SECRET_KEY`/`SUPABASE_PUBLISHABLE_KEY` names over the legacy `service_role`/`anon` names) — both folded into ADR-002 and ADR-003 with reasoning.
- **What I accepted**: TO BE FILLED BY ANKUSH
- **What I changed or rejected**: TO BE FILLED BY ANKUSH
- **Commit(s)**: TO BE FILLED AFTER COMMIT
