# Stafy

Mini HRMS — practical assessment for AppTrait Solutions ("Vibe Coder – Intern/Fresher").

## Overview

Stafy is a role-based HR system: employees check in/out, apply for and manage leave, and HR/Admins manage the org — all under strict, database-backed authorization. This submission is a real, deployed slice built under a hard deadline (see **Known Limitations** below for exactly what's implemented vs. cut) — real Supabase Postgres + Auth, real Express API, real business-rule enforcement (constraint-backed and route-enforced), no mock data in production.

## Live Demo

**https://stafy-seven.vercel.app**

## Demo Credentials

| Role | Email | Password | Team |
|---|---|---|---|
| HR/Admin | `hr@stafy.app` | `StafyDemo2026!` | — |
| Manager | `manager@stafy.app` | `StafyDemo2026!` | Team A (Engineering) |
| Manager | `manager.b@stafy.app` | `StafyDemo2026!` | Team B (Design) — for the cross-team 404 test |
| Employee | `employee@stafy.app` | `StafyDemo2026!` | Team A (Engineering) |

Demo credentials are intentionally public for evaluation — see `docs/SECURITY.md` demo credential policy.

## Features

**Real, wired to the live database:**
- Login/logout against Supabase Auth, `HttpOnly` cookie sessions, deactivated-account lockout.
- Role-shaped dashboards (Admin/Manager/Employee) — every number is a real query, not mock data.
- Employee check-in/check-out with server-enforced rules: no double check-in, no check-out without check-in, no check-in on a weekend or on approved full-day leave.
- Manager/Admin leave approvals: approve/reject with a required reason, self-approval forbidden, a manager acting on another team's request gets a 404 (not a 403 — no enumeration), a decided request can't be decided twice — accessible via dashboard and dedicated `/app/approvals` queue.
- Leave management at `/app/leave` (all roles): apply for leave (full/half day, live overlap rejection via a DB exclusion constraint, reason validation), cancel pending/not-yet-started-approved requests, and a real balance meter per leave type.
- Admin: Employees directory at `/app/employees` — search by name/email/ID, filter by department/status, click to view detail drawer, add employee modal, and deactivation with BR-24 (reports check) and BR-25 (last admin check).
- Manager: dedicated team list at `/app/team` showing direct reports and today's status.
- Employee Profile at `/app/profile`: view personal profile and update phone number (BR-22).
- Admin Audit Log at `/app/audit`: full historical audit trail of security and mutation events.
- Attendance at `/app/attendance`: Admin (org-wide) and Manager (team-scoped) get a single-day table with prev/next date navigation and 4 summary cards (Present/Half Day/Absent/On Leave); Employee gets their own last-30-days history.
- Real audit log writes on deactivation/approval/rejection/creation.

**Known limitation — not implemented** (see below): Attendance search/department filter on day view, Leave calendar tabs, and the full multi-month calendar visual from the late-arriving `other_pages.zip` design export (this ships functional, token-compliant, reduced-fidelity versions instead). See `docs/PRD.md` for the full original functional requirement list.

## Tech Stack

React 19 + Vite (JS) · React Router · TanStack Query · React Hook Form + Zod · Tailwind CSS v4 · GSAP · Express 5 (JS/ESM) · `pg` · Supabase (Postgres + Auth) · Vercel. Full rationale in `docs/DECISIONS.md` ADR-001.

## Architecture

See `docs/ARCHITECTURE.md` for the system diagram, request lifecycle, and full API contract table.

## Database Structure

See `docs/DATABASE.md` for the ER diagram and DDL design.

## Business Rules & Edge Cases

Full list with enforcement layer, status code, and test ID: `docs/BUSINESS_RULES.md`. Summary:

| Area | Rules |
|---|---|
| Leave | BR-01…BR-13 (date validation, overlap, balance, approval routing, cancellation) |
| Attendance | BR-14…BR-20 (check-in/out state machine, leave interaction, scoping) |
| Employees & accounts | BR-21…BR-26 (uniqueness, mass-assignment guard, manager cycles, deactivation, last-admin protection) |

## Security

Threat model, permission matrix, headers, and cookie policy: `docs/SECURITY.md`.

## Setup Instructions

```
npm install
cp .env.example .env   # fill in your own Supabase project values
psql "$DATABASE_URL" -f supabase/migrations/20260916140000_init.sql
DEMO_PASSWORD=... node server/src/scripts/seed.js
npm run dev
```

## Environment Variables

See `.env.example` for the full list. `SUPABASE_URL`/`SUPABASE_SECRET_KEY`/`SUPABASE_PUBLISHABLE_KEY`/`DATABASE_URL` come from your Supabase project's API/Database settings; `DEMO_PASSWORD` is the password the seed script sets for all 4 demo accounts.

## Testing

Strategy, commands, and BR/threat → test-ID matrix: `docs/TESTING.md`. Honest summary: 5 automated unit tests passing (`npm run test:unit`, IST/working-day logic — one of which caught and fixed a real timezone bug, AICR-005). No automated integration/E2E suite this pass (time-boxed) — the business rules the API actually enforces (BR-02, BR-09, BR-10, BR-11, BR-12, BR-14, BR-15, BR-17) were verified manually against the live production API and database and are logged as such in `docs/TESTING.md`, not claimed as `passing` automated coverage.

## AI Development Process

Full prompt-by-prompt log: `docs/AI_DEVELOPMENT.md`. Highlights: P-000 (requirements analysis, 16 clarifying questions before any code), P-002 (brand/landing design, real Claude Design deliverable substituted in after a placeholder pass), P-003 (full landing/auth/dashboard UI port against mock data), P-005 (dashboard redesign port to the real design system), P-007 (this pass — real backend built from zero against a live Supabase project, frontend wired off mocks, deployed) under an explicit deadline-mode tiered/cut-order process.

## AI Code Review

Full log with before/after and root cause: `docs/AI_CODE_REVIEW.md`. 5 real cases (AICR-001…005), including two found this pass via live testing: AICR-004 (an infinite reload loop on `/login` caused by a 401-handling helper redirecting on the routine "am I logged in" check) and AICR-005 (an IST-conversion helper that silently broke outside a UTC-local runtime, caught by a failing unit test).

## Planning Document

`docs/PLANNING.md`.

## Deviations from brief

1. Leave has 4 statuses (adds `cancelled`) — ADR-010.
2. Attendance status derived at read time, with a "Not checked in" state — ADR-011.
3. Single-approver leave routing, not the originally-floated 2-manager scheme — ADR-009.
4. SPA soft-404 returns HTTP 200 — ADR-016.

## Known Limitations

**Not implemented this pass** (P-007, deadline-mode triage — see `docs/CONTEXT.md` for the full cut log):
- Employees module: no list/search/filter/pagination/add/edit/activate-deactivate API or UI. The `employees` table, schema, and constraints exist; the routes don't.
- Attendance history page (Admin/Manager table view, Employee calendar strip) — only check-in/check-out and the dashboard's "recent attendance" (already built in P-005) are wired.
- Leave apply/balance/cancel page — only the Manager/Admin approve/reject flow (via the existing dashboard Approvals panel) is wired.
- The `other_pages.zip` design export (Employees/Attendance/Leave redesign) was not ported — no real backend existed yet for those pages to bind to, and Tier 0 (backend foundation) took priority per the cut order.
- Audit log UI (the underlying log writes are real and power Admin's "Recent activity").
- Automated integration/E2E test suite (see Testing above).
- A second HR/Admin account that reports to a manager (`docs/DATABASE.md`'s full seed plan) — only the 4 demo accounts were seeded.

**Out of scope per the original brief** (unchanged from the design phase): no public holiday calendar, no attendance regularization/correction flow, no multi-level leave approval, no partial cancellation of multi-day leave. Full list: `docs/PRD.md` Out-of-scope, `docs/DECISIONS.md` ADR-022/ADR-024.

## Project Docs Index

See `docs/00-INDEX.md`.
