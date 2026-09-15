# Stafy

Mini HRMS — practical assessment for AppTrait Solutions ("Vibe Coder – Intern/Fresher").

## Overview

Stafy is a role-based HR system: employees check in/out, apply for and manage leave, and HR/Admins manage the org — all under strict, database-backed authorization. TBD: one more paragraph once P1–P6 are built.

## Live Demo

TBD — deployed URL added after P1 skeleton deploy.

## Demo Credentials

| Role | Email | Password | Team |
|---|---|---|---|
| HR/Admin | `hr@stafy.app` | TBD (`DEMO_PASSWORD`) | — |
| Manager | `manager@stafy.app` | TBD (`DEMO_PASSWORD`) | Team A |
| Manager | `manager.b@stafy.app` | TBD (`DEMO_PASSWORD`) | Team B (for cross-team test) |
| Employee | `employee@stafy.app` | TBD (`DEMO_PASSWORD`) | Team A |

Demo credentials are intentionally public for evaluation — see `docs/SECURITY.md` demo credential policy.

## Features

TBD — filled in as P3–P6 complete. See `docs/PRD.md` for the full functional requirement list.

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

TBD — filled in once P1 auth/DB exist. Rough shape:
```
npm install
cp .env.example .env   # fill in Supabase project values
npm run dev
```

## Environment Variables

See `docs/ARCHITECTURE.md` §Environment variables for the full table.

## Testing

Strategy, commands, and BR/threat → test-ID matrix: `docs/TESTING.md`.

## AI Development Process

TBD — generated from the best 5–8 entries in `docs/AI_DEVELOPMENT.md` at submission.

## AI Code Review

TBD — generated from the best 2+ entries in `docs/AI_CODE_REVIEW.md` at submission.

## Planning Document

`docs/PLANNING.md`.

## Deviations from brief

1. Leave has 4 statuses (adds `cancelled`) — ADR-010.
2. Attendance status derived at read time, with a "Not checked in" state — ADR-011.
3. Single-approver leave routing, not the originally-floated 2-manager scheme — ADR-009.
4. SPA soft-404 returns HTTP 200 — ADR-016.

## Known Limitations

No public holiday calendar, no attendance regularization/correction flow, no multi-level leave approval, no partial cancellation of multi-day leave. Full list: `docs/PRD.md` Out-of-scope, `docs/DECISIONS.md` ADR-022/ADR-024.

## Project Docs Index

See `docs/00-INDEX.md`.
