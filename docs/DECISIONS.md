> Status: Living   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/BUSINESS_RULES.md, docs/ARCHITECTURE.md, docs/SECURITY.md, docs/DATABASE.md

# Decisions (ADR log)

Never edit an accepted ADR's decision — supersede it with a new ADR instead.

| ID | Title | Status | Date |
|---|---|---|---|
| ADR-001 | Stack selection (React/Vite/JS + Express/JS + Supabase + Vercel) | Accepted | 2026-09-15 |
| ADR-002 | Deployment topology: same-origin client + API | Accepted | 2026-09-15 |
| ADR-003 | Authentication: Supabase Auth via server-only cookies | Accepted | 2026-09-15 |
| ADR-004 | Authorization source of truth: DB row, not JWT | Accepted | 2026-09-15 |
| ADR-005 | Defense in depth: RLS deny-all + layered API | Accepted | 2026-09-15 |
| ADR-006 | Data access: raw parameterized SQL via `pg`, no query builder | Accepted | 2026-09-15 |
| ADR-007 | Three-layer authorization (DB / API / UI) | Accepted | 2026-09-15 |
| ADR-008 | Resource scoping and IDOR defense (404, not 403) | Accepted | 2026-09-15 |
| ADR-009 | Leave approval routing (single approver, no 2-manager scheme) | Accepted | 2026-09-15 |
| ADR-010 | Leave statuses include `cancelled` beyond the PDF's three | Accepted | 2026-09-15 |
| ADR-011 | Time/attendance derivation, IST, 4h30m half-day threshold | Accepted | 2026-09-15 |
| ADR-012 | (reserved — not used in planning conversation) | — | — |
| ADR-013 | Organization model: everyone is an employee; role = permission level | Accepted | 2026-09-15 |
| ADR-014 | Leave balance computed, not stored; no carry-forward | Accepted | 2026-09-15 |
| ADR-015 | Docs system: `AGENTS.md` canonical, `CLAUDE.md` imports it | Accepted | 2026-09-15 |
| ADR-016 | Web quality checklist scope | Accepted | 2026-09-15 |
| ADR-017 | Motion: GSAP-rich landing, purposeful motion in-app | Accepted | 2026-09-15 |
| ADR-018 | Brand name: "Stafy" (renamed from working title "PeopleOps") | Accepted | 2026-09-15 |
| ADR-019 | Responsive web only, no native/Expo app | Accepted | 2026-09-15 |
| ADR-020 | Testing strategy: Vitest + Supertest + Playwright | Accepted | 2026-09-15 |
| ADR-021 | Build order: foundation before pages | Accepted | 2026-09-15 |
| ADR-022 | HR attendance correction out of scope for v1 | Accepted | 2026-09-15 |
| ADR-023 | Demo safety: seed reset, last-admin protection | Accepted | 2026-09-15 |
| ADR-024 | Optional features chosen vs. rejected for time | Accepted | 2026-09-15 |

---

## ADR-001: Stack selection

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Need a stack deliverable inside a ~24h window (feature freeze 2026-09-16 13:00 IST) that scores well on business-logic/authorization rigor, not code volume.
- Discussion: TypeScript was raised as the safer default. Owner chose plain JavaScript to move faster and reduce tooling friction for a solo, timeboxed build. Claude pushed back that this raises correctness risk at API boundaries; agreed mitigation is Zod validation on every boundary plus JSDoc on domain functions. MongoDB was raised as an alternative to Postgres; rejected because overlap checks (BR-02) and unique-per-day attendance (BR-14) need relational exclusion/unique constraints and multi-statement transactions that Mongo does not give for free.
- Options considered:
  1. TypeScript everywhere — pros: compile-time safety; cons: slower iteration under time pressure, more setup.
  2. JavaScript + Zod at boundaries (chosen) — pros: fast iteration; cons: no compile-time exhaustiveness, relies on discipline + tests.
  3. MongoDB instead of Postgres — pros: schema flexibility; cons: no native exclusion constraints for date-range overlap, no multi-document ACID transaction ergonomics as simple as Postgres for approve/cancel/apply-leave.
- Decision: React 19 + Vite + JS + React Router + TanStack Query + React Hook Form + Zod + Tailwind v4 + `sonner` + `lucide-react` + GSAP/`@gsap/react`/ScrollTrigger on the frontend. Node 20+ / Express 5 + JS (ESM) + Zod + `pg` + `helmet` + `cookie-parser` + `pino` on the backend. Supabase (Postgres + Auth). Vercel hosting. Vercel Web Analytics. Vitest + Supertest + Playwright for tests.
- Why: (1) fastest path to a working, testable app for one person in one day; (2) Postgres constraints/transactions map directly onto the hardest business rules (BR-02, BR-04, BR-12, BR-14); (3) same stack across client/server (JS) reduces context switching.
- Tradeoffs / consequences: No compile-time type safety — mitigated by Zod schemas at every API boundary and JSDoc types on domain functions, enforced by ESLint.
- Revisit if: project continues past the assessment and a team forms — TypeScript migration becomes worth the cost then.
- Links: BR-01…BR-26, ARCHITECTURE.md dependency list.

## ADR-002: Deployment topology

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: PDF requires a deployed, working demo. Need to decide client/API topology under Vercel.
- Discussion: Considered separate client (Vercel) + API (separate host) vs. one Vercel project serving both. Verified current Vercel guidance (2026-09) before finalizing: Vercel Functions in `/api` on the Node.js runtime under Fluid Compute (the current default runtime) still support a plain Express app exported as the request handler — no Edge runtime is required or recommended for this use case; Edge is no longer the recommended default for anything needing full Node APIs. This confirms the original approach (`api/index.js` exporting the Express app) is current, not stale guidance.
- Options considered:
  1. Separate client host + separate API host — pros: independent scaling; cons: CORS complexity, two deploy pipelines, cookie `SameSite` friction across origins.
  2. One Vercel project, static client + Express under `/api/*` (chosen) — pros: same-origin cookies (`SameSite=Lax`/`Strict`, `HttpOnly`, `Secure`), no CORS, one deploy.
- Decision: Single Vercel project. Static client build served at the root; Express app exported from `api/index.js`, routed via `vercel.json` rewrites (`/api/*` → `api/index.js`, SPA fallback → `/index.html`).
- Why: Removes an entire class of CORS/cookie bugs before the deadline; simplest possible deploy topology for a one-person build.
- Tradeoffs / consequences: API and client scale together (acceptable for a demo-scale assessment app). No independent API versioning.
- Revisit if: traffic or team size grows enough to justify independent scaling.
- Links: ARCHITECTURE.md system diagram, `vercel.json`.

## ADR-003: Authentication

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Need to decide where credentials live, how the browser gets a session, and which Supabase server-side verification method to use on every request.
- Discussion: Two things needed verifying against current (2026-09) Supabase docs before locking this in: (1) the recommended server-side JWT verification call, and (2) current key naming. On (1): Supabase's current guidance distinguishes `getClaims()` (verifies against the cached JWKS endpoint, no network round-trip per call, but does not itself check live revocation) from `getUser()` (network call to the Auth server every time, always reflects current revocation/user state). Chosen: `getClaims()`, because ADR-004 already re-loads the `employees` row by `auth_user_id` on every request and treats DB `employment_status` as authoritative — a deactivated employee is already rejected with `401` independent of token freshness, so `getUser()`'s extra network round trip buys nothing here and would only add latency to every request. On (2): Supabase is mid-migration from `anon`/`service_role` keys to `publishable`/`secret` keys (legacy names still work but are slated for removal by end of 2026); this project starts on the new naming from day one.
- Options considered:
  1. `getUser()` on every request — pros: always current revocation state from Supabase; cons: extra network hop per request, redundant given ADR-004's DB check.
  2. `getClaims()` on every request (chosen) — pros: fast (JWKS cached), no per-request network call to Auth; cons: doesn't itself see revocation — mitigated by ADR-004.
  3. Legacy `anon`/`service_role` key names — rejected, deprecated path.
- Decision: Credentials live only in Supabase Auth (bcrypt hashing handled by Supabase); the app never stores passwords. Browser never talks to Supabase directly and holds no Supabase keys. `POST /api/auth/login` → Express calls Supabase Auth → Express sets access + refresh tokens as `HttpOnly; Secure; SameSite` cookies. Endpoints: `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `GET /api/auth/me`. Middleware verifies tokens with `getClaims()`. Server env vars use current names: `SUPABASE_SECRET_KEY` (`sb_secret_...`, replaces `service_role`) and `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`, replaces `anon`). HR creates employee login accounts through the Supabase Admin API using the secret key, server-side only.
- Why: keeps all secrets server-side; matches ADR-002's same-origin cookie approach; `getClaims()` keeps authenticated requests fast without weakening security given ADR-004's independent DB check.
- Tradeoffs / consequences: If ADR-004's DB check were ever removed, `getClaims()` alone would under-detect a just-revoked session until token expiry — this coupling must not be broken without revisiting this ADR.
- Revisit if: ADR-004's per-request DB lookup is ever removed or made optional for performance reasons.
- Links: ADR-004, ADR-002, `docs/ARCHITECTURE.md` env var table, `docs/SECURITY.md` cookie table.

## ADR-004: Authorization source of truth

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: PDF requires strict role-based access. JWT claims are attacker-adjacent (client-cached) and slow to invalidate.
- Discussion: Straightforward — no real alternative was seriously entertained given the deactivation requirement (BR-24) needs to take effect immediately, not at token expiry.
- Options considered:
  1. Trust role/status from JWT claims — pros: no extra DB round trip; cons: stale on role change or deactivation until token expiry.
  2. Load the `employees` row by `auth_user_id` on every authenticated request (chosen) — pros: role/status/team always current; cons: one extra indexed lookup per request (cheap).
- Decision: On every authenticated request, middleware loads the `employees` row by `auth_user_id`. Role, status, and team come from that row, never from JWT claims or the client. Deactivated employees get `401` on every request immediately, even with a valid token.
- Why: closes the "deactivated user with valid token" threat (see `docs/SECURITY.md`) without needing token revocation infrastructure.
- Tradeoffs / consequences: One extra indexed query per request — acceptable at this scale.
- Revisit if: request volume makes the per-request lookup a measured bottleneck (add caching with explicit invalidation on role/status change).
- Links: ADR-003, BR-24, BR-25, `docs/SECURITY.md` threat table.

## ADR-005: Defense in depth — RLS deny-all

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Need to decide how much authorization logic lives in Postgres RLS vs. the API layer, given the one-day timebox.
- Discussion: Using RLS policies as the primary authorization mechanism (mirroring every BR as a policy) was considered and rejected purely for time — it would duplicate every business rule in two places (SQL policies and API services) and double the surface for bugs before the deadline.
- Options considered:
  1. Full RLS policy set mirroring all BRs — pros: DB-enforced even if API has a bug; cons: duplicates all logic, high time cost, harder to unit test than plain functions.
  2. RLS enabled with zero policies (deny-all) on every table, real authorization in the API layer (chosen) — pros: single source of truth for business logic (services/policies), still closes the "leaked anon/publishable key" threat since deny-all blocks the `anon`/`authenticated` Postgres roles entirely; cons: RLS is not the primary defense — a server-side authorization bug is still exploitable via the privileged connection.
- Decision: `ENABLE ROW LEVEL SECURITY` on every public table, no policies. The server connects with the privileged (secret-key-backed / direct Postgres) connection string, so RLS does not affect server queries; it only protects against a leaked publishable key ever reading anything.
- Why: matches the one-day timebox while still closing the highest-value threat (leaked client-side key) cheaply.
- Tradeoffs / consequences: All real authorization must be correct in the API layer — layers 2 and 3 in ADR-007 carry the actual weight.
- Revisit if: the project grows a public/anon-accessible surface that talks to Supabase directly from the browser.
- Links: ADR-007, `docs/DATABASE.md` RLS section, `docs/SECURITY.md`.

## ADR-006: Data access

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Need transactional approve/cancel/apply-leave flows (BR-04, BR-12, BR-13) and IDOR-safe scoped reads (ADR-008).
- Discussion: The supabase-js query builder was considered since it's the "default" way to talk to Supabase; rejected because it has no multi-statement transaction support, which BR-04 and BR-12/13 require.
- Options considered:
  1. supabase-js query builder — pros: less boilerplate; cons: no multi-statement transactions.
  2. `pg` against the Supabase transaction pooler with raw parameterized SQL in repository files (chosen) — pros: full transaction control, explicit scoped queries; cons: more boilerplate SQL to write and review.
- Decision: Use `pg` (node-postgres) against the Supabase transaction pooler connection string (serverless-safe). All SQL is raw and parameterized, isolated to repository files. Transactions wrap approve, cancel, and apply-leave. Migrations are SQL files in `supabase/migrations/`.
- Why: transactional correctness for the highest-risk business rules matters more than query-builder convenience.
- Tradeoffs / consequences: More manual SQL, more surface for a missed `WHERE` scope clause — mitigated by ADR-008 (every repository read/write takes an actor/scope param) and `security-reviewer` subagent checks.
- Revisit if: the query surface grows large enough that raw SQL becomes a maintenance burden (consider a lightweight query builder that still supports transactions, e.g. Kysely).
- Links: ADR-008, `docs/ARCHITECTURE.md` layering rules.

## ADR-007: Three-layer authorization

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Given ADR-005 (RLS deny-all, not the primary defense), need an explicit, named layering for where authorization actually happens.
- Discussion: Direct consequence of ADR-005 — recorded separately because it defines the concrete request pipeline every route must follow.
- Options considered: (single approach adopted; alternatives are variations already covered by ADR-005's discussion)
- Decision: Layer 1 (DB): constraints only (check/unique/exclusion/FK), RLS deny-all. Layer 2 (API): `authenticate` → `authorize(policy)` → `validate(zod)` → service (business rules) → repository (scoped queries). Layer 3 (UI): route guards and hidden actions for UX only — never the only check.
- Why: gives every route a single, auditable pipeline shape; makes the `security-reviewer` subagent's job mechanical (check each route follows the pipeline).
- Tradeoffs / consequences: Every new route must be reviewed against this pipeline; skipping a step (e.g. inline `role ===` check instead of `authorize(policy)`) is the primary defect pattern to watch for.
- Revisit if: never, without superseding ADR-005 first.
- Links: ADR-005, `docs/ARCHITECTURE.md` request lifecycle, `.claude/agents/security-reviewer.md`.

## ADR-008: Resource scoping and IDOR defense

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Every by-ID read/write is a potential IDOR (a manager fetching another team's leave request by guessing its ID, etc.).
- Discussion: Choosing between `403 Forbidden` and `404 Not Found` for out-of-scope resources — `403` confirms the resource exists (enumerable), `404` does not.
- Options considered:
  1. `403` for any resource outside scope — pros: clearer error semantics; cons: confirms existence, enables enumeration.
  2. `404` for out-of-scope resources, `403` only for role-level forbidden actions (chosen) — pros: no enumeration; cons: slightly less informative error to a legitimate but scope-mismatched caller.
- Decision: Every read/write by ID is filtered in the SQL query by the actor's scope. Out-of-scope → `404`. Role-level forbidden actions (e.g. an employee calling `POST /api/employees`) → `403`. No endpoint accepts `employee_id` for self-actions; the subject is always derived from the session.
- Why: prevents ID enumeration entirely, matches BR-11 and BR-13e.
- Tradeoffs / consequences: Debugging "why did I get a 404" requires checking scope, not just existence — documented here so it isn't mistaken for a bug.
- Revisit if: never expected to change.
- Links: BR-11, BR-13e, BR-20, `docs/SECURITY.md` threat table.

## ADR-009: Leave approval routing

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: PDF assumes a simple Pending/Approved/Rejected workflow with a single approver per request.
- Discussion: Owner proposed that a Manager's leave should require approval from 2 other managers. Claude recommended against it for three reasons: (1) it turns a 3-state workflow into a multi-approver state machine — partial approvals, one-approve-one-reject, "which 2 managers," and the under-3-managers edge case — high implementation risk against the deadline; (2) it contradicts the PDF rule that managers act only on their own team, since peer managers have no stated authority over each other; (3) the PDF's status set (Pending/Approved/Rejected) assumes a single decision-maker. Owner accepted the pushback.
- Options considered:
  1. Two-manager approval for managers' own leave — pros: extra scrutiny for manager-level leave; cons: high complexity, contradicts existing team-scoping rule, deadline risk.
  2. Single-approver routing via `manager_id`, HR/Admin as fallback and universal actor except on their own leave (chosen) — pros: fits the PDF's 3-state model, reuses existing team-scoping, low risk.
- Decision: Nobody can approve/reject their own leave (API + DB `CHECK (approver_id <> employee_id)`). A Manager approves/rejects only their direct reports' leave. HR/Admin can approve/reject any leave except their own. Routing: the "expected approver" shown in the UI is the requester's `manager_id`; if null, the request goes to the HR/Admin queue (HR/Admin can always act, except on their own). Therefore an HR person's leave is approved by their reporting manager if set, else another HR/Admin; a Manager's leave is approved by their reporting manager if set, else HR/Admin. Seed data includes ≥2 HR/Admin users so HR leave is always approvable.
- Why: lowest-risk implementation that still satisfies "nobody self-approves" and "managers only act on their own team," ranked above the extra rigor of multi-approval given the timebox.
- Tradeoffs / consequences: No multi-level approval — documented as a known limitation / future work in the README.
- Revisit if: the project continues past the assessment and a real multi-approver workflow becomes a requirement.
- Links: BR-10, BR-11, `docs/DATABASE.md` seed plan (≥2 HR/Admin).

## ADR-010: Leave statuses

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: PDF specifies three statuses (Pending/Approved/Rejected); owner requires the ability to cancel an approved leave.
- Discussion: Adding `cancelled` is a deliberate deviation from the PDF, driven by a real product need (plans change) rather than gold-plating.
- Options considered:
  1. Stay at 3 statuses, model "cancel" as deleting the row — pros: matches PDF exactly; cons: destroys audit trail, breaks BR-04's re-validation semantics.
  2. Add `cancelled` as a 4th status (chosen) — pros: preserves audit trail, clean state machine.
- Decision: `pending | approved | rejected | cancelled`.
- Why: cancellation without an audit trail is not acceptable for an HR system; PDF is a floor, not a ceiling, per the assessment's own framing of "handle edge cases."
- Tradeoffs / consequences: Documented explicitly as a deviation from the PDF in the README known-limitations/deviations section, so evaluators don't read it as a misunderstanding of the spec.
- Revisit if: never expected to change.
- Links: BR-13a…BR-13e, README deviations section.

## ADR-011: Time and attendance derivation

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Need one unambiguous definition of "today," working days, and attendance status, immune to client clock manipulation.
- Discussion: Storing attendance status as a column (updated by triggers/cron) vs. deriving it at read time was considered. Derivation was chosen to avoid stale-state bugs (e.g. a stored "Absent" that should retroactively become "Leave" once a backdated leave is approved).
- Options considered:
  1. Store status as a column, update via triggers/jobs — pros: cheap reads; cons: correctness depends on every write path remembering to update it; stale-state risk on backdated approvals.
  2. Derive status at read time from attendance + leave + calendar (chosen) — pros: always correct relative to current data; cons: slightly more read-time computation (cheap at this scale).
- Decision: Business timezone is Asia/Kolkata (IST) for all date boundaries; timestamps stored as `timestamptz`, `work_date` computed server-side in IST, never trusted from the client. Working days are Monday–Friday; public holidays are out of scope. Status derivation: `Leave` (approved full-day leave covers the date), `Half Day` (worked < 4h30m with a check-out present, OR approved half-day leave), `Present` (worked ≥ 4h30m), `Absent` (past working day, on/after `joining_date`, employee active that date, no attendance row, no approved leave), `Not checked in` (today, no check-in — never `Absent`). A past day with check-in but no check-out is `Half Day` with `missedCheckout: true` (no regularization flow). The 4h30m threshold is the named constant `HALF_DAY_THRESHOLD_MINUTES = 270` in one domain file.
- Why: single source of truth, immune to stale writes; testable as pure functions.
- Tradeoffs / consequences: No regularization flow for missed checkouts and no public-holiday calendar — both documented as known limitations.
- Revisit if: public holidays or regularization become in-scope.
- Links: `docs/BUSINESS_RULES.md` attendance rules, `server/src/domain/*` (P1).

## ADR-013: Organization model

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Need to decide whether HR/Admin and Managers are separate entities from "employees" or the same table with a permission level.
- Discussion: Modeling role as a permission level on a single `employees` table (rather than separate tables per role) was the natural fit given HR/Admin and Managers also check in/out and apply for leave like anyone else.
- Options considered:
  1. Separate tables per role — pros: role-specific columns without nullable fields; cons: duplicates shared behavior (check-in, leave) across tables, more joins.
  2. Single `employees` table with `role` as permission level (chosen) — pros: one identity per person, shared attendance/leave behavior for free.
- Decision: Everyone is an employee, including HR/Admin and Managers. `role` is a permission level: `admin` (HR/Admin), `manager`, `employee`. A Manager's team = active employees whose `manager_id` = that manager (direct reports only, no recursion). HR/Admin and Managers can check in/out and apply for leave like any employee.
- Why: matches the real-world fact that HR staff and managers are also employees; avoids duplicating attendance/leave logic per role.
- Tradeoffs / consequences: `manager_id`/`role` combination must be validated carefully (BR-23) to avoid cycles or invalid assignments.
- Revisit if: never expected to change.
- Links: BR-23, `docs/DATABASE.md` `employees` table.

## ADR-014: Leave balance

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Need a balance model that's simple to reason about and doesn't require a background job to maintain.
- Discussion: Storing balance as a mutable counter (decremented on approval) was considered and rejected — it requires careful transactional bookkeeping on every cancel/reject and is a classic source of drift bugs.
- Options considered:
  1. Stored, mutable balance counter — pros: O(1) read; cons: drift risk on every status transition, needs reconciliation logic.
  2. Computed balance: quota − sum(days) of this year's `pending`+`approved` requests (chosen) — pros: always consistent with the source-of-truth `leave_requests` table, no drift possible.
- Decision: Leave types seeded: Casual 12/yr, Sick 10/yr, Earned 15/yr, Unpaid (no quota). Balance = quota − sum(`days`) of this calendar year's `pending` + `approved` requests (pending reserves balance). No carry-forward. Half-day = 0.5 days. Weekends are excluded from `days`.
- Why: correctness by construction — there is no separate counter to get out of sync with reality.
- Tradeoffs / consequences: Balance computation does a small aggregate query per read — acceptable at this scale.
- Revisit if: leave-type catalog grows complex enough to need carry-forward or accrual schedules.
- Links: BR-07, `docs/DATABASE.md` `leave_types`.

## ADR-015: Docs system

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Owner had a personal "Rules.md," and the "Impeccable" design skill/tool was in the original mix; risk of doc drift between multiple rule files.
- Discussion: Claude flagged doc overlap as a risk during the planning conversation. Owner agreed to merge "Rules.md" into a single canonical `AGENTS.md` rather than maintaining two rule files. "Impeccable" was removed at the owner's request; its intended anti-slop guidance was folded into `docs/DESIGN.md` instead so design rules live in one place.
- Options considered:
  1. Keep `Rules.md` + `AGENTS.md` + `CLAUDE.md` as three separate rule sources — pros: none identified; cons: guaranteed drift.
  2. `AGENTS.md` as the single canonical, tool-agnostic rules file; `CLAUDE.md` imports it via `@AGENTS.md` and adds only Claude-Code-specific notes (chosen).
- Decision: `AGENTS.md` is canonical. `CLAUDE.md` is a thin Claude-Code-specific layer on top. Anti-slop/design rules live only in `docs/DESIGN.md`.
- Why: one source of truth per concern, no drift.
- Tradeoffs / consequences: None significant.
- Revisit if: never expected to change.
- Links: `AGENTS.md`, `CLAUDE.md`, `docs/DESIGN.md`.

## ADR-016: Web quality checklist scope

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: A generic "web quality checklist" (SEO, cookie banners, spam protection, etc.) doesn't map cleanly onto an internal HRMS app with one public landing page.
- Discussion: Claude flagged "web-checklist overreach" during planning — applying every generic web-quality item uniformly to both the public landing page and the authenticated app would waste time on items with no real audience (e.g. SEO meta on `/app/*` routes) or no real risk (cookie consent, since the only cookies are strictly necessary auth cookies and analytics is cookieless).
- Options considered:
  1. Apply the full generic checklist uniformly to every route — cons: wasted effort on app routes with no public audience.
  2. Scope each checklist item to "public routes" vs. "all routes" vs. "not needed" explicitly (chosen).
- Decision: Full scoped checklist recorded in `docs/SECURITY.md` §Web Quality Checklist. Notably: cookie consent banner = not needed (only strictly-necessary auth cookies, cookieless analytics); spam/abuse protection = login rate limiting only (no public forms exist); SPA 404 returns HTTP 200 (documented known limitation).
- Why: matches effort to actual risk/audience instead of a one-size-fits-all checklist.
- Tradeoffs / consequences: Evaluators must read the scope column, not just the item names — mitigated by the explicit "Applies to" column.
- Revisit if: a non-essential cookie or a public-facing form is ever added.
- Links: `docs/SECURITY.md` Web Quality Checklist table.

## ADR-017: Motion

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Landing page needs to feel alive without becoming AI-slop (gratuitous, unpurposeful motion); app screens must never feel static or "dead."
- Discussion: Claude flagged "GSAP-slop risk" during planning — landing pages with GSAP are a common source of over-animated, scroll-jacked, decorative-only motion that reads as generic rather than purposeful. Owner agreed to hard rules and a time cap.
- Options considered:
  1. Unrestricted GSAP usage on the landing page — cons: high risk of scroll-jacking, pinning, decorative noise flagged as AI-slop.
  2. GSAP with explicit rules + a hard 1h polish cap in `docs/PHASES.md` (chosen).
- Decision: Landing: GSAP timelines + ScrollTrigger, reveal-once, no scroll-jacking, no pinning longer than one viewport, hero sequence ≤1.2s. App: 150–350ms, transform/opacity only, `useGSAP` with scoped refs and automatic cleanup, `gsap.matchMedia()` honoring `prefers-reduced-motion`. Every app screen has at least one element driven by real, changing data (the "alive, not busy" rule) — never fake/randomized/decorative-only motion. Full rules in `docs/DESIGN.md`.
- Why: motion should signal real state changes, not decorate; time-capping prevents scope creep against the deadline.
- Tradeoffs / consequences: Landing polish is capped at 1h even if more could be done — accepted tradeoff given the deadline.
- Revisit if: never expected to change within this assessment.
- Links: `docs/DESIGN.md` motion rules, `docs/PHASES.md` P2.

## ADR-018: Brand name

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: The original P-001 prompt draft used the working title "PeopleOps Mini HRMS" throughout. Before executing P-001, the owner requested the brand be finalized as "Stafy."
- Discussion: Owner asked for the "PeopleOps" brand token to be replaced with "Stafy." Two naming sub-decisions were confirmed directly with the owner rather than guessed: (1) whether to keep a descriptor suffix like "HRMS"/"Mini HRMS" — owner chose the bare brand "Stafy" with no suffix anywhere (doc headers, package name, README title all read "Stafy," not "Stafy HRMS"); (2) the demo-account email domain — owner chose `stafy.app` with no `demo.` subdomain (e.g. `hr@stafy.app`, not `hr@demo.stafy.app`).
- Options considered:
  1. "Stafy HRMS" — pros: signals product category in the name itself; cons: owner didn't want the suffix.
  2. "Stafy Mini HRMS" (minimal-diff rename) — pros: smallest possible change from the draft; cons: carries over a "Mini" qualifier the owner didn't ask to keep.
  3. "Stafy" bare (chosen) — matches the owner's explicit choice.
- Decision: Product/brand name is "Stafy" everywhere (package name `stafy`, doc titles, README, `AGENTS.md`/`CLAUDE.md` one-liners). Demo accounts use `@stafy.app` (no `demo.` subdomain): `hr@stafy.app`, `manager@stafy.app` (Team A), `manager.b@stafy.app` (Team B), `employee@stafy.app` (Team A).
- Why: direct owner instruction; consistency across every doc/config file matters more for an evaluator's first impression than any technical tradeoff.
- Tradeoffs / consequences: None — pure rename, no behavior change. All ADRs above are otherwise identical to the original planning conversation; only the brand token changed.
- Revisit if: never expected to change without another explicit owner decision.
- Links: `docs/prompts/P-001-project-setup.md`, README, all doc headers.

## ADR-019: Responsive web only

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: PDF scope is a web HRMS; no native mobile requirement was stated.
- Discussion: No pushback recorded — straightforward scope confirmation given the one-day timebox.
- Options considered: Native/Expo app — rejected outright for time; not requested by the PDF.
- Decision: Responsive web only, 320px → 1440px, no native/Expo app.
- Why: matches PDF scope, avoids an entire unrequested platform under deadline pressure.
- Tradeoffs / consequences: None.
- Revisit if: never expected to change within this assessment.
- Links: `docs/SECURITY.md` Web Quality Checklist ("Mobile-friendly" row).

## ADR-020: Testing strategy

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: PDF and internal scoring reward demonstrated edge-case handling, not just working happy paths.
- Discussion: No major pushback — Vitest/Supertest/Playwright is the natural fit for the chosen JS stack (ADR-001).
- Options considered: Jest instead of Vitest — rejected only for speed/DX with Vite; not a meaningful capability difference at this scale.
- Decision: Vitest for unit tests (domain pure functions), Supertest for API integration tests against a separate test Supabase project, Playwright for 3 role-based E2E flows.
- Why: every BR-ID with date/status logic should have a unit test proving it; this is the artifact that demonstrates edge-case rigor to evaluators.
- Tradeoffs / consequences: Requires a second, disposable Supabase project for integration tests (human-provisioned).
- Revisit if: never expected to change within this assessment.
- Links: `docs/TESTING.md`.

## ADR-021: Build order — foundation before pages

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: Owner's initial plan was to build page-by-page (landing, then login, then employees, etc.).
- Discussion: Claude pushed back that RBAC, schema, and business rules — worth 45% of the assessment score — must exist before any UI is built, or each page ends up inventing its own ad hoc authorization/business logic that then has to be retrofitted. Owner agreed.
- Options considered:
  1. Page-by-page build (original plan) — cons: each page risks reinventing scoping/authorization logic; retrofitting RBAC after pages exist is higher-risk than building it first.
  2. Foundation → vertical feature slices (API + UI + tests together per module) (chosen) — pros: RBAC/schema/business rules exist once, correctly, before any page consumes them.
- Decision: Order is foundation (P1: migrations, seed, auth, middleware, policies, domain functions) → vertical feature slices (P3–P6: each module ships API + UI + tests together). Screens are still *designed* one at a time in Claude Design, in parallel with backend phases — only the *build* order changed.
- Why: de-risks the highest-scored part of the assessment (business logic + authorization) by building it once, correctly, instead of N times inconsistently.
- Tradeoffs / consequences: No visible UI progress during P1 — mitigated by running Claude Design work in parallel so design isn't blocked.
- Revisit if: never expected to change within this assessment.
- Links: `docs/PHASES.md`.

## ADR-022: HR attendance correction out of scope

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: PDF lists HR attendance correction as an "Optional" feature.
- Discussion: No pushback — explicitly optional in the source PDF, deprioritized for time.
- Options considered: Build a full correction/regularization flow — rejected for time; PDF marks it optional.
- Decision: Out of scope for v1. No endpoint allows creating or modifying another employee's attendance through any path.
- Why: optional PDF feature, lower value than the mandatory business-rule/authorization work under this timebox.
- Tradeoffs / consequences: Missed checkouts stay flagged, uncorrectable, in v1 (see ADR-011).
- Revisit if: time remains after all "never cut" items in `docs/PHASES.md` are done.
- Links: `docs/PHASES.md` cut order, BR-19, BR-20.

## ADR-023: Demo safety

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: A live, publicly-reachable demo with real demo credentials needs guardrails against an evaluator (or anyone) breaking the demo state or locking everyone out.
- Discussion: No pushback — standard demo hygiene given public demo credentials (documented in `docs/SECURITY.md` as an accepted, intentional limitation for evaluation purposes).
- Options considered: No guardrails — rejected as reckless given public demo credentials.
- Decision: `npm run seed:reset` restores demo data. The last active HR/Admin cannot be deactivated or demoted. Nobody can change their own role or status.
- Why: keeps the live demo recoverable and prevents an evaluator action from permanently locking out all HR/Admin access.
- Tradeoffs / consequences: Adds BR-25's "last admin" check as a permanent constraint, not just a nicety.
- Revisit if: never expected to change within this assessment.
- Links: BR-25, `docs/SECURITY.md` demo credential policy.

## ADR-024: Optional features chosen

- Status: Accepted
- Date: 2026-09-15 18:00 IST
- Context: PDF lists several optional features; time only allows a subset.
- Discussion: No pushback — direct prioritization call by the owner given the deadline.
- Options considered: Build all optional features — rejected, not feasible in the timebox.
- Decision: Chosen: leave balance, audit log, pagination (server-side), automated tests, responsive UI. Rejected for time: email notifications, profile photos, dark mode, CSV export, attendance calendar.
- Why: chosen features either demonstrate business-logic/authorization rigor (audit log, tests) or are near-zero-cost given the chosen stack (server-side pagination, responsive UI via Tailwind). Rejected features are polish items that don't move the scored dimensions.
- Tradeoffs / consequences: Documented explicitly in the README known-limitations section so evaluators see this as a deliberate choice, not an oversight.
- Revisit if: time remains after all "never cut" items in `docs/PHASES.md` are done.
- Links: `docs/PHASES.md` cut order, README known limitations.
