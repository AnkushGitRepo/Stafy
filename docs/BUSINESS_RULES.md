> Status: Draft   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/DATABASE.md, docs/ARCHITECTURE.md, docs/TESTING.md, docs/SECURITY.md

# Business Rules

Error shape for every `4xx`/`409`/`422` response:

```json
{ "error": { "code": "LEAVE_OVERLAP", "message": "...", "details": {} } }
```

Test IDs are `TBD` until `docs/TESTING.md` assigns real `T-UNIT-xx` / `T-API-xx` / `T-E2E-xx` IDs in P1+. New rules discovered during build are appended as BR-27+ (Ask-First #5 applies to anything ambiguous first).

## Leave

| ID | Rule | Layer(s) | Status/Code | Tests |
|---|---|---|---|---|
| BR-01 | End date before start date is rejected. | DB (`CHECK (end_date >= start_date)`), API | `400 INVALID_DATE_RANGE` | TBD |
| BR-02 | Overlap with the requester's own `pending`/`approved` leave is rejected. API pre-check names the conflicting request's dates. | DB (exclusion constraint, `btree_gist`, `daterange(start_date,end_date,'[]')` where status in pending/approved), API | `409 LEAVE_OVERLAP` | TBD |
| BR-03 | Full-day leave on a date with an existing attendance row is rejected. Half-day leave on a date with attendance is allowed (industry norm: half worked + half leave). | API, DB | `409 ATTENDANCE_EXISTS_FOR_DATE` | TBD |
| BR-04 | Approval re-validates BR-02, BR-03, and balance inside the transaction. If attendance appeared after applying, approval fails and the approver must reject or the employee must cancel. | API (transaction) | `409` (re-uses the specific code that failed) | TBD |
| BR-05 | Half-day leave requires `start_date = end_date` and a session (`first_half`\|`second_half`). | API | `400 INVALID_HALF_DAY` | TBD |
| BR-06 | A leave range containing zero working days (weekend only) is rejected. | API | `400 NO_WORKING_DAYS` | TBD |
| BR-07 | Insufficient balance (non-Unpaid types) is rejected; remaining balance is returned in `details`. | API | `422 INSUFFICIENT_BALANCE` | TBD |
| BR-08 | Start date must be within 7 days in the past and 90 days in the future. | API | `400 DATE_OUT_OF_WINDOW` | TBD |
| BR-09 | Reason required, 10–500 chars. Rejection reason required, 10–500 chars. | API (Zod) | `400 VALIDATION_ERROR` | TBD |
| BR-10 | Self-approval is forbidden. | API, DB (`CHECK (approver_id <> employee_id)`) | `403 SELF_APPROVAL_FORBIDDEN` | TBD |
| BR-11 | A manager acting on a non-direct-report's leave gets a not-found response (no enumeration; ADR-008). | API (scoped query) | `404 NOT_FOUND` | TBD |
| BR-12 | Approve/reject only transitions from `pending`, via conditional `UPDATE ... WHERE id=$1 AND status='pending'`. Zero rows affected (double-click, racing approvers) is a conflict. | API, DB | `409 INVALID_STATUS_TRANSITION` | TBD |
| BR-13a | `pending` leave is cancellable by the requester at any time. | API | — | TBD |
| BR-13b | `approved` leave is cancellable by the requester only if `start_date >= today (IST)`. Balance is restored; an audit entry is written. | API (transaction), DB | — | TBD |
| BR-13c | Cancelling an `approved` leave whose `start_date < today` is rejected (partial cancellation of a multi-day leave is a known limitation). | API | `409 LEAVE_ALREADY_STARTED` | TBD |
| BR-13d | Cancelling `rejected`/`cancelled` leave is rejected. | API | `409 INVALID_STATUS_TRANSITION` | TBD |
| BR-13e | Only the requester can cancel their own leave; anyone else gets a not-found response. "Convert to half day" = cancel + re-apply (goes through approval again); editing an approved request is never allowed. | API (scoped query) | `404 NOT_FOUND` | TBD |

## Attendance

| ID | Rule | Layer(s) | Status/Code | Tests |
|---|---|---|---|---|
| BR-14 | A second check-in on the same IST `work_date` is rejected. | DB (`UNIQUE (employee_id, work_date)`), API | `409 ALREADY_CHECKED_IN` | TBD |
| BR-15 | Check-out without a check-in today is rejected. | API | `409 NOT_CHECKED_IN` | TBD |
| BR-16 | A second check-out is rejected. | DB (`CHECK (check_out_at IS NULL OR check_out_at > check_in_at)`), API | `409 ALREADY_CHECKED_OUT` | TBD |
| BR-17 | Check-in on a date covered by **approved full-day** leave is rejected ("cancel your leave first"). Approved half-day leave allows check-in. Pending leave allows check-in (BR-04 then blocks that approval). | API | `409 ON_APPROVED_LEAVE` | TBD |
| BR-18 | Check-in on a weekend (non-working day) is rejected. | API | `409 NON_WORKING_DAY` | TBD |
| BR-19 | Check-out is only allowed against today's record. A past open record (missed checkout) stays flagged, not editable (ADR-011; no regularization flow in v1). | API | `409 NOT_CHECKED_IN` (past date) | TBD |
| BR-20 | No endpoint may create or modify another employee's attendance. Self-actions derive the employee from the session; any body/query `employee_id` on self-actions is stripped by Zod. | API (Zod `.strict()`) | n/a (field silently ignored) | TBD |

## Employees & accounts

| ID | Rule | Layer(s) | Status/Code | Tests |
|---|---|---|---|---|
| BR-21 | Email is unique, case-insensitive (`citext`). Employee code is auto-generated `EMP-0001` and immutable. | DB (`UNIQUE`, `citext`) | `409 EMAIL_TAKEN` | TBD |
| BR-22 | Employee self-edit is limited to a whitelist (`phone` only); every other field is rejected (mass-assignment guard via per-role Zod `.strict()` schemas). | API (Zod) | `403 FIELD_NOT_EDITABLE` | TBD |
| BR-23 | `manager_id` cannot be self and cannot create a cycle. The assigned manager must be active with role `manager` or `admin`. | API, DB (FK) | `400 INVALID_MANAGER` | TBD |
| BR-24 | Deactivation blocks login and every API call immediately (ADR-004). Pending leave requests are auto-cancelled with a system note. Deactivating an employee with active direct reports is rejected (reassign first). | API (transaction) | `409 HAS_ACTIVE_REPORTS` | TBD |
| BR-25 | An employee cannot change their own role/status. The last active admin cannot be deactivated or demoted. | API | `403` (self-change) / `409 LAST_ADMIN` | TBD |
| BR-26 | `joining_date` cannot be more than 90 days in the future. Attendance/absence are never computed before `joining_date`. | API, domain | `400 VALIDATION_ERROR` | TBD |
