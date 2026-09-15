# P-001 — Project Setup Prompt (Claude Code)

> Paste everything below the line into Claude Code, started in **Plan Mode**, from the empty repo root.
> Before running: this file must already exist at `docs/prompts/P-001-project-setup.md`.
>
> **Rebrand note (2026-09-15):** this prompt was originally drafted under the working title "PeopleOps Mini HRMS." Before execution, the owner (Ankush) confirmed the final brand as **Stafy** (bare brand name, no "HRMS"/"Mini" suffix anywhere) and the demo-account domain as `stafy.app` (no `demo.` subdomain). This file reflects that rename; see `docs/DECISIONS.md` ADR-018. The prompt content below is otherwise unchanged from the original planning conversation.

---

You are the lead engineer and documentation owner for **Stafy**, a practical assessment for AppTrait Solutions ("Vibe Coder – Intern/Fresher"). The evaluators score how we plan, prompt, review AI output, and handle business logic and authorization. They do not score code volume. Every decision must be traceable.

**Deadline: 16 Sep 2026, 16:00 IST. Feature freeze: 16 Sep 2026, 13:00 IST.**

## 0. What this task is and is NOT

This task is **documentation, agent configuration, and project scaffolding only.**

DO:
- Create the full docs system (§4).
- Create the Claude Code configuration (§5).
- Scaffold the monorepo with tooling, configs, a `/api/health` endpoint, and an empty routed client shell (§6).
- Write the SQL migration *design* into `docs/DATABASE.md`. Do not run it.

DO NOT:
- Implement any feature (auth, employees, attendance, leave, dashboards, landing page UI).
- Create a Supabase project, run migrations, or deploy. The human does these.
- Invent content for `docs/DESIGN.md` tokens (colors, fonts). These come from a design reference in a later task. Leave clearly marked `TBD — set in P-002` placeholders.
- Fabricate AI code review cases, test results, or metrics.

First, produce a plan listing every file you will create and wait for approval. Then execute.

---

## 1. Ask-First Protocol (applies to this and every future task)

Stop and ask the human (Ankush) **before**:
1. Changing the database schema or a migration after it is approved.
2. Adding a dependency not listed in `docs/ARCHITECTURE.md`.
3. Deviating from any decision in `docs/DECISIONS.md` or rule in `docs/BUSINESS_RULES.md`.
4. Changing authentication, authorization, cookies, or permission logic.
5. Encountering a business rule that is ambiguous or not covered in `BUSINESS_RULES.md`.
6. Deleting or substantially rewriting a file not created in the current task.
7. Finding that current official docs (Supabase, Vercel, Claude Code, GSAP) contradict something in this prompt.
8. Any change that would push a phase beyond its timebox in `docs/PHASES.md`.

Question format (mandatory):
```
QUESTION [Q-###]: <one-line question>
Context: <why this came up, file/line if relevant>
Options:
  A) <option> — tradeoff
  B) <option> — tradeoff
  C) <option> — tradeoff (optional)
Recommendation: <A/B/C> because <reason>
Blocking: yes/no (if no, state what you will do meanwhile)
```
Never guess silently. After the answer, append the outcome to `docs/DECISIONS.md` (if architectural) or `docs/BUSINESS_RULES.md` (if a rule), and log the Q&A in the current prompt log.

---

## 2. Locked Product & Technical Decisions

These were decided in the planning conversation (Claude chat, 15 Sep 2026). Record each one as an ADR in `docs/DECISIONS.md` using the ADR template in §4.10, including the **Discussion** field with what was proposed, what was pushed back, and why.

### 2.1 Stack (ADR-001)
- **Frontend:** React 19 + Vite, **JavaScript** (no TypeScript), React Router, TanStack Query (server state, loading/error states), React Hook Form + Zod, Tailwind CSS v4 with CSS-variable design tokens, `sonner` (toasts), `lucide-react` (icons), GSAP + `@gsap/react` + ScrollTrigger.
- **Backend:** Node.js 20+ / Express 5, JavaScript (ESM), Zod validation, `pg` (node-postgres), `helmet`, `cookie-parser`, `pino` logging.
- **Database & Auth:** Supabase (Postgres + Supabase Auth).
- **Hosting:** Vercel. One project: static client + Express as a serverless function under `/api`.
- **Analytics:** Vercel Web Analytics (cookieless).
- **Tests:** Vitest (unit), Supertest (API integration), Playwright (E2E, 3 role flows).
- Tradeoff to record: JavaScript over TypeScript was the owner's choice. Mitigation: Zod at every API boundary, JSDoc types on domain functions, ESLint.
- MongoDB was considered and rejected: overlap checks and unique-per-day attendance need relational constraints and transactions.

### 2.2 Deployment topology (ADR-002)
Client and API are on the **same origin** (`https://<app>.vercel.app` and `/api/*`). Consequences: no CORS, cookies can be `SameSite=Lax` (or `Strict`), `HttpOnly`, `Secure`. Verify the current Vercel guidance for hosting Express. If it differs from `api/index.js` exporting the app, ask (Ask-First #7).

### 2.3 Authentication (ADR-003)
- Credentials are stored by **Supabase Auth** (bcrypt hashing handled by Supabase). We do not store passwords.
- The browser **never talks to Supabase directly** and holds **no Supabase keys**. Login goes `POST /api/auth/login` → Express calls Supabase Auth → Express sets access and refresh tokens as `HttpOnly; Secure; SameSite` cookies.
- Endpoints: `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh`, `GET /api/auth/me`.
- Token verification in middleware: use the current recommended Supabase server-side method (`getClaims` / JWKS or `getUser`). Check current docs and state which one you chose and why.
- HR creates employee login accounts through the Supabase Admin API (server-side, secret key).

### 2.4 Authorization source of truth (ADR-004)
On every authenticated request, middleware loads the `employees` row by `auth_user_id`. **Role, status, and team come from the database row, never from JWT claims or the client.** Deactivated employees get `401` on every request immediately, even with a valid token.

### 2.5 Defense in depth (ADR-005, ADR-007)
- **Layer 1, DB:** constraints (check, unique, exclusion, FK). RLS is **enabled on every public table with zero policies** (deny-all for anon/authenticated roles). The server connects with the privileged connection string, so RLS does not affect it, but a leaked anon key exposes nothing. Using RLS policies as the *primary* authorization layer was rejected for time.
- **Layer 2, API:** `authenticate` → `authorize(policy)` → `validate(zod)` → service (business rules) → repository (scoped queries).
- **Layer 3, UI:** route guards and hidden actions for UX only. **Never the only check.**

### 2.6 Data access (ADR-006)
Use `pg` against the Supabase **transaction pooler** connection string (serverless-safe), with raw parameterized SQL in repository files. Use transactions for approve, cancel, and apply-leave. Migrations are SQL files in `supabase/migrations/`. Rejected alternative: the supabase-js query builder, because it has no multi-statement transactions.

### 2.7 Resource scoping and IDOR (ADR-008)
Every read or write by ID is filtered **in the SQL query** by the actor's scope. A resource outside the actor's scope returns **404, not 403**, so IDs cannot be enumerated. Role-level forbidden actions (e.g. an employee calling `POST /api/employees`) return **403**. No endpoint accepts `employee_id` for self-actions (check-in, check-out, apply leave). The subject is always derived from the session.

### 2.8 Organization model (ADR-013)
- Everyone is an employee, including HR/Admin and Managers. `role` is a permission level: `admin` (HR/Admin), `manager`, `employee`.
- A Manager's **team = active employees whose `manager_id` = that manager** (direct reports only, no recursion).
- HR/Admin and Managers can also check in/out and apply for leave like any employee.

### 2.9 Leave approval routing (ADR-009)
**Discussion to record:** Ankush proposed that a Manager's leave needs approval from 2 other managers. Claude recommended against it:
1. It turns a 3-state workflow into a multi-approver state machine (partial approvals, one-approve-one-reject, which 2 managers, and what happens with fewer than 3 managers), which is high risk against the deadline.
2. It contradicts the PDF rule that managers act only on their own team. Peer managers have no authority over each other.
3. The PDF status set (Pending/Approved/Rejected) assumes a single decision.

Final rule:
- **Nobody can approve or reject their own leave** (API check + DB check constraint `approver_id <> employee_id`).
- A **Manager** can approve or reject leave only for **their direct reports**.
- **HR/Admin** can approve or reject **any** leave **except their own**.
- Routing: the "expected approver" shown in the UI is the requester's `manager_id`. If `manager_id` is null, the request goes to the HR/Admin queue. HR/Admin can always act (except on their own).
- Therefore: an **HR person's leave** is approved by their reporting manager (per owner's answer) or another HR/Admin. A **Manager's leave** is approved by their reporting manager if set, otherwise by HR/Admin.
- Seed data must include ≥2 HR/Admin users so HR leave can always be approved.
- Multi-level approval is documented as a known limitation / future work.

### 2.10 Leave statuses (ADR-010)
`pending | approved | rejected | cancelled`. `cancelled` is added beyond the PDF's three because the owner requires cancellation of approved leave. This is a deliberate deviation. Record it in the README known-limitations/deviations section.

### 2.11 Time and attendance derivation (ADR-011)
- Business timezone is **Asia/Kolkata (IST)** for "today", working days, and all date boundaries. Store timestamps as `timestamptz`, and compute `work_date` in IST on the server. Never trust client time.
- Working days are **Monday–Friday**. Public holidays are out of scope (known limitation).
- Attendance status is **derived at read time, not stored**:
  - `Leave`: approved full-day leave covers the date.
  - `Half Day`: worked < 4h30m (check-out present), **or** an approved half-day leave on that date.
  - `Present`: worked ≥ 4h30m.
  - `Absent`: past working day, on/after `joining_date`, employee active on that date, no attendance row, no approved leave.
  - Today with no check-in shows `Not checked in`, never `Absent`.
  - A past day with check-in but no check-out counts as `Half Day` with a `missedCheckout: true` flag (no regularization flow; known limitation).
- The 4h30m threshold is a named constant `HALF_DAY_THRESHOLD_MINUTES = 270` in one domain file.

### 2.12 Leave balance (ADR-014)
Computed, not stored. Leave types seeded: Casual 12/yr, Sick 10/yr, Earned 15/yr, Unpaid (no quota). Balance = quota − sum(`days`) of this calendar year's `pending` + `approved` requests (pending reserves balance). No carry-forward. Half-day = 0.5 days. Weekends are excluded from `days`.

### 2.13 Scope decisions
- **ADR-015 Docs system:** `AGENTS.md` is the canonical rules file (the owner's "Rules.md" is merged into it to prevent drift). `CLAUDE.md` imports it with `@AGENTS.md` and adds Claude-Code-specific notes. Impeccable was removed at the owner's request, and anti-slop rules live in `docs/DESIGN.md`.
- **ADR-016 Web quality checklist scope:** see §4.6. Cookieless analytics means **no cookie consent banner** (auth cookies are strictly necessary). The landing page has no public form, so "spam protection" = login rate limiting (Supabase Auth limits + app-level limiter). SPA 404 returns HTTP 200 (soft 404, known limitation).
- **ADR-017 Motion:** GSAP-rich landing page. Purposeful, data-tied motion in the app. No screen may look static or "dead", but motion must never be decorative noise. Full rules in `docs/DESIGN.md`.
- **ADR-019 Responsive web only.** No native/Expo app.
- **ADR-020 Testing strategy** per §4.8.
- **ADR-021 Build order: foundation before pages.** Discussion: the owner planned page-by-page. Claude pushed back that RBAC, schema, and business rules (45% of the score) must exist before UI, or each page invents its own logic. Agreed order: foundation → vertical feature slices (API + UI + tests together). Screens are *designed* one at a time in Claude Design.
- **ADR-022 HR attendance correction** (PDF "Optional"): out of scope for v1. Nobody can create or modify another employee's attendance through any endpoint.
- **ADR-023 Demo safety:** `npm run seed:reset` restores demo data. The last active HR/Admin cannot be deactivated or demoted. Nobody can change their own role or status.
- **ADR-024 Optional features chosen:** leave balance, audit log, pagination (server-side), automated tests, responsive UI. Rejected for time: email notifications, profile photos, dark mode, CSV export, attendance calendar.

---

## 3. Business Rules (write verbatim into `docs/BUSINESS_RULES.md`, then expand)

Each rule needs: ID, rule, enforcement layer(s) (DB / API / UI), HTTP status + error `code`, and linked test IDs (fill test IDs as `TBD` now). Errors use the shape `{ "error": { "code": "LEAVE_OVERLAP", "message": "...", "details": {} } }`.

**Leave**
- **BR-01** End date before start date → `400 INVALID_DATE_RANGE`. DB: `CHECK (end_date >= start_date)`.
- **BR-02** Overlap with own `pending`/`approved` leave → `409 LEAVE_OVERLAP`. DB: exclusion constraint using `btree_gist` over `daterange(start_date, end_date, '[]')` where status in (pending, approved). API pre-check gives a friendly message that includes the conflicting request's dates.
- **BR-03** Full-day leave on a date that already has an attendance row → `409 ATTENDANCE_EXISTS_FOR_DATE`. A half-day leave on a date with attendance **is allowed** (industry norm: half day worked + half day leave).
- **BR-04** Approval re-validates BR-02, BR-03, and balance inside the transaction. If attendance appeared after applying, approval fails with `409`, and the approver must reject or the employee must cancel.
- **BR-05** Half-day leave requires `start_date = end_date` and a session (`first_half | second_half`) → `400 INVALID_HALF_DAY`.
- **BR-06** Leave range containing zero working days (weekend only) → `400 NO_WORKING_DAYS`.
- **BR-07** Insufficient balance (non-Unpaid) → `422 INSUFFICIENT_BALANCE`, with remaining balance in details.
- **BR-08** Date window: start date no more than 7 days in the past (backdated sick/casual) and no more than 90 days in the future → `400 DATE_OUT_OF_WINDOW`.
- **BR-09** Reason required, 10–500 chars. Rejection reason required, 10–500 chars → `400 VALIDATION_ERROR`.
- **BR-10** Self-approval forbidden → `403 SELF_APPROVAL_FORBIDDEN`. DB check `approver_id <> employee_id`.
- **BR-11** Manager acting on a non-direct-report's leave → `404 NOT_FOUND` (per ADR-008).
- **BR-12** Approve/reject only when `pending`. Use a conditional `UPDATE ... WHERE id=$1 AND status='pending'`. 0 rows → `409 INVALID_STATUS_TRANSITION`. This handles double-clicks and two approvers racing.
- **BR-13 Cancellation** (owner requirement: plans change, or they want a half day instead):
  - `pending` → cancellable by the requester anytime.
  - `approved` → cancellable by the requester only if `start_date >= today (IST)`. Balance is restored and an audit entry is written.
  - An approved leave that has already started (`start_date < today`) → `409 LEAVE_ALREADY_STARTED`. Partial cancellation of a multi-day leave is a known limitation.
  - `rejected` / `cancelled` → `409 INVALID_STATUS_TRANSITION`.
  - "Convert full day to half day" = cancel, then apply a new half-day request (which goes through approval again). Editing an approved request is not allowed, because it would bypass approval.
  - Only the requester can cancel. Others get `404`.

**Attendance**
- **BR-14** Double check-in same IST date → `409 ALREADY_CHECKED_IN`. DB: `UNIQUE (employee_id, work_date)`.
- **BR-15** Check-out without check-in today → `409 NOT_CHECKED_IN`.
- **BR-16** Double check-out → `409 ALREADY_CHECKED_OUT`. DB: `CHECK (check_out_at IS NULL OR check_out_at > check_in_at)`.
- **BR-17** Check-in on a date covered by **approved full-day** leave → `409 ON_APPROVED_LEAVE` ("Cancel your leave first"). Approved half-day leave → check-in allowed. Pending leave → check-in allowed, and BR-04 then blocks that approval.
- **BR-18** Check-in on a weekend → `409 NON_WORKING_DAY`.
- **BR-19** Check-out is only allowed for today's record. Past open records stay flagged (ADR-011).
- **BR-20** No endpoint allows creating or modifying another employee's attendance. Self-actions derive the employee from the session. Any body/query `employee_id` on self-actions is ignored and stripped by Zod.

**Employees & accounts**
- **BR-21** Email unique (case-insensitive, `citext`) → `409 EMAIL_TAKEN`. Employee code is auto-generated `EMP-0001` and immutable.
- **BR-22** Employee self-edit is limited to a whitelist: `phone` only. All other fields are rejected with `403 FIELD_NOT_EDITABLE` (mass-assignment guard via Zod `.strict()` per role schema).
- **BR-23** `manager_id` cannot be self and cannot create a cycle → `400 INVALID_MANAGER`. The assigned manager must be active and have role `manager` or `admin`.
- **BR-24** Deactivation: the user cannot log in or call APIs (ADR-004). Their pending leave requests are auto-cancelled with a system note. Deactivating an employee who has active direct reports → `409 HAS_ACTIVE_REPORTS` (reassign first).
- **BR-25** Cannot change own role/status → `403`. Cannot deactivate or demote the last active admin → `409 LAST_ADMIN`.
- **BR-26** `joining_date` cannot be more than 90 days in the future. Attendance and absence are not computed before it.

Leave space for new rules (BR-27+) discovered during build, following Ask-First #5.

---

## 4. Documentation System — create these files

Every doc starts with a header block:
```
> Status: Draft | Approved | Living   ·   Last updated: YYYY-MM-DD HH:mm IST   ·   Owner: Ankush
> Related: <links>
```
Keep docs dense. No filler or marketing language. Use tables where they aid scanning.

### 4.1 `docs/00-INDEX.md` — Context map
A table: doc → purpose → **read when** (e.g. "touching leave logic → BUSINESS_RULES.md §Leave, DATABASE.md leave_requests, SECURITY.md approval matrix"). This is how agents load only the context they need.

### 4.2 `docs/CONTEXT.md` — Live session state (most important file for continuity)
Sections:
- **Current phase & task** (one line each)
- **Status of phases** (table: phase, status, archive link)
- **Done in current phase** (bullets with commit hashes)
- **In progress / next up** (max 5 items)
- **Open questions** (Q-IDs, blocking?)
- **Known issues / tech debt** (with IDs)
- **Gotchas discovered** (things a fresh session would get wrong)
- **Completed phases** (≤5 lines each + link to `docs/archive/`)

Rule: keep under ~150 lines. When a phase closes, move its detail to `docs/archive/phase-N-<slug>.md` and leave only the ≤5-line summary + link.

### 4.3 `docs/PRD.md`
Problem, users & roles, goals/non-goals, full permission matrix (PDF §2 table, extended with cancel leave, view own profile, view audit log, deactivate), functional requirements per module with IDs (`FR-EMP-01`, `FR-ATT-01`, `FR-LV-01`, `FR-DASH-01`, `FR-AUTH-01`, `FR-WEB-01`), acceptance criteria per FR (Given/When/Then), the dashboard metric definitions (exact counting rule for each metric, e.g. "Present Today = active employees with an attendance row for today IST"), explicit out-of-scope list (PDF: biometric, GPS, shifts), deviations from the PDF, and a **PDF traceability table** mapping every PDF section (1–17) to FR IDs/docs.

### 4.4 `docs/PLANNING.md` — Submission deliverable (PDF §10)
Written for evaluators, 1–2 pages. Covers requirement breakdown (modules), application flow (login → role dashboard → core operations, per role), database design summary, technology selection with *why*, and assumptions. Each section links to the detailed doc. Include a Mermaid flow diagram of the login → role routing → core flows.

### 4.5 `docs/ARCHITECTURE.md`
- System diagram (Mermaid): browser → Vercel static → `/api` Express function → Supabase Postgres / Supabase Auth.
- Request lifecycle: `authenticate → loadEmployee → authorize → validate → service → repository → response/errorHandler`.
- Repo structure (from §6) with a one-line purpose per folder.
- Layering rules: routes contain no SQL; services contain business rules and are unit-testable with injected repos; repositories contain all SQL and always take an `actor`/scope param for scoped reads; domain `server/src/domain/*.js` = pure functions (date math, working days, status derivation, balance, overlap) with zero I/O.
- Permission policies: single module `server/src/policies/` exporting `can(actor, action, resource?)` and scope builders. Routes never check `role ===` inline.
- API contract table: method, path, roles, scope, request schema, success response, error codes. Cover the auth, employees (`GET /api/employees` with search/filter/pagination, `POST`, `GET /:id`, `PATCH /:id`, `PATCH /:id/status`), departments, attendance (`POST /check-in`, `POST /check-out`, `GET /today`, `GET /` with date-range/employee filters), leave (`GET /leave-types`, `GET /leaves/balance`, `POST /leaves`, `GET /leaves/mine`, `GET /leaves` approvals queue with employee/status/date filters, `POST /leaves/:id/approve|reject|cancel`), `GET /api/dashboard` (role-shaped payload), `GET /api/audit-logs` (admin), and `GET /api/health` endpoints.
- Pagination convention: `?page=1&pageSize=20`, response `{ data, meta: { page, pageSize, total } }`.
- Frontend structure: `features/*` folders, `lib/api.js` fetch wrapper (credentials `same-origin`, 401 → refresh once → redirect to login), TanStack Query keys convention, route guards (UX only).
- Approved dependency list (client + server) with a one-line reason each. Anything else triggers Ask-First #2.
- Environment variables table: name, where used (server/client), secret?, example.

### 4.6 `docs/SECURITY.md`
- Threat model table: threat → mitigation → test ID. Must cover IDOR via URL/body ID, manager cross-team approval, self-approval, privilege escalation via PATCH body (role/status/manager_id), mass assignment, deactivated user with valid token, XSS token theft (HttpOnly cookies), CSRF (SameSite + same-origin + JSON-only content-type check on mutating routes), SQL injection (parameterized only), brute force (rate limit), secret leakage (no secrets in client bundle; CI grep check for `SERVICE_ROLE|SECRET` in `client/dist`), user enumeration (generic login error), verbose errors (no stack traces in prod).
- Full role × action permission matrix (the source of truth tests are written from).
- Security headers set in `vercel.json`: HSTS, CSP (self + Vercel analytics only), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'`. HTTPS is enforced by Vercel.
- Cookie settings table.
- Demo credential policy: demo passwords are public by design for evaluation, and this is documented as a limitation.
- **Web Quality Checklist (ADR-016)**, scoped:

| Item | Applies to | Status |
|---|---|---|
| HTTPS forced | all | required |
| No secrets in frontend | all | required |
| Meta title + description per route | public routes; app routes get titles only | required |
| Social preview (OG/Twitter) image | public routes | required |
| Favicon + apple-touch-icon + manifest | all | required |
| `sitemap.xml` + `robots.txt` (disallow `/app`, `/api`) | public | required |
| Alt text on all images; decorative = `alt=""` | all | required |
| Compressed images (AVIF/WebP, sized, lazy below fold) | all | required |
| Page speed: Lighthouse ≥90 perf/a11y/best-practices/SEO on landing | landing | required |
| Color contrast WCAG 2.1 AA | all | required |
| Mobile-friendly (320px → 1440px) | all | required |
| Custom 404 | all | required |
| No broken links (link check before submission) | all | required |
| Form validation (client Zod + server Zod) | all forms | required |
| Spam/abuse protection = login rate limiting | auth | required |
| Analytics (Vercel, cookieless) | all | required |
| One clear primary CTA per screen ("Try the live demo" on landing) | all | required |
| Privacy Policy + Terms pages | public | required |
| Cookie consent banner | — | **not needed** (only strictly-necessary cookies; cookieless analytics). Revisit if any non-essential cookie is added |

### 4.7 `docs/DATABASE.md`
- ER diagram (Mermaid).
- Full SQL DDL design (not executed) for: extensions `citext`, `btree_gist`; enums `employee_role`, `employment_status`, `leave_status`, `leave_duration`, `half_session`; tables `departments`, `employees` (id uuid, auth_user_id uuid unique, employee_code unique, full_name, email citext unique, phone, department_id FK, designation, manager_id FK self nullable, role, joining_date, employment_status, timestamps), `attendance` (id, employee_id FK, work_date date, check_in_at, check_out_at, unique(employee_id, work_date), check), `leave_types` (code, name, annual_quota nullable, is_paid), `leave_requests` (id, employee_id, leave_type_id, start_date, end_date, duration, half_session, days numeric(4,1), reason, status, approver_id, decided_at, rejection_reason, cancelled_at, created_at, checks, exclusion constraint), `audit_logs` (actor_id, action, entity_type, entity_id, before jsonb, after jsonb, created_at).
- Indexes justified by queries (e.g. `attendance(work_date)`, `leave_requests(status, employee_id)`, `employees(manager_id)`).
- RLS: `ENABLE ROW LEVEL SECURITY` on all tables, no policies (ADR-005).
- `updated_at` trigger.
- Constraint → business rule mapping table.
- Seed plan: 2 HR/Admin (one reports to a manager, per ADR-009), 2 Managers (Team A, Team B), 4 employees per team, 1 inactive employee, 4 departments, ~20 working days of realistic attendance history (mix of present, half-day, missed-checkout, absent), leave requests in every status including cross-team ones. Demo accounts: `hr@stafy.app`, `manager@stafy.app` (Team A), `manager.b@stafy.app` (Team B), `employee@stafy.app` (Team A). Passwords are read from env `DEMO_PASSWORD`. Never hardcode them in the repo except in the README credential table (added at submission).
- Mark the migration section "Pending human approval before `supabase db push`".

### 4.8 `docs/TESTING.md`
- Strategy: unit (domain pure functions, 100% of BRs with date logic), integration (Supertest against a **separate test Supabase project** via `TEST_DATABASE_URL`, truncate + seed per suite), E2E (Playwright: HR adds employee → employee checks in and applies leave → manager of another team cannot see it → correct manager approves → dashboards update).
- **Test matrix:** every BR-ID and every SECURITY threat → test ID (`T-UNIT-xx`, `T-API-xx`, `T-E2E-xx`) → status (`planned`/`passing`). This matrix is what proves edge-case handling to evaluators.
- Commands, how to run, CI note (GitHub Actions: lint + unit + integration on push; E2E manual).
- Manual QA checklist per role for the live demo.

### 4.9 `docs/PHASES.md`
Timeboxed plan to 16 Sep 16:00 IST. Each phase gets goal, deliverables, exit criteria (checkboxes), timebox, and dependencies. Mark which steps can run in parallel (Claude Design work runs in parallel with backend phases).

| Phase | Scope | Timebox |
|---|---|---|
| P0 | Setup: docs, agent config, scaffold, first commit (this task) | 1.5h |
| P1 | Foundation: migrations, seed, auth (login/logout/refresh/me), authenticate/authorize middleware, policies, error handler, domain pure functions + unit tests, deploy skeleton to Vercel | 4h |
| P2 | Design system + Landing (GSAP) + Login + Privacy/Terms + 404 + SEO assets | 3h (GSAP polish hard-capped at 1h) |
| P3 | Employees module (HR): list/search/filter/paginate, add, edit, view, activate/deactivate, self profile | 2.5h |
| P4 | Attendance: check-in/out, today, history, HR/manager scoped views + filters | 2.5h |
| P5 | Leave: apply, balance, my requests, cancel, approvals queue, approve/reject with reason | 3.5h |
| P6 | Dashboards ×3 (live data, alive UI) | 2h |
| P7 | Hardening: integration + E2E tests, audit log view, security pass, a11y/Lighthouse pass | 3h |
| P8 | Submission: README, AI report, code review cases, demo creds, deployed verification, link check | freeze 13:00 → submit by 15:30 |

**Cut order if behind** (write this explicitly): Playwright E2E → audit log UI (keep logging) → landing GSAP extras → pagination UI polish.
**Never cut:** RBAC enforcement, BR-01…BR-26, their tests, README, AI report, live deploy.

### 4.10 `docs/DECISIONS.md` — Advanced decision log
An index table at the top (ID, title, status, date). Each ADR:
```
## ADR-###: <title>
- Status: Accepted | Superseded by ADR-### | Rejected
- Date: YYYY-MM-DD HH:mm IST
- Context: <problem, constraint, PDF section>
- Discussion: <who proposed what; pushback; the actual reasoning exchanged — this is "our talk">
- Options considered:
  1. <option> — pros / cons
  2. ...
- Decision: <what>
- Why: <reasons ranked>
- Tradeoffs / consequences: <what we give up, risks, mitigations>
- Revisit if: <trigger>
- Links: <BR/FR/test/prompt IDs>
```
Create ADR-001 … ADR-024 from §2. Never edit an accepted ADR's decision. Supersede it with a new ADR.

### 4.11 `docs/DESIGN.md` — Design system (skeleton now, filled in P-002)
- **Tokens:** color (neutral scale tinted, one brand accent, semantic success/warning/danger/info, status colors for Present/Half Day/Absent/Leave/Pending/Approved/Rejected/Cancelled), typography (display + text family, scale), spacing (4px base), radius, shadow/elevation, z-index, breakpoints, motion durations/easings. **All values `TBD — set in P-002 from landing reference`.** Include the CSS variable names now (`--color-bg`, `--color-accent`, `--font-display`, `--ease-out-quint`, etc.) so code can reference them.
- **Layout:** public shell vs app shell (sidebar desktop, bottom nav or drawer on mobile), content max widths.
- **Component inventory** to be built: Button, Input, Select, DateRangePicker, Textarea, Badge/StatusPill, DataTable (sortable, paginated, empty/loading/error states), StatCard (animated), Modal/Drawer, Toast, Avatar (initials, no photos), EmptyState, Skeleton, PageHeader, FilterBar, ConfirmDialog.
- **States contract:** every data view defines loading (skeleton, not spinner-only), empty (explains why + the one next action), error (plain message + retry), success feedback (toast).
- **"Alive, not busy" rule (ADR-017):** every app screen has at least one element driven by real, changing data, e.g. a live IST clock and elapsed-time counter after check-in, stat cards that count up to real values, a this-week attendance strip, a leave balance ring, team "in today" avatars, pending-approvals row exit animation. **Nothing fake, randomized, or decorative-only.**
- **Motion rules:**
  - Landing: GSAP timelines + ScrollTrigger (reveal once, no scroll-jacking, no pinning longer than one viewport), hero sequence ≤1.2s.
  - App: 150–350ms, transform/opacity only, `useGSAP` with scoped refs and automatic cleanup, `gsap.matchMedia()` honoring `prefers-reduced-motion` (reduced = instant or opacity-only).
  - Never animate layout properties, never delay interaction, never stagger more than ~8 items.
- **Anti-AI-slop rules** (reviewers check against these):
  - No purple→blue gradients, glassmorphism everywhere, glowing blobs, or neon-on-dark by default.
  - No emoji as icons. One icon set (lucide) at consistent stroke/size.
  - No cards nested in cards. No card grid where a table or list is the honest structure.
  - No pure `#000`/`#fff` greys. Neutrals are tinted toward the brand hue.
  - No gray text on colored backgrounds. Contrast AA minimum.
  - No generic copy ("Streamline your workflow", "Unlock the power of…", "Revolutionize"). Copy states concrete HRMS facts.
  - **No fabricated social proof:** no fake company logos, testimonials, user counts, ratings, or "trusted by" claims. This is an assessment project.
  - No lorem ipsum, no placeholder avatars of real-looking people, no stock photos of handshakes.
  - No bouncy/elastic easing.
  - No centered-everything layouts. Use a clear typographic hierarchy with max 2 font families.
  - No more than one primary button per view.
  - No spinner-only loading for layout content. Use skeletons matching final layout.
- **Accessibility:** focus-visible styles, keyboard paths for every action, `aria-live` for toasts and check-in result, labels on all inputs, tables with proper headers, 44px touch targets.
- **Screen registry:** a table of screen → route → roles → design prompt ID → implementation prompt ID → status. Seed rows: Landing `/`, Login `/login`, Privacy `/privacy`, Terms `/terms`, 404, App Shell, Dashboard (admin/manager/employee variants) `/app`, Employees list `/app/employees`, Employee detail/edit `/app/employees/:id`, Add employee, My profile `/app/profile`, Attendance `/app/attendance`, Leave (my) `/app/leave`, Apply leave, Approvals `/app/approvals`, Audit log `/app/audit`.

### 4.12 AI Development records (PDF §8, §9)
- **`docs/prompts/`** holds each prompt verbatim, one file per prompt: `P-###-<slug>.md`. This prompt is `P-001-project-setup.md` (already present, do not modify it). Add `P-000-requirement-analysis.md` summarizing the planning chat. Prompt: the owner shared the PDF and asked Claude (chat) to analyze requirements, ask questions, and later produce setup prompts. Output: Claude flagged build-order risk, web-checklist overreach, GSAP-slop risk, doc overlap, and 16 questions. Owner's answers are listed in §2 of P-001. What was accepted/changed: summarize from §2 Discussion fields (two-manager approval rejected; page-by-page build replaced by foundation-first; impeccable removed; cookie banner dropped).
- **`docs/AI_DEVELOPMENT.md`** is the running log. One entry per meaningful prompt, with these exact fields (from PDF §8): **Prompt** (link to file + 1-line gist), **Tool** (Claude chat / Claude Design / Claude Code), **Why I used it**, **AI's approach/output**, **What I accepted**, **What I changed or rejected** (with reason), **Commit(s)**. The README "AI Development Process" section is generated from the best 5–8 entries at submission.
- **`docs/AI_CODE_REVIEW.md`** has an empty template only, with fields (PDF §9): **Case ID**, **What AI generated** (file, snippet ≤20 lines), **What was wrong**, **How I identified it** (test failed / manual review / reviewer subagent / runtime error), **How I fixed it** (diff summary + commit), **Lesson → rule added to AGENTS.md?** Rule: *entries must be real, logged at the moment they occur, never back-filled from imagination.* Target ≥4 real cases so the best 2+ can be chosen.

### 4.13 `CHANGELOG.md`
Keep-a-Changelog format, entries per phase.

### 4.14 `README.md` (skeleton)
All PDF §15 headings present with `TBD` where not yet known: Overview, Live Demo, Demo Credentials (3 roles + Team B manager for cross-team test), Features, Tech Stack, Architecture, Database Structure, Business Rules & Edge Cases (summary table linking BUSINESS_RULES.md), Security, Setup Instructions, Environment Variables, Testing, **AI Development Process**, **AI Code Review**, Planning Document link, Deviations from brief, Known Limitations, Project Docs index.

---

## 5. Claude Code configuration

Before writing these, check the current Claude Code docs for the exact file formats of `CLAUDE.md` imports, subagents (`.claude/agents/`), skills (`.claude/skills/<name>/SKILL.md`), and `settings.json` permissions. If they differ from what is described here, use the current format and note it in CONTEXT.md.

### 5.1 `AGENTS.md` (canonical rules; tool-agnostic)
Sections:
1. **Project one-liner + deadline.**
2. **Session start protocol:** read `AGENTS.md` → `docs/CONTEXT.md` → `docs/00-INDEX.md` → only the docs the index maps to the task. Do not bulk-read archives.
3. **Ask-First Protocol** (§1 verbatim).
4. **Engineering rules:** layering (ARCHITECTURE.md), no inline role checks, all SQL parameterized, all input Zod-validated with `.strict()`, scoped queries, errors via `AppError(code, status, message)`, IST via one `server/src/lib/time.js`, no `console.log` in committed code (use logger), no secrets in client, no new deps without approval, JS ESM, named exports, small files (< ~250 lines).
5. **Business-logic rule:** before implementing any leave/attendance/employee endpoint, list the BR-IDs it must enforce and the tests that prove them. Code without mapped tests is not done.
6. **Frontend rules:** design tokens only (no raw hex in components), every data view implements loading/empty/error, forms validate client + server, UI guards are never the only check, follow DESIGN.md anti-slop + motion rules, `alt` on every `<img>`.
7. **Definition of Done (per task):** lint passes · relevant unit/integration tests written and passing · BR/test matrix updated · manual check of each affected role · docs updated (CONTEXT, AI_DEVELOPMENT entry, DECISIONS if any, CHANGELOG) · conventional commit(s).
8. **Task close protocol:** update `docs/CONTEXT.md` · append `docs/AI_DEVELOPMENT.md` entry · log any AI defect found in `docs/AI_CODE_REVIEW.md` immediately · commit.
9. **Phase close protocol:** summarize to `docs/archive/phase-N-<slug>.md` (what was built, decisions, BRs covered, tests, issues, prompt IDs), shrink the CONTEXT.md phase section to ≤5 lines + link, tick PHASES.md exit criteria.
10. **Honesty rules:** never claim tests pass without running them; never invent metrics, reviews, or credentials; say "not verified" when not verified.
11. **Git:** conventional commits (`feat(leave): ...`, `docs: ...`, `test: ...`), commit per task, never commit `.env*` except `.env.example`.

### 5.2 `CLAUDE.md`
```
@AGENTS.md
```
Plus Claude-Code-specific notes: start risky work in Plan Mode; use subagents listed below; use the skills below at task close; GSAP skills installed (see README setup) and must be consulted for any animation code; prefer running tests over reasoning about whether they pass.

### 5.3 Subagents in `.claude/agents/`
- **`security-reviewer`**: read-only tools. Given a diff or module, checks against SECURITY.md threat table and the permission matrix, looking for IDOR, missing scope in SQL, inline role checks, mass assignment, self-approval, secrets in client, missing Zod. Output: findings with severity, file:line, and suggested fix. Any finding that reveals an AI-generated defect → reminds to log in AI_CODE_REVIEW.md.
- **`rules-tester`**: given a BR-ID list, writes or updates Vitest/Supertest tests and the TESTING.md matrix. Must run them and report real output.
- **`docs-keeper`**: at task/phase close, updates CONTEXT.md, AI_DEVELOPMENT.md, CHANGELOG.md, PHASES.md checkboxes, archive files. It must not change code.
- **`ui-reviewer`**: read-only. Checks a screen against DESIGN.md (tokens only, anti-slop list, states contract, a11y, motion rules, reduced motion) and the web quality checklist rows that apply.

### 5.4 Skills in `.claude/skills/`
- **`close-task`**: runs the Task close protocol (§5.1.8) step by step, delegating to docs-keeper.
- **`close-phase`**: runs the Phase close protocol (§5.1.9).
- **`log-prompt`**: given a prompt file, creates the `docs/AI_DEVELOPMENT.md` entry skeleton and asks the human the "accepted / changed / rejected" questions instead of guessing.
- **`log-ai-defect`**: interactive AI_CODE_REVIEW.md entry creation.

### 5.5 `.claude/settings.json`
Sensible permissions: allow `npm run *`, `npx vitest`, `npx playwright test`, `git status/diff/add/commit/log`. Ask for `git push`, `supabase db push`, `vercel deploy`, and any `rm -rf`. Deny reading `.env`, `.env.local`, `.env.*.local`.

---

## 6. Scaffolding

```
/
├─ AGENTS.md  CLAUDE.md  README.md  CHANGELOG.md  .gitignore  .editorconfig  .nvmrc (20)
├─ .env.example
├─ package.json            # npm workspaces: client, server; root scripts
├─ vercel.json             # build, rewrites (/api/* → api/index.js; SPA fallback → /index.html); security headers
├─ api/index.js            # imports server app, exports for Vercel (verify current guidance)
├─ .github/workflows/ci.yml  # lint + unit tests
├─ .claude/ agents/ skills/ settings.json
├─ supabase/migrations/    # empty, .gitkeep
├─ docs/ (all §4 files) archive/.gitkeep  prompts/
├─ client/
│  ├─ index.html           # base meta, favicon links (assets TBD P-002)
│  ├─ public/ robots.txt sitemap.xml (placeholder domain TBD) site.webmanifest
│  ├─ vite.config.js  eslint.config.js
│  └─ src/
│     ├─ main.jsx  App.jsx (router: public routes + /app/* guarded + * → NotFound placeholder)
│     ├─ styles/tokens.css (variable names from DESIGN.md, TBD values)  index.css
│     ├─ lib/api.js (fetch wrapper skeleton)  lib/queryClient.js
│     ├─ components/ui/ (.gitkeep)
│     └─ features/ landing/ auth/ dashboard/ employees/ attendance/ leave/ audit/ (.gitkeep each)
└─ server/
   ├─ package.json  eslint.config.js  vitest.config.js
   └─ src/
      ├─ app.js (express, helmet, json, cookie-parser, /api/health, 404 JSON, errorHandler)
      ├─ server.js (local listen)
      ├─ config/env.js (Zod-validated env; fail fast)
      ├─ lib/ logger.js  errors.js (AppError)  time.js (IST helpers — signatures + TODO only)
      ├─ middleware/ errorHandler.js  (authenticate/authorize/validate as TODO stubs that throw 501)
      ├─ policies/ (.gitkeep)  domain/ (.gitkeep)  db/pool.js (pg pool from DATABASE_URL, lazy)
      └─ modules/ auth/ employees/ attendance/ leave/ dashboard/ audit/ (.gitkeep)
   └─ tests/ unit/ integration/ (+ one passing smoke test for /api/health)
```

Root scripts: `dev` (client + server concurrently), `build`, `lint`, `test`, `test:unit`, `test:api`, `test:e2e`, `seed`, `seed:reset`. The seed scripts are stubs until P1.

`.env.example` (server-only unless noted): `NODE_ENV`, `APP_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or the current name for the service-role key; verify), `SUPABASE_PUBLISHABLE_KEY` (server-only use for auth calls if required; verify), `DATABASE_URL` (transaction pooler), `TEST_DATABASE_URL`, `TEST_SUPABASE_URL`, `TEST_SUPABASE_SECRET_KEY`, `DEMO_PASSWORD`, `LOGIN_RATE_LIMIT_PER_15MIN`. Client: **none secret**, only `VITE_SITE_URL`.

`vercel.json` headers per SECURITY.md. CSP may need adjusting for Vercel Analytics, so note it as a P2 check.

After scaffolding: `npm install`, `npm run lint`, `npm run test:unit` must pass, and `npm run dev` must serve the client and `/api/health` → `{ "status": "ok" }`. Report real command output.

---

## 7. Finish

1. Commit in this order: (a) `docs: planning, PRD, architecture, decisions, business rules` (docs first, so git history shows planning before code), (b) `chore: agent configuration`, (c) `chore: scaffold monorepo`.
2. Update `docs/CONTEXT.md`: P0 done, next = P1 Foundation, open questions.
3. Add the `docs/AI_DEVELOPMENT.md` entries for P-000 and P-001. For P-001 "What I accepted / changed", leave `TO BE FILLED BY ANKUSH` rather than guessing.
4. Reply with: files created (tree), commands run with real results, anything from current docs that contradicted this prompt, and any `QUESTION [Q-###]` items.
