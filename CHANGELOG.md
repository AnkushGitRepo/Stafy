# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [P0] - 2026-09-15

### Added
- Full documentation system under `docs/` (index, context, PRD, planning, architecture, security, database design, business rules, testing strategy, phases, decisions log with ADR-001…024, design system skeleton, AI development/review logs, prompt archive).
- Claude Code configuration: `AGENTS.md`, `CLAUDE.md`, `.claude/agents/*`, `.claude/skills/*`, `.claude/settings.json`.
- Monorepo scaffold: `client/` (Vite React shell), `server/` (Express skeleton with `/api/health`), `api/index.js`, `supabase/migrations/` (empty), CI workflow.
- Project rebranded from working title "PeopleOps" to **Stafy** (ADR-018).

## [P2-design] - 2026-09-15

### Added
- Brand identity and landing page design (ADR-025): real palette, typography (Bricolage Grotesque + Hanken Grotesk), logo/favicon SVGs, a 10-section interactive landing prototype (GSAP + ScrollTrigger + Flip), and a 9-item motion spec table.
- `docs/DESIGN.md` tokens filled with real values (previously all `TBD`); zero `TBD` remaining in the token block.
- `docs/prompts/P-002-brand-and-landing-design.md` and `docs/prompts/P-003-landing-auth-dummy-dashboard.md` saved.

### Changed
- Two Claude Design canvases (Brand Assets, Landing) published, then replaced with the real deliverable the owner provided after an initial from-scratch placeholder pass.
