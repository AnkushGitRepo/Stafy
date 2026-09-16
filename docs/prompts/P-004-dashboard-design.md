# P-004 — Dashboard Pages Design (App Shell + 3 Role Dashboards)

> Paste Part A brand brief from `docs/prompts/P-002-brand-and-landing-design.md` first, then everything below. Attach the same 5 reference images.

Save this file as `docs/prompts/P-004-dashboard-design.md` before running.

---

## 0. What this is, and what it is NOT

This designs the **logged-in app shell** and its **three dashboard home screens** — the first thing each role sees after signing in. It is a working tool, not a marketing page: no scroll storytelling, no big hero moment, calm and fast.

**Not in scope here** (they get their own prompts later): the Employees list/detail, Attendance history, Leave apply/approvals, Audit log pages. If a dashboard needs to *link to* one of those, design the link/button, not the destination page. Don't design a full employee table or leave form here even if a reference image shows one on its "dashboard" — that content belongs to other pages in this product.

A rough mock version of these three dashboards already exists in code with placeholder styling. Treat this as the real design that replaces it — don't be anchored by what's already there.

---

## 1. Reference images — dashboard-specific reading

| Ref | Take for this task | Ignore |
|---|---|---|
| 1 (Offsitee, hero screenshot only) | Card corner-radius restraint, the small "avg working hours"-style line chart treatment | Everything else — it's a marketing page, not an app |
| 2 (Fortheye) | Big-number + colored-dot + label as the stat pattern; check-in button placed prominently next to a live time; the leave summary card with date-range chips | Blue theme, weather, CC points, tasks/performance |
| 3 (Awe) | Sidebar section grouping (a "General"-style label above nav groups); the day-row of circular status markers as inspiration for our WeekStrip; calm data density | Blue theme, 3D avatars, overtime/breaks |
| 4 (Samify) | Solid-brand-color sidebar with a darker active-item pill; collapsed icon rail at the same width ratio; user menu + sign-out confirmation as a real pattern to reuse | Indigo color |
| 5 (Remunix) | Three tinted stat cards in a row as one valid stat-card treatment; how the sidebar and content collapse to a mobile single column | Purple/black theme, photos, salary, "Upgrade Pro" |

---

## 2. App shell (shared by all three roles)

- **Desktop (≥1024px):** left sidebar, forest-900 background, fixed width ~248px, collapsible to a 64px icon rail (icon rail per ref 4). Sections: top = Stafy mark; nav list; bottom = user menu (initials avatar, name, role label, chevron) opening a small menu with "My profile" and "Sign out" (sign-out shows a confirm dialog per ref 4's pattern — plain text, not a scare color, since it's a routine action).
- Nav items differ by role. Every item **exists** for every role it applies to (per the PDF permission table); items not yet built go to the shared "coming soon" empty state already wired up in code — this prompt only needs the nav visual, not new destinations.
  - **Admin:** Dashboard, Employees, Attendance, Leave, Approvals, Audit Log
  - **Manager:** Dashboard, My Team, Attendance, Leave, Approvals
  - **Employee:** Dashboard, Attendance, Leave, My Profile
- Active item: filled pill in canopy-600 on forest-900, not just a text color change (needs to survive at a glance).
- **Topbar:** page title (left), live IST clock with date (center or right — your call, justify it), notifications bell is **out of scope, do not add it** (not in PDF scope).
- **Tablet (768–1023px):** sidebar becomes the icon rail permanently (no hover-expand); labels appear in a slide-out drawer triggered by a menu button in the topbar.
- **Mobile (<768px):** sidebar becomes a bottom tab bar (max 5 items — for admin's 6 items, put the 5th+ under a "More" tab) OR a drawer opened from a topbar menu button — pick one, be consistent across all three roles, and justify the choice in your design plan.
- Every nav pattern needs visible keyboard focus and works with arrow/Tab navigation; the sidebar is a `nav` landmark with `aria-current="page"` on the active item.

## 3. Shared dashboard content rules

- **Layout:** a stat-card row at the top (use the ref 5 "three tinted cards" pattern, extended to however many metrics each role has — don't force a fixed column count that creates awkward wrapping), then one or two supporting panels below in a simple grid. No bento variety here — dashboards read left-to-right, top-to-bottom, predictably.
- **"Alive, not busy" (still applies, quieter than landing):** stat numbers count up to their value once on load (short, ~500ms, not a show). The IST clock ticks. That's enough — a dashboard people check 3 times a day should not perform for them every time.
- **States:** every panel needs its loading (skeleton shaped like itself), empty (e.g., "No pending approvals right now" with a calm icon, not a sad illustration), and populated state. Design all three for at least the two data-driven panels per role.
- **One primary action per dashboard:** Admin → none needed (dashboard is read-only, "Add employee" lives on the Employees page, not here) or at most a single "Add employee" button if you think it earns its place — justify either choice. Manager → primary action is nothing on the stat row, but each approval-queue row has an inline Approve (primary) / Reject (secondary) pair, never a page-level competing CTA. Employee → **Check in / Check out** is the one primary action, prominent, near the clock.
- No fabricated notifications, activity, or numbers beyond the metrics specified below and directly-derived supporting content (e.g., a list of the same leave requests the pending count refers to, not invented ones).

## 4. Admin (HR) Dashboard

**Metrics (exact set, no more, no fewer):** Total Employees, Active Employees, Present Today, Employees on Leave, Pending Leave Requests.

Supporting panel(s) — pick what earns space, don't force both if one is enough:
- A short **recent activity** list (3–5 lines, audit-style: "Priya Shah deactivated Karan Joshi · 10:14 AM" — real layout, not a middle-dot string; use a clear separator like time right-aligned).
- A **pending leave requests** preview (2–3 rows: name, dates, type, a "View all" link to the Leave/Approvals page — don't build approve/reject controls here, that's the Approvals page's job).

## 5. Manager Dashboard

**Metrics (exact set):** Total Team Members, Present Today, Team Members on Leave, Pending Approvals.

Supporting panel: the manager's **team list**, compact — avatar (initials), name, today's status as a StatusPill (reuse the fixed status color mapping from the brand brief), nothing else per row (no salary, no title-heavy metadata). If Pending Approvals > 0, an approvals panel sits above or beside the team list with inline Approve/Reject per row (this is the one place approve/reject appears on a dashboard, since managers act fast from here) — each action needs a confirm-free but clearly reversible feel (reject requires a reason, so clicking Reject opens a small inline reason field, not a full-page navigation).

## 6. Employee Dashboard

**Metrics (exact set):** Today's attendance status, Total leave requests, Pending, Approved/Rejected, Recent attendance.

- The **Check in/Check out control** is the visual anchor of this screen — near the top, with the live clock, and an elapsed-time readout once checked in (e.g., "Checked in at 9:02 AM · 3h 12m"). Button becomes "Check out" after check-in, and shows a disabled/explained state on weekends or during approved full-day leave ("You're on approved leave today").
- **Recent attendance** is a short list (last 5 entries: date, status pill, times if present) — not a calendar grid; that richer view belongs to the full Attendance page.
- Leave counts (Total/Pending/Approved+Rejected) can sit as a compact 3-up stat cluster or a single card with three numbers — your call, but keep it visually lighter than the top stat row since it's secondary to check-in.

## 7. Motion (app-level, not landing-level)

Follow Part A §A7's app-motion rules exactly: 150–350ms, transform/opacity only, no bounce. Specifically:
- Stat numbers: single count-up tween on first render, `power2.out`, ~500ms, never re-triggers on every re-render (guard so it only plays once per mount).
- Sidebar active-item pill: sliding/morphing to the new position on nav change (`power2.inOut`, ~250ms) rather than an instant swap.
- Approve/Reject row exit (manager panel): row animates out (height + opacity, ~250ms) after action, then the list reflows.
- Check-in button state change: a small satisfying transform (scale 0.98→1, ~200ms) plus the elapsed timer starting — not a full-screen celebration.
- Respect `prefers-reduced-motion` throughout (instant state, no count-up tween — show the final number immediately).

## 8. Responsive & accessibility deliverables

Design at 1440, 1024, 768, and 390 for all three dashboards plus the shell states (expanded sidebar, collapsed rail, mobile nav). Confirm AA contrast on every StatusPill combination actually used. Every icon-only control (collapse toggle, user-menu chevron) has an accessible label. Live regions announce check-in/check-out confirmation.

## 9. Self-review before delivering

Run Part A §A9 in full, plus:
- [ ] No page here duplicates content that belongs to Employees/Attendance/Leave/Audit pages
- [ ] Every number shown maps to a named metric in `docs/PRD.md` — nothing invented
- [ ] Exactly one primary action per dashboard, as reasoned in §3
- [ ] Sidebar/nav pattern is identical in structure across all three roles (only item list differs)
- [ ] Loading and empty states designed, not just the happy path
- [ ] Motion is calm — nothing here should feel like the landing page

## 10. Deliverables

Same handoff format as P-002: component inventory used (new components beyond what's in `docs/DESIGN.md` need to be named and justified), states matrix per panel, motion spec table (trigger/target/duration/ease/reduced-motion), and a short note on the mobile nav decision (bottom tabs vs. drawer) and why.

If anything here is ambiguous or you'd need a metric/content decision I haven't specified, ask before designing — don't invent HR data or features to fill a panel.
