# P-005 — Implement Dashboard Design (from zip export)

> Paste into Claude Code, Plan Mode. Save this file first at `docs/prompts/P-005-dashboard-implementation.md`.
> Before running: put the zip Ankush provides at `design/imports/stafy-dashboards.zip` in the repo. Do not commit it yet — see §6.

---

## 0. What's different from the landing import

Landing and brand assets came in through the live `claude_design` MCP link. **This one is a static zip export**, so that tool doesn't apply here. Unzip it and treat its HTML/CSS/JS/assets as a **reference to port**, not code to paste in — it has no React, no Tailwind, no `useGSAP`, and almost certainly hardcodes colors/fonts as raw values instead of our tokens. Every visual decision in it should still trace back to `docs/DESIGN.md`; if the export disagrees with an existing token (a color, a spacing value, a radius), the token wins unless Ankush says otherwise — flag the mismatch, don't silently adopt the export's value.

This design **replaces the placeholder dashboard UI built in P-003** (App Shell, `AdminDashboardPage`, `ManagerDashboardPage`, `EmployeeDashboardPage`, and their supporting components). It does **not** touch `lib/api.js`, `mocks/*`, `authContext.jsx`, or the sign-in/activation pages — those stay exactly as they are. This is a presentation-layer swap on top of an unchanged data/auth layer, so if backend work has landed in parallel, wiring real data still happens as its own step, separate from this one.

---

## 1. Unzip and inventory — do this before writing any component

```
mkdir -p design/imports/dashboards
unzip -o design/imports/stafy-dashboards.zip -d design/imports/dashboards
```
List the full resulting file tree and report it. Open and skim every `.dc.html` / `.html` file's structure (sections, class names, any embedded `support.js`) before mapping anything.

Map what you find to these five targets, using `docs/prompts/P-004-dashboard-design.md` §2–§6 as the spec of what *should* be there:
1. **App shell** — sidebar/nav, topbar, collapse/rail states, mobile nav pattern, user menu + sign-out confirm.
2. **Admin dashboard**
3. **Manager dashboard**
4. **Employee dashboard**
5. Any shared components used across more than one of the above (StatCard, WeekStrip/StatusPill, approvals row, team-list row, recent-activity row).

If the export's file names or structure don't make this mapping obvious, or a screen/breakpoint from P-004 seems to be missing from the zip, **stop and ask** rather than guessing or inventing the missing piece yourself.

---

## 2. Port into the existing architecture

Follow `docs/ARCHITECTURE.md` and the folder layout already established in P-003:
```
client/src/
├─ components/ui/        # extend, don't fork: StatCard, StatusPill/Badge, Skeleton, EmptyState, etc.
├─ features/dashboard/
│  ├─ pages/AdminDashboardPage.jsx / ManagerDashboardPage.jsx / EmployeeDashboardPage.jsx
│  └─ components/        # WeekStrip, ApprovalsQueue, TeamList, RecentActivityList, CheckInControl, etc.
└─ features/app-shell/    # new: Sidebar, MobileNav, Topbar, UserMenu, SignOutConfirmDialog
```
- Rewrite every visual as React + the existing Tailwind/token setup from `client/src/styles/tokens.css`. **No inline raw hex, no ad hoc pixel values that duplicate an existing spacing token.** If the export uses a value with no matching token (e.g., a one-off shadow or an odd breakpoint), name it and ask before adding it to the token system — one-off values don't get silently baked into components.
- Reuse existing components (`StatCard`, `StatusPill`, `Skeleton`, `EmptyState`, `PageHeader`, etc.) from P-003 rather than creating parallel versions. If the export's version of a component is meaningfully different (e.g., a StatCard with a trend indicator we don't have), extend the existing component with a new prop rather than forking a second `StatCard2`.
- Keep the exact metric sets from `docs/PRD.md` per role (Admin: 5 metrics; Manager: 4; Employee: 5) — the export should match, but if it shows something extra or missing, `docs/PRD.md` is the source of truth. Flag any mismatch instead of quietly reconciling it either way.
- Nav items and their "coming soon" routing (from P-003 §6) stay as-is; only their visual chrome changes.

---

## 3. What the zip almost certainly won't include — build these yourself

Design exports usually show only the happy/populated path. Per `docs/DESIGN.md`'s states contract and `docs/prompts/P-004-dashboard-design.md` §3, you still need to build, matching the export's visual language:
- **Loading** skeletons shaped like each populated panel (not a generic spinner).
- **Empty** states for: zero pending approvals, zero recent activity, zero recent attendance, an employee with no leave requests yet.
- Any hover/focus states the static export can't show (keyboard focus rings, `aria-current` on the active nav item).

---

## 4. Motion

Port timing/easing intent from the export's `support.js` if present, but the actual implementation follows `docs/prompts/P-004-dashboard-design.md` §7 exactly: stat count-up plays once per mount (guard against re-triggering on re-render), sidebar active-pill transition on nav change, approve/reject row exit animation, check-in button micro-transform + elapsed timer. All via `useGSAP` with cleanup, honoring `prefers-reduced-motion` per the existing landing pattern — reuse the same `matchMedia` helper if one already exists from the landing build rather than writing a second one.

---

## 5. Definition of done

- `npm run lint` and `npm run build` pass.
- Manual check at 1440 / 1024 / 768 / 390 for: app shell (expanded sidebar, collapsed rail, mobile nav), and all 3 dashboards in loading, empty, and populated states.
- No raw hex/px values outside `tokens.css`; run a quick grep for hardcoded `#` colors in the new/changed files and justify or fix any hit.
- `lib/api.js`, `mocks/*`, and auth pages are unchanged (diff them to confirm).
- `docs/DESIGN.md` screen registry: mark App Shell + 3 dashboards as "Implemented (mock data)".
- Update `docs/CONTEXT.md`, append a `docs/AI_DEVELOPMENT.md` entry for this implementation pass (What I accepted/changed/rejected = `TO BE FILLED BY ANKUSH`), update `CHANGELOG.md`. If any hardcoded-value/token mismatch was found and resolved, log it in `docs/AI_CODE_REVIEW.md` — that's a real, loggable defect-and-fix, not a fabricated one.
- Commit in logical chunks (shell → admin → manager → employee), conventional messages.

## 6. Cleanup

`design/imports/` goes in `.gitignore` — it's a working reference, not a deliverable. Copy only the final SVG/icon/image assets actually used into `client/src/assets/`, with real filenames, before removing the raw export from tracking.

---

Reply with: the file tree found in the zip, the mapping you made (§1), what you built for missing states (§3), any token mismatches found (§2/§6), and any `QUESTION [Q-###]`.
