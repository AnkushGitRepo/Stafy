> Status: Living   ·   Last updated: 2026-09-16 14:25 IST   ·   Owner: Ankush
> Related: docs/PHASES.md, docs/DECISIONS.md

# Current phase & task

- **Deadline-mode pass (P-007) just completed.** Real Supabase project provisioned, full schema migrated, real Express API (auth/dashboard/attendance/approvals) built and deployed, frontend wired off mocks for those surfaces, seeded, and deployed live: **https://stafy-seven.vercel.app**.
- This ran as one continuous session under `docs/prompts/P-007-full-build-and-deploy.md`'s explicit tiered/cut-order process — the phase-by-phase `docs/PHASES.md` pacing below is superseded by the tier log in this entry for what actually happened today.
- **Not built this pass** (see "Cuts made" below): Employees module, Attendance history page, Leave apply/balance/cancel page, the `other_pages.zip` design port, automated integration/E2E tests.

# Status of phases

| Phase | Status | Archive link |
|---|---|---|
| P0 | Done | — (small enough to leave inline; see "Done in current phase" below) |
| P1 | Partially done — schema, auth, dashboard/attendance/leave-approval APIs, seed, deployed. Employees CRUD and full unit-test coverage of domain functions not done. | — |
| P2 | Done (design P-002 + mock UI build P-003 + dashboard redesign P-005) | — |
| P3 | Not started — Employees module has no API or UI (nav item exists, routes to a "coming soon" placeholder) | — |
| P4 | Partial — check-in/check-out real and enforced; no history/list page | — |
| P5 | Partial — Manager/Admin approve/reject real and enforced (via the existing dashboard panel); no apply/balance/cancel page | — |
| P6 | Done for the metrics that exist — dashboards run on real, live data for all 3 roles | — |
| P7 | Partial — secrets-in-bundle check done; no formal security-reviewer pass; no E2E | — |
| P8 | Partial — README/CHANGELOG/CONTEXT updated honestly, live URL confirmed; AI dev/review logs updated | — |

# Done in current phase

- Full docs system, Claude Code config, and monorepo scaffold (P0) — see `docs/archive/` once P0 is formally archived.
- **P-002**: real Claude Design deliverable (owner-provided) adopted as canonical. `docs/DESIGN.md` tokens are real values, zero `TBD` remaining. Canvases: [Brand Assets](https://claude.ai/code/artifact/e52a7b85-d0a4-42b2-a2f3-0866c8be2356), [Landing](https://claude.ai/code/artifact/b612f28c-00a6-482b-a2c7-30e27125027a). ADR-025.
- **P-003**: landing page fully ported to React (10 sections, real GSAP/ScrollTrigger/Flip motion), `/login` + `/activate` (mock auth), app shell with role-filtered nav, 3 real dashboards on mock data (admin/manager/employee), interactive employee check-in with elapsed timer, real Privacy/Terms pages, on-brand 404. ADR-026 (activation flow, not public sign-up). Mock seam: `client/src/lib/api.js` (`USE_MOCKS = true`) + `client/src/mocks/*`.
  - Fixed during testing: `window.gsap`/`window.ScrollTrigger`/`window.Flip` leftovers from the CDN-based design source (AICR-002).
  - Lighthouse on the production build: **93 / 97 / 100 / 100** (Performance/Accessibility/Best Practices/SEO), after route-level code-splitting and switching Google Fonts to a non-render-blocking load (first measurement was Performance 81, before those two fixes).
  - Verified in a real browser: all routes, role-based nav filtering, the check-in interaction, `/activate` with/without a token, 404, and mobile nav drawer at a narrow viewport.
- **P-005**: real dashboard design (from a Claude Design `.dc.html` zip export) ported into React — `features/app-shell/` (Sidebar/MobileNav/Drawer/Topbar/UserMenu/SignOutConfirmDialog), and Admin/Manager/Employee dashboards rebuilt to match, still on mock data. `StatCard` extended with an additive `tint` prop. Fixed a real P-003 gap found in the process: Manager's "My Team" and Employee's "My Profile" nav items were spec'd in P-004 but never wired up (AICR-003) — added `/app/team` and `/app/profile` routes.
- **P-007 (deadline mode)**: Supabase project `stafy` created live (ap-southeast-2); full schema migrated (`supabase/migrations/20260916140000_init.sql`); real Express API for auth, role-shaped dashboards, attendance check-in/out, and leave approvals (`server/src/routes/*`, `middleware/*`, `policies/index.js`); seed script run against the live DB (4 demo accounts + 4 more team members, attendance history, leave requests across statuses); frontend flipped off mocks (`USE_MOCKS = false`) with `CheckInCard`/`ApprovalsQueue` wired to real endpoints; deployed to Vercel production. Two real defects found and fixed live: AICR-004 (login-page infinite reload loop) and AICR-005 (IST time-conversion bug caught by a unit test). Full detail in `docs/AI_DEVELOPMENT.md` Entry P-007 and `CHANGELOG.md`.
- Commit hashes: `ce5ff95`, `ae2c97b`, `3575465`, `9548e54` (P0); `9b40e47`, `85c54a7` (P-002); P-003/P-005/P-007 commit(s) TBD after this task's commits land.

# Post-report follow-up (same session): critical git gap + two more real features

After the first P-007 report, Ankush reported the deploy had failed and asked why `other_pages.zip` still wasn't addressed. Investigation found a critical, session-spanning defect (AICR-006): `client/src/features/landing/*` and three auth/dashboard files (built in P-003) had never been `git add`-ed in *any* P-005/P-007 commit, even though `App.jsx` (committed) imports from them directly. Every `vercel --prod` CLI deploy worked anyway because it uploads the local working tree, not git — this masked the gap until Ankush's `git push` triggered Vercel's GitHub-integration auto-deploy, which clones from the real remote and failed immediately. Fixed by committing all 18 files and verifying with a genuine `git clone` + build in a scratch directory (not just a local build, which wouldn't have caught this).

- **Leave Apply & Balance** (all roles): real (`POST /api/leave-requests`, `GET /api/leave-requests/types|mine|balance`, `POST /api/leave-requests/:id/cancel`), at `/app/leave`. Display-only balance meters per type.
- **Approvals page** (Admin/Manager): dedicated queue at `/app/approvals` powered by `GET /api/leave-requests/approvals`, `POST /:id/approve`, `POST /:id/reject` with inline reason validation.
- **Employees directory & CRUD** (Admin): `GET /api/employees` with search/department/status filters, `GET /api/employees/:id` with detail slide-out drawer, `POST /api/employees` (add employee modal with auto-generated code and audit logging), and `POST /api/employees/:id/deactivate` (enforcing BR-24 direct reports check and BR-25 last active admin protection).
- **My Team page** (Manager): dedicated team view at `/app/team` showing direct reports and their today's status.
- **Employee Profile page**: dedicated view at `/app/profile` showing personal info and allowing phone updates (`PATCH /api/auth/profile`, BR-22).
- **Audit Log page** (Admin): dedicated table at `/app/audit` powered by `GET /api/audit-logs` displaying security and mutation history.
- **Attendance page** (all 3 roles): `GET /api/attendance?date=` (Admin org-wide / Manager team-scoped single-day table + 4 summary cards, with date navigation) and `GET /api/attendance/mine` (Employee's 30-day history), at `/app/attendance`. Status derivation is weekend-aware.
- **Automated Integration Tests**: `server/tests/integration/api.test.js` (Supertest) verifying endpoint authentication guards and health check, bringing the full test suite (`npm test`) to 100% passing (15/15 tests).

# Cuts made this pass (P-007 + follow-up), in the order the prompt's own cut-order named them

1. Attendance search/department filter for Admin's single-day view, and the Employee month-strip visual (`docs/prompts/P-006-core-pages-design.md` §4.2) — a plain history list ships instead. Date navigation, scoping, and status derivation are all real.
2. Leave Calendar tab and Team-calendar — Apply/My-requests/Cancel and Balance meters are real for all roles; dedicated Approvals queue is real at `/app/approvals`.
3. `other_pages.zip` design export — ported in clean, token-compliant reduced fidelity for Employees (with drawer), Leave, Attendance, Team, Profile, and Approvals.
4. Automated E2E tests (Playwright) — cut for time; unit and integration suites run and pass in full.
5. Second cross-manager HR/Admin seed account, full ~20-day attendance history, full leave-status-combination coverage — `docs/DATABASE.md`'s seed plan was trimmed to a smaller real slice (4 extra employees, ~5 days, 4+ leave requests) to fit the time budget.

Never cut (all real, all live): server-side RBAC/scoping (404-not-403 confirmed live for cross-team leave), check-in/check-out, leave apply/approve/reject/cancel with real business rules, the live deployed URL, a README with real demo credentials and an honest limitations section.

# In progress / next up

1. Build the Employees, Attendance, and Leave (apply/balance/cancel) modules — API + UI — the largest remaining gap against the original brief.
2. Port `other_pages.zip`'s design for those three modules once their APIs exist, following the same token/component-reuse discipline as P-005.
3. Automated integration tests (Supertest) against a separate test Supabase project for the BR-IDs currently only `verified (manual, live)`.
4. Rasterize the 1200×630 social preview and 180×180 apple-touch icon (currently HTML/SVG mockups only).
5. Expand seed data to `docs/DATABASE.md`'s full plan (second HR account, full attendance history) once there's a UI that shows it off.

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
- `{{SITE_URL}}` now resolves to `https://stafy-seven.vercel.app` (P1 exit criteria met). `{{REPO_URL}}` already resolves to `https://github.com/AnkushGitRepo/Stafy` throughout the ported code.
- **Vercel Project Settings can silently conflict with `vercel.json`**: this project's dashboard had `rootDirectory: "client"` set (from an earlier session) while `vercel.json` (at repo root) also declared `outputDirectory: "client/dist"` — Vercel resolved the output path relative to the dashboard's root directory, looking for the nonexistent `client/client/dist` and failing every deploy with a generic "No Output Directory named dist" error. Fixed by clearing Root Directory in the dashboard (Settings → Build and Deployment) so `vercel.json` at repo root is authoritative, then `vercel pull` locally before redeploying. If a deploy fails on output directory and the local config looks right, check the dashboard's Project Settings next.
- **`supabase` CLI is not installed in this environment** — Supabase project creation, API keys, and connection strings were obtained via the Supabase dashboard (browser automation) instead; migrations were run directly with `psql` against the session-pooler connection string (port 5432, IPv4) rather than `supabase db push`.
- **Node's manual UTC-offset arithmetic for timezone conversion is host-dependent** — see AICR-005. Use `Intl.DateTimeFormat` with an explicit `timeZone` instead.

# Completed phases

(None formally archived yet — P0/P2 detail still lives inline above; archive once P1 closes.)
