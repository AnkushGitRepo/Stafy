> Status: Living   ·   Last updated: 2026-09-15 22:45 IST   ·   Owner: Ankush
> Related: docs/PHASES.md, docs/DECISIONS.md

# Current phase & task

- Phase: **P0 — Setup** done; **P2's design half** (brand identity + landing page design, P-002) done.
- Task: P-002 brand/landing design executed — real Claude Design deliverable adopted (see `docs/prompts/P-002-brand-and-landing-design.md`, ADR-025). P-003 (UI implementation) is next and was already drafted by the owner.
- Next: **P1 — Foundation** (migrations, seed, auth, middleware, policies, domain functions + unit tests, Vercel skeleton deploy) and **P-003** (landing/auth/dashboard UI implementation from the P-002 design) can both proceed now that `docs/DESIGN.md` has zero `TBD` tokens.

# Status of phases

| Phase | Status | Archive link |
|---|---|---|
| P0 | Done | — (small enough to leave inline; see "Done in current phase" below) |
| P1 | Not started | — |
| P2 | Design done (P-002); build pending (P-003) | — |
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
- Commit hashes: `ce5ff95` (docs), `ae2c97b` (agent config), `3575465` (scaffold).
- Verified for real: `npm install` (326 packages), `npm run lint` (0 errors, 8 expected warnings on TODO stub unused-args), `npm run test:unit` (1/1 passing — the `/api/health` smoke test), `npm run dev` (client `200` at `:5173`, `GET /api/health` → `{"status":"ok"}` at `:4000`).
- **P-002 brand/landing design done**: real Claude Design deliverable (owner-provided, built in a separate claude.ai/design session from the P-002 brief) adopted as canonical. `docs/DESIGN.md` tokens are real values, zero `TBD` remaining. Canvases: [Brand Assets](https://claude.ai/code/artifact/e52a7b85-d0a4-42b2-a2f3-0866c8be2356), [Landing](https://claude.ai/code/artifact/b612f28c-00a6-482b-a2c7-30e27125027a). ADR-025 recorded.

# In progress / next up

1. Human: create Supabase project, run the DB design in `docs/DATABASE.md` as an actual migration, populate `.env`.
2. P-003: implement landing/auth/dashboard UI from the P-002 design (already drafted by the owner as `docs/prompts/P-003-landing-auth-dummy-dashboard.md`, not yet run).
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
- **No `claude_design` MCP tool exists in this Claude Code session**: importing an existing `claude.ai/design/p/...` project by URL is a claude.ai/design (web-only) capability. The local `design` skill can only *create* new canvases, not read existing ones. If a future prompt references a `claude.ai/design/p/...` URL, treat it as unreachable from here and ask the human to export/share the content directly (zip export worked well) rather than attempting to fetch it.
- **Lighthouse risk flagged by the P-002 design itself**: GSAP + ScrollTrigger + Flip ≈70KB gzipped, plus two Google Fonts families (Bricolage Grotesque, Hanken Grotesk) add two extra network requests. P-003/P2 must self-host and subset both fonts, and consider dropping `Flip` (crossfade instead) for the role-switcher metrics, to hit the P2 exit criterion of Lighthouse ≥90 on the landing page.
- The landing design's GSAP/ScrollTrigger/Flip `<script src>` tags point at `cdn.jsdelivr.net` — that's correct for the eventual real deployed app (once P-003 wires them as real npm dependencies per `docs/ARCHITECTURE.md`), but those CDN scripts do **not** execute inside the Claude Design canvas's sandboxed preview (no third-party script egress there). Don't read "no animation in the design canvas preview" as a defect — the motion only fully plays once ported into the real app.
- `{{SITE_URL}}` in the landing design (canonical/OG/Twitter URLs) stays a placeholder until the real Vercel URL exists (P1 exit criteria). `{{REPO_URL}}` already resolves to `https://github.com/AnkushGitRepo/Stafy`.

# Completed phases

(None yet.)
