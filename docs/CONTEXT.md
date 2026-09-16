> Status: Living   ·   Last updated: 2026-09-16 00:15 IST   ·   Owner: Ankush
> Related: docs/PHASES.md, docs/DECISIONS.md

# Current phase & task

- Phase: **P0** done. **P2** done: brand/landing design (P-002), UI implementation against mocks (P-003), and the dashboard design port (P-004/P-005).
- Task just finished: P-005 — ported the real "Stafy Dashboards" Claude Design export into React, replacing P-003's placeholder app shell and three role dashboards (visual-layer swap only, mock data unchanged except one additive `approvals` array).
- Next: **P1 — Foundation** (migrations, seed, real auth, middleware, policies, domain functions + unit tests, Vercel skeleton deploy). Once P1's real API exists, `lib/api.js`'s `USE_MOCKS` flag flips and `mocks/` is deleted — no component code should need to change.

# Status of phases

| Phase | Status | Archive link |
|---|---|---|
| P0 | Done | — (small enough to leave inline; see "Done in current phase" below) |
| P1 | Not started | — |
| P2 | Done (design P-002 + mock UI build P-003) | — |
| P3 | Not started (real employees module; UI shell already exists via P-003's `ComingSoonPage`) | — |
| P4 | Not started (real attendance; UI shell already exists) | — |
| P5 | Not started (real leave; UI shell already exists) | — |
| P6 | Not started (dashboards already built against mocks in P-003 — P6 becomes "swap to real data") | — |
| P7 | Not started | — |
| P8 | Not started | — |

# Done in current phase

- Full docs system, Claude Code config, and monorepo scaffold (P0) — see `docs/archive/` once P0 is formally archived.
- **P-002**: real Claude Design deliverable (owner-provided) adopted as canonical. `docs/DESIGN.md` tokens are real values, zero `TBD` remaining. Canvases: [Brand Assets](https://claude.ai/code/artifact/e52a7b85-d0a4-42b2-a2f3-0866c8be2356), [Landing](https://claude.ai/code/artifact/b612f28c-00a6-482b-a2c7-30e27125027a). ADR-025.
- **P-003**: landing page fully ported to React (10 sections, real GSAP/ScrollTrigger/Flip motion), `/login` + `/activate` (mock auth), app shell with role-filtered nav, 3 real dashboards on mock data (admin/manager/employee), interactive employee check-in with elapsed timer, real Privacy/Terms pages, on-brand 404. ADR-026 (activation flow, not public sign-up). Mock seam: `client/src/lib/api.js` (`USE_MOCKS = true`) + `client/src/mocks/*`.
  - Fixed during testing: `window.gsap`/`window.ScrollTrigger`/`window.Flip` leftovers from the CDN-based design source (AICR-002).
  - Lighthouse on the production build: **93 / 97 / 100 / 100** (Performance/Accessibility/Best Practices/SEO), after route-level code-splitting and switching Google Fonts to a non-render-blocking load (first measurement was Performance 81, before those two fixes).
  - Verified in a real browser: all routes, role-based nav filtering, the check-in interaction, `/activate` with/without a token, 404, and mobile nav drawer at a narrow viewport.
- **P-005**: real dashboard design (from a Claude Design `.dc.html` zip export) ported into React — `features/app-shell/` (Sidebar/MobileNav/Drawer/Topbar/UserMenu/SignOutConfirmDialog), and Admin/Manager/Employee dashboards rebuilt to match, still on mock data. `StatCard` extended with an additive `tint` prop. Fixed a real P-003 gap found in the process: Manager's "My Team" and Employee's "My Profile" nav items were spec'd in P-004 but never wired up (AICR-003) — added `/app/team` and `/app/profile` routes.
- Commit hashes: `ce5ff95`, `ae2c97b`, `3575465`, `9548e54` (P0); `9b40e47`, `85c54a7` (P-002); P-003 and P-005 commit(s) TBD after this task's commits land.

# In progress / next up

1. Human: create Supabase project, run the DB design in `docs/DATABASE.md` as an actual migration, populate `.env`.
2. P1 Foundation: migrations, seed, real auth endpoints, `authenticate`/`authorize`/`validate` middleware, policies, domain pure functions + unit tests, Vercel skeleton deploy — then flip `USE_MOCKS = false` and delete `client/src/mocks/`.
3. Rasterize the 1200×630 social preview and 180×180 apple-touch icon (currently HTML/SVG mockups only) before the real deploy.
4. Fill demo account passwords via `DEMO_PASSWORD` once Supabase project exists.

# Open questions

None blocking as of this entry.

# Known issues / tech debt

- `client/src/mocks/*` and the mock branch of `lib/api.js` are temporary — must be deleted, not extended, once P1's real API exists (per P-003's own scope boundary).
- `/activate`'s mock token check accepts any non-empty string — real signed/expiring tokens land with HR's "add employee" flow (ADR-026).
- No font self-hosting/subsetting yet (Google Fonts loaded via preload+swap instead) — acceptable since Lighthouse already clears 90 without it; revisit only if a future page regresses the score.

# Gotchas discovered

- **Supabase API keys are mid-migration**: use the new `SUPABASE_SECRET_KEY`/`SUPABASE_PUBLISHABLE_KEY` names, not the legacy `service_role`/`anon`. See `docs/ARCHITECTURE.md` env var table, ADR-003.
- **Token verification uses `getClaims()`, not `getUser()`** — see ADR-003.
- **Vercel Express hosting**: `api/index.js` exporting the Express app is still correct under Fluid Compute.
- `npm audit` reports 5 dev-only vulnerabilities in the `vitest`/`vite`/`esbuild` dev toolchain — not a production risk, deferred to P7.
- **No `claude_design` MCP tool exists in this Claude Code session** — importing an existing `claude.ai/design/p/...` project by URL is a claude.ai/design (web-only) capability. If a future prompt references one, ask the human to export/share the content directly (zip export worked well) rather than attempting to fetch it.
- **Porting a Claude Design `.dc.html` into React**: grep for `window.gsap`/`window.ScrollTrigger`/`window.Flip` before calling a port done — the design source assumes CDN globals; the app imports GSAP as npm modules instead (AICR-002, now also an `AGENTS.md` §6 rule).
- **The Claude Design canvas preview doesn't run GSAP/ScrollTrigger/Flip** (CDN `<script>` blocked by the sandbox's CSP) — don't read "no animation in the design canvas" as a defect; it only fully plays once ported into the real app.
- **Automated browser tabs report `document.hidden = true`**, which throttles `requestAnimationFrame` and makes GSAP timelines (hero story, StatCard count-ups) appear to progress very slowly during automated testing. Confirmed via longer waits that they complete correctly — this is a testing-tool artifact (no real OS focus), not an app bug. A normally-focused user tab is unaffected. The `useIstClock` hook correctly pauses its `setInterval` under the same `document.hidden` check, by design.
- `resize_window` on an already-navigated tab does not reliably change the rendered viewport for screenshots in this session's browser tool — resize a **fresh** tab (before navigating) to test responsive breakpoints reliably.
- `{{SITE_URL}}` stays a placeholder until the real Vercel URL exists (P1 exit criteria). `{{REPO_URL}}` already resolves to `https://github.com/AnkushGitRepo/Stafy` throughout the ported code.

# Completed phases

(None formally archived yet — P0/P2 detail still lives inline above; archive once P1 closes.)
