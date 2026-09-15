> Status: Draft   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/BUSINESS_RULES.md, docs/ARCHITECTURE.md, docs/DECISIONS.md

# PRD — Stafy

## Problem

Small organizations need a minimal, correct HR system to track who works for whom, when people worked, and whether their leave was approved — with strict role boundaries so a manager cannot see or act on another team's data. This is a practical assessment for AppTrait Solutions ("Vibe Coder – Intern/Fresher"); evaluators score planning, prompting/AI-review discipline, and business-logic/authorization correctness — not code volume.

## Users & roles

| Role | Who | Can also do |
|---|---|---|
| `admin` (HR/Admin) | HR staff | Everything an `employee` can do (check in/out, apply leave) + manage all employees, approve/reject any leave except their own, view audit log |
| `manager` | Team lead | Everything an `employee` can do + manage view of their direct reports, approve/reject their direct reports' leave |
| `employee` | Everyone else | Check in/out, apply/cancel own leave, view own profile/attendance/leave history |

## Goals

- Enforce every business rule in `docs/BUSINESS_RULES.md` at the API layer, with DB constraints as a second line of defense.
- Make authorization scope (team, self, all) impossible to bypass via client input (ADR-004, ADR-008).
- Ship a live, responsive, "alive not busy" demo with real seeded data.

## Non-goals (out of scope)

Per PDF: biometric attendance, GPS-based attendance, shift scheduling. Per ADR-022: HR attendance correction/regularization. Per ADR-011: public holiday calendars. Per ADR-009: multi-level/multi-approver leave approval. Per ADR-019: native mobile app.

## Permission matrix

| Action | employee | manager | admin |
|---|---|---|---|
| Check in/out (self) | ✅ | ✅ | ✅ |
| View own attendance/leave history | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Edit own profile (phone only, BR-22) | ✅ | ✅ | ✅ |
| Apply for leave (self) | ✅ | ✅ | ✅ |
| Cancel own leave (BR-13) | ✅ | ✅ | ✅ |
| View own leave balance | ✅ | ✅ | ✅ |
| View direct reports' attendance | ❌ | ✅ | ✅ (all) |
| Approve/reject direct reports' leave | ❌ | ✅ | ✅ (all except own) |
| List/search/filter/paginate employees | ❌ | ❌ (own team view only) | ✅ |
| Add employee | ❌ | ❌ | ✅ |
| Edit any employee (except role/status of self, BR-25) | ❌ | ❌ | ✅ |
| Activate/deactivate employee | ❌ | ❌ | ✅ |
| View audit log | ❌ | ❌ | ✅ |
| View dashboard (role-shaped) | ✅ (own) | ✅ (team) | ✅ (org) |

## Functional requirements

### Auth (`FR-AUTH-*`)
- **FR-AUTH-01**: A user can log in with email + password. *Given* valid credentials for an active employee, *when* they `POST /api/auth/login`, *then* they receive `HttpOnly` session cookies and a `200` with their profile.
- **FR-AUTH-02**: A deactivated employee cannot authenticate or use any existing session. *Given* an employee with `employment_status = inactive`, *when* they call any authenticated endpoint (even with a previously valid token), *then* they get `401`.
- **FR-AUTH-03**: A logged-in user can fetch their own identity. *Given* a valid session, *when* they call `GET /api/auth/me`, *then* they receive their `employees` row (role/status/team from the DB, not the token).
- **FR-AUTH-04**: A session can be silently refreshed once on `401`. *Given* an expired access token with a valid refresh token, *when* the client's `lib/api.js` wrapper gets a `401`, *then* it calls `POST /api/auth/refresh` once and retries; on repeated failure it redirects to login.

### Employees (`FR-EMP-*`)
- **FR-EMP-01**: HR/Admin can list, search, filter, and paginate employees. *Given* an admin session, *when* they call `GET /api/employees?search=&department=&page=&pageSize=`, *then* they get a paginated, filtered result scoped to no restriction (admin sees all).
- **FR-EMP-02**: HR/Admin can add an employee. *Given* valid input (BR-21, BR-23, BR-26), *when* they `POST /api/employees`, *then* an `employees` row and a Supabase Auth login are created.
- **FR-EMP-03**: HR/Admin can edit any employee's editable fields; self-edit is limited to `phone` (BR-22).
- **FR-EMP-04**: HR/Admin can activate/deactivate an employee, subject to BR-24 (auto-cancel pending leave, block if active direct reports) and BR-25 (last-admin protection).
- **FR-EMP-05**: Any authenticated user can view and edit (phone-only) their own profile.

### Attendance (`FR-ATT-*`)
- **FR-ATT-01**: An employee can check in once per IST working day (BR-14, BR-17, BR-18).
- **FR-ATT-02**: An employee can check out once, only for today, only after checking in (BR-15, BR-16, BR-19).
- **FR-ATT-03**: An employee can view today's status and their own history (`GET /api/attendance/today`, `GET /api/attendance`).
- **FR-ATT-04**: A manager can view their direct reports' attendance with date-range filters; HR/Admin can view anyone's.

### Leave (`FR-LV-*`)
- **FR-LV-01**: An employee can view leave types and their own computed balance (`GET /api/leave-types`, `GET /api/leaves/balance`, ADR-014).
- **FR-LV-02**: An employee can apply for leave, subject to BR-01…BR-09.
- **FR-LV-03**: An employee can view their own leave requests (`GET /api/leaves/mine`) and cancel per BR-13.
- **FR-LV-04**: A manager/HR-Admin can view their approvals queue (`GET /api/leaves` with employee/status/date filters, scoped per ADR-009) and approve/reject with a reason, subject to BR-04, BR-10, BR-11, BR-12.

### Dashboard (`FR-DASH-*`)
- **FR-DASH-01**: Each role sees a role-shaped dashboard payload (`GET /api/dashboard`) with metrics defined below.
- **FR-DASH-02**: Every dashboard has at least one element driven by real, changing data (ADR-017 "alive not busy" rule) — no fake/randomized values.

### Web quality (`FR-WEB-*`)
- **FR-WEB-01**: The public landing page meets the scoped Web Quality Checklist in `docs/SECURITY.md` (meta, OG image, favicon, sitemap/robots, alt text, compressed images, Lighthouse ≥90, contrast, mobile-friendly, custom 404, no broken links, analytics, one primary CTA).
- **FR-WEB-02**: Privacy Policy and Terms pages exist as static public routes.

## Dashboard metric definitions

| Metric | Exact counting rule |
|---|---|
| Present Today | Active employees (in scope for the viewer) with an attendance row for today (IST) and `check_in_at` set. |
| On Leave Today | Active employees (in scope) with an approved full-day leave covering today, or an approved half-day leave covering today. |
| Absent Today | Active employees (in scope), on/after `joining_date`, today is a working day, no attendance row for today, no approved leave covering today. Only meaningful once the working day has effectively started; "Not checked in" is shown instead of "Absent" for today per ADR-011. |
| Pending Approvals | Leave requests with `status = pending` where the viewer is the eligible approver (their direct reports for a manager; all for HR/Admin) per ADR-009 routing. |
| Team Size / Org Size | Count of active employees in scope (direct reports for a manager, all for HR/Admin). |
| Avg. Hours This Week | For attendance rows in the current ISO week (Mon–today, IST) in scope, mean of `check_out_at - check_in_at` for rows with both timestamps set. |

## Out-of-scope (explicit)

Biometric attendance, GPS-based attendance, shift scheduling (PDF), HR attendance correction (ADR-022), public holiday calendar (ADR-011), multi-level leave approval (ADR-009), native mobile app (ADR-019), email notifications, profile photos, dark mode, CSV export, attendance calendar (ADR-024).

## Deviations from the PDF

1. Leave has 4 statuses (`pending|approved|rejected|cancelled`), not 3 — ADR-010.
2. Attendance status is derived at read time, not stored, with a `Not checked in` state the PDF doesn't mention — ADR-011.
3. Leave approval is single-approver (manager or HR/Admin), not the owner's originally-proposed 2-manager scheme — ADR-009.
4. SPA soft-404 returns HTTP 200 — ADR-016.

## PDF traceability table

| PDF § | Topic | Covered by |
|---|---|---|
| 1 | Overview | README.md Overview |
| 2 | Roles & permissions | This doc, Permission matrix |
| 3 | Employee management | FR-EMP-01…05, BR-21…26 |
| 4 | Attendance | FR-ATT-01…04, BR-14…20 |
| 5 | Leave management | FR-LV-01…04, BR-01…13 |
| 6 | Dashboard | FR-DASH-01…02, Dashboard metric definitions |
| 7 | Optional features | ADR-024 |
| 8 | AI development process | docs/AI_DEVELOPMENT.md |
| 9 | AI code review | docs/AI_CODE_REVIEW.md |
| 10 | Planning document | docs/PLANNING.md |
| 11–14 | Tech constraints / stack | docs/ARCHITECTURE.md, ADR-001 |
| 15 | README requirements | README.md (all headings present) |
| 16 | Deployment | docs/ARCHITECTURE.md, ADR-002, vercel.json |
| 17 | Submission checklist | docs/PHASES.md P8 |
