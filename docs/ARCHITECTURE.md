> Status: Draft   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/DECISIONS.md ADR-001…008, docs/DATABASE.md, docs/SECURITY.md

# Architecture

## System diagram

```mermaid
flowchart LR
    Browser["Browser (React SPA)"] -->|HTTPS, same-origin| Vercel["Vercel: static client + /api/* Vercel Function (Node.js, Fluid Compute)"]
    Vercel -->|Express app in api/index.js| API["Express 5 app"]
    API -->|pg, transaction pooler, parameterized SQL| PG[("Supabase Postgres")]
    API -->|Admin API (secret key), getClaims (JWKS)| Auth["Supabase Auth"]
```

## Request lifecycle

```
authenticate → loadEmployee → authorize(policy) → validate(zod) → service → repository → response / errorHandler
```

- `authenticate`: verifies the access-token cookie via Supabase `getClaims()` (ADR-003). No DB call yet.
- `loadEmployee`: loads the `employees` row by `auth_user_id`. Attaches `req.actor = { id, role, employmentStatus, managerId, departmentId, ... }`. `employmentStatus !== 'active'` → `401` (ADR-004).
- `authorize(policy)`: calls `can(actor, action, resource?)` from `server/src/policies/`. Never an inline `role === '...'` check in a route.
- `validate(zod)`: parses/strips the request body/query against a per-route, per-role `.strict()` schema.
- `service`: business rules (BR-01…BR-26), pure orchestration, calls repositories with `req.actor` for scoping.
- `repository`: all SQL. Every read/write by ID takes the actor/scope and filters in the query (ADR-008).
- `errorHandler`: maps `AppError(code, status, message, details?)` to the `{ error: { code, message, details } }` shape; no stack traces in production.

## Repo structure

```
/
├─ api/index.js          # exports the Express app for Vercel's Node.js runtime
├─ client/                # React 19 + Vite SPA
│  └─ src/
│     ├─ features/*       # one folder per domain (landing, auth, dashboard, employees, attendance, leave, audit)
│     ├─ components/ui/   # shared design-system components (Button, DataTable, etc.)
│     ├─ lib/              # api.js fetch wrapper, queryClient.js
│     └─ styles/           # tokens.css (design tokens), index.css
├─ server/                # Express 5 API
│  └─ src/
│     ├─ modules/*         # one folder per domain: routes + controllers
│     ├─ policies/         # can(actor, action, resource?) + scope builders
│     ├─ domain/           # pure functions: date math, working days, status derivation, balance, overlap
│     ├─ middleware/        # authenticate, authorize, validate, errorHandler
│     ├─ lib/               # logger, errors (AppError), time (IST helpers)
│     ├─ config/            # env.js (Zod-validated, fail fast)
│     └─ db/pool.js         # lazy pg pool (transaction pooler)
├─ supabase/migrations/    # SQL migration files (not yet run — pending human approval)
└─ docs/                   # this documentation system
```

## Layering rules

- Routes contain no SQL and no inline role checks.
- Services contain business rules and are unit-testable with injected repositories (no direct DB access in a service function signature).
- Repositories contain all SQL, always take an `actor`/scope parameter for scoped reads, and never trust an `employee_id` in a request body for self-actions.
- Domain (`server/src/domain/*.js`) = pure functions with zero I/O: date math, working-day calculation, attendance-status derivation, leave-balance calculation, overlap checking. These are the primary unit-test surface for BR-ID coverage.
- Permission policies live in one module, `server/src/policies/`, exporting `can(actor, action, resource?)` and scope builders (e.g. `scopeForEmployeeList(actor)`). Routes call `authorize(policy)`, never `role === 'admin'` inline.

## API contract table

| Method | Path | Roles | Scope | Success | Key errors |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | public | — | `200` profile + cookies | `401` generic (no user enumeration) |
| POST | `/api/auth/logout` | any | self | `204` | — |
| POST | `/api/auth/refresh` | any (valid refresh cookie) | self | `200` new cookies | `401` |
| GET | `/api/auth/me` | any | self | `200` employee profile | `401` |
| GET | `/api/employees` | admin | all | `200` paginated list | `403` |
| POST | `/api/employees` | admin | — | `201` | `409 EMAIL_TAKEN`, `400 INVALID_MANAGER` |
| GET | `/api/employees/:id` | admin | all (by id) | `200` | `404` |
| PATCH | `/api/employees/:id` | admin (any field) / self (`phone` only) | scoped | `200` | `403 FIELD_NOT_EDITABLE`, `400 INVALID_MANAGER` |
| PATCH | `/api/employees/:id/status` | admin | all | `200` | `409 HAS_ACTIVE_REPORTS`, `409 LAST_ADMIN`, `403` (self) |
| GET | `/api/departments` | any authenticated | — | `200` list | — |
| POST | `/api/attendance/check-in` | any | self | `201` | `409 ALREADY_CHECKED_IN`, `409 ON_APPROVED_LEAVE`, `409 NON_WORKING_DAY` |
| POST | `/api/attendance/check-out` | any | self | `200` | `409 NOT_CHECKED_IN`, `409 ALREADY_CHECKED_OUT` |
| GET | `/api/attendance/today` | any | self | `200` | — |
| GET | `/api/attendance` | any (self) / manager (team) / admin (all) | scoped | `200` paginated | — |
| GET | `/api/leave-types` | any authenticated | — | `200` | — |
| GET | `/api/leaves/balance` | any | self | `200` per-type balance | — |
| POST | `/api/leaves` | any | self | `201` | `400/409/422` per BR-01…09 |
| GET | `/api/leaves/mine` | any | self | `200` paginated | — |
| GET | `/api/leaves` | manager (team) / admin (all) | scoped | `200` paginated approvals queue | `403` (employee calling this) |
| POST | `/api/leaves/:id/approve` | manager (direct report) / admin (not self) | scoped | `200` | `404`, `403 SELF_APPROVAL_FORBIDDEN`, `409 INVALID_STATUS_TRANSITION`, re-validated `409`s (BR-04) |
| POST | `/api/leaves/:id/reject` | manager (direct report) / admin (not self) | scoped | `200` | same as approve + `400 VALIDATION_ERROR` (reason) |
| POST | `/api/leaves/:id/cancel` | requester only | self | `200` | `404`, `409 LEAVE_ALREADY_STARTED`, `409 INVALID_STATUS_TRANSITION` |
| GET | `/api/dashboard` | any | role-shaped | `200` | — |
| GET | `/api/audit-logs` | admin | all | `200` paginated | `403` |
| GET | `/api/health` | public | — | `200 {"status":"ok"}` | — |

## Pagination convention

Request: `?page=1&pageSize=20`. Response: `{ data: [...], meta: { page, pageSize, total } }`.

## Frontend structure

- `features/*` folders, one per domain, own components + hooks + API calls.
- `lib/api.js`: fetch wrapper, `credentials: 'same-origin'`, JSON only, on `401` calls `/api/auth/refresh` once then retries, redirects to `/login` on repeated failure.
- TanStack Query keys: `[domain, ...params]`, e.g. `['employees', { page, search }]`, `['leaves', 'mine']`, `['dashboard']`.
- Route guards (`/app/*` requires a session; role-gated sub-routes) are UX only — the API is the real authorization boundary (ADR-007).

## Approved dependency list

| Package | Side | Reason |
|---|---|---|
| react, react-dom | client | UI runtime (ADR-001) |
| vite, @vitejs/plugin-react | client | build tooling |
| react-router | client | routing |
| @tanstack/react-query | client | server-state cache, loading/error states |
| react-hook-form, zod, @hookform/resolvers | client | form state + schema validation |
| tailwindcss | client | utility CSS with CSS-variable tokens |
| sonner | client | toasts |
| lucide-react | client | one consistent icon set |
| gsap, @gsap/react | client | landing + app motion (ADR-017) |
| express | server | HTTP framework |
| zod | server | request validation |
| pg | server | Postgres client (ADR-006) |
| helmet | server | security headers |
| cookie-parser | server | cookie parsing |
| pino | server | structured logging |
| @supabase/supabase-js | server | Auth Admin API + token verification |
| vitest | dev | unit tests |
| supertest | dev | API integration tests |
| @playwright/test | dev | E2E tests |
| eslint | dev | linting |

Any dependency not on this list requires an Ask-First #2 question before adding.

## Environment variables

| Name | Where | Secret? | Example |
|---|---|---|---|
| `NODE_ENV` | server | no | `development` |
| `APP_URL` | server | no | `http://localhost:3000` |
| `SUPABASE_URL` | server | no | `https://xxxx.supabase.co` |
| `SUPABASE_SECRET_KEY` | server | **yes** | `sb_secret_...` (replaces legacy `service_role`) |
| `SUPABASE_PUBLISHABLE_KEY` | server | no | `sb_publishable_...` (used server-side for auth calls) |
| `DATABASE_URL` | server | **yes** | Supabase transaction pooler URL |
| `TEST_DATABASE_URL` | server (test) | **yes** | separate test project pooler URL |
| `TEST_SUPABASE_URL` | server (test) | no | separate test project URL |
| `TEST_SUPABASE_SECRET_KEY` | server (test) | **yes** | separate test project secret key |
| `DEMO_PASSWORD` | server (seed) | **yes** (see SECURITY.md demo policy) | set at seed time |
| `LOGIN_RATE_LIMIT_PER_15MIN` | server | no | `10` |
| `VITE_SITE_URL` | client | no | `https://stafy.vercel.app` |

No Supabase key or secret is ever present in the client bundle (verified by a CI grep check, see `docs/SECURITY.md`).
