> Status: Living (historical record — do not modify the substance retroactively)   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush

# P-000 — Requirement analysis

**Tool**: Claude chat (planning conversation, 2026-09-15).

**Prompt (gist)**: The owner shared the AppTrait Solutions Mini HRMS assessment PDF and asked Claude to analyze requirements, ask clarifying questions, and later produce setup prompts for Claude Code.

**AI's approach/output**: Claude read the PDF and flagged five risks before any planning was finalized:
1. **Build-order risk** — a page-by-page build order would let RBAC/business-logic bugs hide until late, when the scored dimensions (permissions, edge cases) matter most.
2. **Web-checklist overreach** — applying a generic web-quality checklist uniformly to both the public landing page and the authenticated internal app would waste time on items with no real audience or risk on app routes.
3. **GSAP-slop risk** — an unconstrained "make it look alive" landing page brief is a common source of over-animated, scroll-jacked, decorative motion that reads as generic AI output.
4. **Doc overlap** — the owner's personal "Rules.md" plus a prospective `AGENTS.md`/`CLAUDE.md` risked drifting out of sync.
5. Plus 16 clarifying questions covering: stack (TS vs JS, DB choice), deployment topology, auth token verification approach, RLS vs. API-layer authorization, leave approval routing (owner initially proposed 2-manager approval for managers), leave statuses (owner wanted cancellation), attendance/time zone handling, leave balance model, organization model (are managers/HR also employees?), scope of the "web quality checklist," motion/animation ambition, platform scope (web vs. native), testing strategy, build order, HR attendance correction scope, demo safety, and which optional PDF features to build.

**Owner's answers**: Recorded in full in `docs/prompts/P-001-project-setup.md` §2 (locked product & technical decisions) and expanded into ADRs in `docs/DECISIONS.md`.

**What was accepted/changed** (summarized from the ADR Discussion fields):
- Two-manager approval for managers' leave was **rejected** — reverted to single-approver routing (ADR-009).
- Page-by-page build order was **replaced** with foundation-first, then vertical feature slices (ADR-021).
- "Impeccable" (a design tool/skill) was **removed**; its anti-slop guidance was folded into `docs/DESIGN.md` (ADR-015).
- A cookie consent banner was **dropped** as unnecessary, since only strictly-necessary auth cookies exist and analytics is cookieless (ADR-016).

**Commit(s)**: none (chat-only; no repo existed yet).
