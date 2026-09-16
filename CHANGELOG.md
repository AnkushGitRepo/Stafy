# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [P0] - 2026-09-15

### Added
- Full documentation system under `docs/` (index, context, PRD, planning, architecture, security, database design, business rules, testing strategy, phases, decisions log with ADR-001…024, design system skeleton, AI development/review logs, prompt archive).
- Claude Code configuration: `AGENTS.md`, `CLAUDE.md`, `.claude/agents/*`, `.claude/skills/*`, `.claude/settings.json`.
- Monorepo scaffold: `client/` (Vite React shell), `server/` (Express skeleton with `/api/health`), `api/index.js`, `supabase/migrations/` (empty), CI workflow.
- Project rebranded from working title "PeopleOps" to **Stafy** (ADR-018).

## [P2-design] - 2026-09-15

### Added
- Brand identity and landing page design (ADR-025): real palette, typography (Bricolage Grotesque + Hanken Grotesk), logo/favicon SVGs, a 10-section interactive landing prototype (GSAP + ScrollTrigger + Flip), and a 9-item motion spec table.
- `docs/DESIGN.md` tokens filled with real values (previously all `TBD`); zero `TBD` remaining in the token block.
- `docs/prompts/P-002-brand-and-landing-design.md` and `docs/prompts/P-003-landing-auth-dummy-dashboard.md` saved.

### Changed
- Two Claude Design canvases (Brand Assets, Landing) published, then replaced with the real deliverable the owner provided after an initial from-scratch placeholder pass.

## [P2-build] - 2026-09-15

### Added
- Landing page ported to React end to end: header, hero (interactive check-in/approve/replay + live IST clock), role switcher, product bento, rules, approvals flow, security, demo, FAQ, footer — full GSAP/ScrollTrigger/Flip motion, `prefers-reduced-motion` honored throughout.
- `/login` and `/activate` (account-activation flow, ADR-026 — no public sign-up) against a mock auth layer (`client/src/lib/api.js` `USE_MOCKS`, `client/src/mocks/*`).
- App shell with role-filtered navigation, and three real dashboards (admin/manager/employee) on mock data via TanStack Query.
- Real Privacy and Terms pages; on-brand custom 404.
- Reusable UI atoms: `Button`, `Input`, `StatusPill`, `StatCard` (GSAP count-up), `WeekStrip`, `Skeleton`, `EmptyState`, `PageHeader`.
- Route-level code-splitting (`React.lazy`) and non-render-blocking Google Fonts loading, bringing the landing page's Lighthouse Performance score from 81 to 93 (Accessibility 97, Best Practices 100, SEO 100).

### Fixed
- `window.gsap`/`window.ScrollTrigger`/`window.Flip` references left over from the original CDN-based design source, which silently no-opped against the app's npm-imported GSAP modules (AICR-002).

## [P2-dashboards] - 2026-09-16

### Added
- Real dashboard design (P-004/P-005) ported into React, replacing P-003's placeholder app shell and dashboard visuals: `features/app-shell/` (`Sidebar`, `MobileNav`, `Drawer`, `Topbar`, `UserMenu`, `SignOutConfirmDialog`) with a desktop expanded/collapsible-rail sidebar, permanent tablet rail + drawer, and mobile bottom-tab bar (with a "More" overflow sheet for Admin's 6th nav item), all GSAP-driven active-pill/motion honoring `prefers-reduced-motion`.
- Admin dashboard: 5 tinted stat cards + Recent activity list. Manager dashboard: 4 tinted stat cards + interactive Approve/Reject queue (inline rejection-reason gate, GSAP row-exit) + Team list. Employee dashboard: dark check-in/check-out hero card (live IST clock, elapsed timer, real-weekend disable) + 3-up leave-request cluster + Recent attendance list.
- New shared dashboard components: `RecentActivityList`, `ApprovalsQueue`, `TeamList`, `CheckInCard`, `RecentAttendanceList`. `StatCard` extended with an additive `tint` variant.
- `/app/team` and `/app/profile` routes (previously missing nav destinations for Manager/Employee — see AICR-003).

### Fixed
- Manager's "My Team" and Employee's "My Profile" nav items, specified in the already-approved `docs/prompts/P-004-dashboard-design.md` but never wired up in P-003 (AICR-003).

### Changed
- Additive `approvals` array on `MANAGER_DASHBOARD` in `client/src/mocks/dashboardData.js` (real request rows behind the existing `pending` metric, so the Approve/Reject panel isn't backed by fabricated data).
