> Status: Draft   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/BUSINESS_RULES.md, docs/SECURITY.md, docs/DECISIONS.md ADR-020

# Testing

## Strategy

- **Unit** (Vitest): pure domain functions in `server/src/domain/*.js` — date math, working-day calculation, attendance-status derivation, leave-balance calculation, overlap checking. Target: every BR-ID with date/status logic has a direct unit test.
- **Integration** (Supertest): against a **separate test Supabase project** via `TEST_DATABASE_URL`/`TEST_SUPABASE_URL`/`TEST_SUPABASE_SECRET_KEY`. Truncate + reseed per suite.
- **E2E** (Playwright): 3-role flow — HR adds an employee → employee checks in and applies for leave → a manager of a *different* team cannot see that request → the correct manager approves it → dashboards update accordingly.

## Test matrix

Status is `planned` until a test is written and actually run; only then does it flip to `passing`. This matrix is the artifact that proves edge-case handling.

| BR / Threat | Test ID(s) | Status |
|---|---|---|
| BR-01 | T-UNIT-01 | planned |
| BR-02 | T-UNIT-02, T-API-02 | planned |
| BR-03 | T-API-03 | planned |
| BR-04 | T-API-04 | planned |
| BR-05 | T-UNIT-05 | planned |
| BR-06 | T-UNIT-06 | planned |
| BR-07 | T-UNIT-07, T-API-07 | planned |
| BR-08 | T-UNIT-08 | planned |
| BR-09 | T-API-09 | planned |
| BR-10 | T-API-10 | planned |
| BR-11 | T-API-11 | planned |
| BR-12 | T-API-12 | planned |
| BR-13a…e | T-API-13a…e | planned |
| BR-14 | T-API-14 | planned |
| BR-15 | T-API-15 | planned |
| BR-16 | T-API-16 | planned |
| BR-17 | T-API-17 | planned |
| BR-18 | T-UNIT-18 | planned |
| BR-19 | T-API-19 | planned |
| BR-20 | T-API-20 | planned |
| BR-21 | T-API-21 | planned |
| BR-22 | T-API-22 | planned |
| BR-23 | T-UNIT-23, T-API-23 | planned |
| BR-24 | T-API-24 | planned |
| BR-25 | T-API-25 | planned |
| BR-26 | T-UNIT-26 | planned |
| IDOR (cross-team leave/attendance) | T-API-IDOR-01 | planned |
| Self-approval | T-API-SEC-01 | planned |
| Mass assignment (`role`/`status` in PATCH body) | T-API-SEC-02 | planned |
| Deactivated user, valid token | T-API-SEC-03 | planned |
| Full 3-role flow | T-E2E-01 | planned |

## Commands

```
npm run test:unit    # vitest, server domain functions
npm run test:api     # supertest, integration against TEST_DATABASE_URL
npm run test:e2e     # playwright, manual trigger (not in CI)
npm run test         # unit + api
```

## CI

GitHub Actions (`.github/workflows/ci.yml`): lint + unit tests on every push. Integration tests run when `TEST_DATABASE_URL` secrets exist (added once the test Supabase project is provisioned). E2E is manual, not in CI, for this assessment's timeline.

## Manual QA checklist per role (live demo)

- **Admin**: log in, list/search/filter employees, add an employee, deactivate one with no reports, attempt to deactivate the last admin (expect block), view audit log, approve a leave for someone with no manager.
- **Manager**: log in, view only direct reports on attendance/team views, approve/reject a direct report's leave, confirm a cross-team leave request is invisible (404 on direct access).
- **Employee**: log in, check in/out, apply for leave (happy path + one rejected edge case), cancel a pending request, view balance.
