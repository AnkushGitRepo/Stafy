# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [P0] - 2026-09-15

### Added
- Full documentation system under `docs/` (index, context, PRD, planning, architecture, security, database design, business rules, testing strategy, phases, decisions log with ADR-001…024, design system skeleton, AI development/review logs, prompt archive).
- Claude Code configuration: `AGENTS.md`, `CLAUDE.md`, `.claude/agents/*`, `.claude/skills/*`, `.claude/settings.json`.
- Monorepo scaffold: `client/` (Vite React shell), `server/` (Express skeleton with `/api/health`), `api/index.js`, `supabase/migrations/` (empty), CI workflow.
- Project rebranded from working title "PeopleOps" to **Stafy** (ADR-018).
