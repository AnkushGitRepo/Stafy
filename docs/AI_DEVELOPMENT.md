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
- **Commit(s)**: `ce5ff95`, `ae2c97b`, `3575465`, `9548e54`

## Entry: P-002

- **Prompt**: [`docs/prompts/P-002-brand-and-landing-design.md`](./prompts/P-002-brand-and-landing-design.md) — brand identity + landing page design, needed before P-003 could implement any UI (its own prerequisite check blocks on `docs/DESIGN.md` having zero `TBD` tokens).
- **Tool**: Claude Code (drafted the prompt, ran a first design pass) + Claude Design (the owner's separate session that produced the real deliverable).
- **Why I used it**: P-003 was received first and its prerequisite check correctly caught that P-002 had never been run — `docs/DESIGN.md` still had every token as `TBD`. Rather than invent values to unblock P-003 (explicitly forbidden by both P-002 and P-003's own text), I drafted and ran P-002 first.
- **AI's approach/output**: Entered Plan Mode, locked a placeholder brand direction (teal accent, Space Grotesk/Inter) via the local Claude Code `design` skill, and published two from-scratch canvases. Immediately after, the owner clarified that a real Claude Design project already existed at a URL referenced in the P-003 draft — a URL this session has no tool to fetch (the `design` skill explicitly cannot import an existing `claude.ai/design` project; that's a claude.ai/design-only capability). The owner then supplied two zip exports of that real project (`landing_page.zip`, `Placeholder values and deliverable scope.zip` — identical contents, confirmed via `diff`), built in a separate claude.ai/design session from the P-002 brief per its own `github.md` handoff note. That deliverable — a full interactive GSAP/ScrollTrigger/Flip landing prototype (10 sections, working role-switcher, scroll-scrubbed approvals diagram) and a brand/handoff sheet (palette, type scale, logo SVGs, component inventory, a 9-item motion spec table) — was substantially more complete than the placeholder canvases. I discarded my placeholder canvases' content, republished the real files to the same Artifact URLs (fixing asset-path references so the logo SVGs resolve inside the design-canvas sandbox), and rewrote `docs/DESIGN.md` and `docs/DECISIONS.md` (ADR-025) from the real values.
- **What I accepted**: TO BE FILLED BY ANKUSH
- **What I changed or rejected**: TO BE FILLED BY ANKUSH
- **Commit(s)**: `9b40e47`
