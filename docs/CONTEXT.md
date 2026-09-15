> Status: Living   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/PHASES.md, docs/DECISIONS.md

# Current phase & task

- Phase: **P0 — Setup** (docs, agent config, scaffold, first commit).
- Task: P-001 project setup, executed under the **Stafy** brand (renamed from the original "PeopleOps" draft — see `docs/prompts/P-001-project-setup.md`).

# Status of phases

| Phase | Status | Archive link |
|---|---|---|
| P0 | In progress | — |
| P1 | Not started | — |
| P2 | Not started | — |
| P3 | Not started | — |
| P4 | Not started | — |
| P5 | Not started | — |
| P6 | Not started | — |
| P7 | Not started | — |
| P8 | Not started | — |

# Done in current phase

- Full docs system created under `docs/` (this file, PRD, PLANNING, ARCHITECTURE, SECURITY, DATABASE, BUSINESS_RULES, TESTING, PHASES, DECISIONS, DESIGN, AI_DEVELOPMENT, AI_CODE_REVIEW, prompts/).
- Claude Code configuration created (`AGENTS.md`, `CLAUDE.md`, `.claude/agents/*`, `.claude/skills/*`, `.claude/settings.json`).
- Monorepo scaffold created (client, server, api, supabase/migrations, CI workflow) with `/api/health` and an empty routed client shell.
- Commit hashes: TBD — filled in after the three P0 commits land (see `docs/AI_DEVELOPMENT.md` P-001 entry).
- Verified for real: `npm install` (326 packages), `npm run lint` (0 errors, 8 expected warnings on TODO stub unused-args), `npm run test:unit` (1/1 passing — the `/api/health` smoke test), `npm run dev` (client `200` at `:5173`, `GET /api/health` → `{"status":"ok"}` at `:4000`).

# In progress / next up

1. Human: create Supabase project, run the DB design in `docs/DATABASE.md` as an actual migration, populate `.env`.
2. Human: fill `docs/DESIGN.md` tokens from the landing-page design reference (P-002).
3. P1 Foundation: migrations, seed, auth endpoints, `authenticate`/`authorize`/`validate` middleware, policies, domain pure functions + unit tests, Vercel skeleton deploy.
4. Confirm Vercel CLI upgrade (`vercel@59.11.7` → `59.17.0`) before any deploy step — flagged by the environment, not yet actioned.
5. Fill demo account passwords via `DEMO_PASSWORD` once Supabase project exists.

# Open questions

None blocking as of this entry. Technical verification items resolved during P0 (see `docs/DECISIONS.md` ADR-002, ADR-003, ADR-018/ADR-025 as applicable) — see "Gotchas" below.

# Known issues / tech debt

- None yet — no feature code exists.

# Gotchas discovered

- **Supabase API keys are mid-migration**: legacy `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_ANON_KEY` still work but are deprecated (removal by end of 2026). This project uses the new `SUPABASE_SECRET_KEY` (`sb_secret_...`) and `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`) names from the start. See `docs/ARCHITECTURE.md` env var table.
- **Token verification uses `getClaims()`, not `getUser()`**: `getClaims()` verifies against the cached JWKS (fast, no network round-trip per request) but does not itself check live revocation. This is acceptable here because ADR-004's per-request `employees` row lookup already enforces "deactivated → 401 immediately" independent of token state. See ADR-003.
- **Vercel Express hosting**: `api/index.js` exporting the Express app for the Node.js runtime is still the current, correct pattern (Fluid Compute is the default runtime now, no Edge needed for this stack). No deviation from the original prompt.
- The Vercel CLI installed locally (59.11.7) is behind latest (59.17.0); not required for P0 (no deploy performed yet).
- `npm audit` reports 5 dev-only vulnerabilities (moderate/high/critical) in the `vitest`/`vite`/`esbuild` dev-server toolchain (path traversal / arbitrary request handling in the *local dev server*, not production code). Fixing requires a breaking `vitest@5` upgrade — deferred; not a production risk since these packages never ship to the deployed app. Revisit if time allows in P7 hardening.

# Completed phases

(None yet.)
