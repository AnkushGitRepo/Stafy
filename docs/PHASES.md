> Status: Living   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/CONTEXT.md, docs/DECISIONS.md ADR-021

# Phases

Deadline: **2026-09-16 16:00 IST**. Feature freeze: **2026-09-16 13:00 IST**.

| Phase | Scope | Timebox | Exit criteria | Depends on |
|---|---|---|---|---|
| P0 | Setup: docs, agent config, scaffold, first commit | 1.5h | [ ] all docs in §4 exist [ ] `.claude/` config exists [ ] `npm install`/`lint`/`test:unit`/`dev` succeed [ ] 3 commits made | — |
| P1 | Foundation: migrations, seed, auth (login/logout/refresh/me), authenticate/authorize middleware, policies, error handler, domain pure functions + unit tests, deploy skeleton to Vercel | 4h | [ ] migration run on real Supabase project [ ] seed data loads [ ] auth endpoints work end-to-end [ ] domain unit tests passing [ ] skeleton deployed | P0. Can run in parallel with P2 design work. |
| P2 | Design system + Landing (GSAP) + Login + Privacy/Terms + 404 + SEO assets | 3h (GSAP polish hard-capped at 1h) | [ ] tokens filled from design reference [ ] landing/login/privacy/terms/404 built [ ] Lighthouse ≥90 on landing | Can run in parallel with P1 |
| P3 | Employees module (HR): list/search/filter/paginate, add, edit, view, activate/deactivate, self profile | 2.5h | [ ] FR-EMP-01…05 implemented + tested | P1 |
| P4 | Attendance: check-in/out, today, history, HR/manager scoped views + filters | 2.5h | [ ] FR-ATT-01…04 implemented + tested | P1 |
| P5 | Leave: apply, balance, my requests, cancel, approvals queue, approve/reject with reason | 3.5h | [ ] FR-LV-01…04 implemented + tested | P1, P4 (attendance existence check for BR-03) |
| P6 | Dashboards ×3 (live data, alive UI) | 2h | [ ] FR-DASH-01…02 implemented | P3, P4, P5 |
| P7 | Hardening: integration + E2E tests, audit log view, security pass, a11y/Lighthouse pass | 3h | [ ] test matrix mostly `passing` [ ] security-reviewer pass clean | P3–P6 |
| P8 | Submission: README, AI report, code review cases, demo creds, deployed verification, link check | freeze 13:00 → submit by 15:30 | [ ] README complete [ ] ≥4 AI_CODE_REVIEW cases logged [ ] live deploy verified [ ] no broken links | P7 |

## Cut order if behind

1. Playwright E2E tests (keep unit + integration).
2. Audit log UI (keep the logging itself).
3. Landing GSAP extras beyond the 1h cap.
4. Pagination UI polish (keep functional server-side pagination).

## Never cut

RBAC enforcement, BR-01…BR-26 and their tests, README, AI development/review docs, live deploy.
