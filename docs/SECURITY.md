> Status: Draft   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/DECISIONS.md ADR-002…008, docs/ARCHITECTURE.md, docs/BUSINESS_RULES.md

# Security

## Threat model

| Threat | Mitigation | Test ID |
|---|---|---|
| IDOR via URL/body ID (e.g. fetch another team's leave request) | Scoped SQL query per actor; out-of-scope → `404`, never `403` (ADR-008) | TBD |
| Manager acting outside their team | `authorize(policy)` scope builder restricts to direct reports (BR-11) | TBD |
| Self-approval of own leave | API check + DB `CHECK (approver_id <> employee_id)` (BR-10) | TBD |
| Privilege escalation via `PATCH` body (`role`, `status`, `manager_id`) | Per-role Zod `.strict()` schema whitelists editable fields (BR-22, BR-25) | TBD |
| Mass assignment | Zod `.strict()` on every input schema, unknown keys rejected | TBD |
| Deactivated user with a still-valid token | `loadEmployee` middleware re-checks `employment_status` from the DB on every request (ADR-004) | TBD |
| XSS token theft | Tokens stored only in `HttpOnly` cookies, never accessible to JS | TBD |
| CSRF | `SameSite` cookies + same-origin (ADR-002) + JSON-only `Content-Type` check on mutating routes | TBD |
| SQL injection | 100% parameterized queries via `pg`, no string-built SQL (ADR-006) | TBD |
| Brute-force login | Supabase Auth's own limits + app-level rate limiter (`LOGIN_RATE_LIMIT_PER_15MIN`) | TBD |
| Secret leakage into the client bundle | No Supabase secret/service keys referenced in `client/`; CI grep check for `SECRET|SERVICE_ROLE` in `client/dist` before deploy | TBD |
| User enumeration via login errors | Generic `401` message on any login failure (no "user not found" vs "wrong password" distinction) | TBD |
| Verbose errors leaking internals | `errorHandler` strips stack traces in production; only `AppError` code/message/details reach the client | TBD |

## Permission matrix

See `docs/PRD.md` Permission matrix — that table is the single source of truth; tests are written directly from it.

## Security headers (`vercel.json`)

- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`: `self` + Vercel Web Analytics only
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: deny unused browser features
- `frame-ancestors 'none'`
- HTTPS is enforced by Vercel automatically.

CSP may need adjusting once Vercel Analytics' actual script/connect-src origins are confirmed — flagged as a P2 check in `docs/PHASES.md`.

## Cookie settings

| Cookie | Flags | Purpose |
|---|---|---|
| Supabase access token | `HttpOnly; Secure; SameSite=Lax; Path=/` | Short-lived session |
| Supabase refresh token | `HttpOnly; Secure; SameSite=Lax; Path=/api/auth` | Silent refresh |

Same-origin topology (ADR-002) means `SameSite=Lax` (or `Strict`) is sufficient — no cross-site cookie sending is ever required.

## Demo credential policy

Demo account passwords are intentionally public for evaluation purposes (read from `DEMO_PASSWORD` at seed time, never hardcoded in source except the README credential table added at submission). This is a documented, deliberate limitation of a public assessment demo — not a production posture.

## Web Quality Checklist (ADR-016)

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
