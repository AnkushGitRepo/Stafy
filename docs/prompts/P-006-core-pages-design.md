# P-006 — Core Pages Design: Employees, Attendance, Leave

> Paste Part A brand brief from `docs/prompts/P-002-brand-and-landing-design.md` first, then everything below. Attach these 3 new images plus the original 5 (all 8 total, so the tool has the full brand + pattern context).

Save as `docs/prompts/P-006-core-pages-design.md` before running.

---

## 0. Scope

This designs the three remaining core modules: **Employees**, **Attendance**, **Leave**. Dashboards and the app shell are already designed (P-004) — reuse that shell, nav, and every existing token/component exactly. Do not redesign the sidebar, topbar, or StatCard/StatusPill visual language here.

**Excluded from this pass, deliberately:** CSV/Excel export or Import buttons (cut for time, `ADR-024`), profile photos (avatars are initials only), salary/payroll/contract data, GPS/location fields, overtime, shift scheduling, an "Invited" account status (our only statuses are Active/Inactive), and any attendance-calendar view showing per-day status in a month grid for a *single employee's daily attendance* (that specific optional feature was also cut — the leave calendar in §4 is different and in scope). If you find yourself drawing any of these because a reference image has it, stop and don't.

---

## 1. Reference images — new ones, specific reading

| Ref | Take | Ignore |
|---|---|---|
| Attendance (tiimi) | Two-summary-card layout at the top (Present / Not Present) as the pattern for our attendance summary row; the search + date-range + advance-filter bar; the table row shape (avatar, name, ID, clock-in→duration→clock-out as one visual unit) | Overtime column, Picture column, Location column, Note column, "Away Summary" card, "Attendance Report" export button, dark top nav bar |
| Calendar (HRISELINK) | The **Requested / Balances / Calendar** tab pattern for the Leave page; the month calendar with small colored chip-per-day-per-type; the today-highlight ring on the current date | Emoji as icons (🤒🏖️), "Export CSV", the sidebar's unrelated modules (Payroll, Hiring, Finance), list/calendar view toggle icons' exact styling |
| Employee list (tiimi) | The status-counts line above the table (Active/Inactive counts); the column header sort affordance; the "..." row action menu; card-free flat table on white | ID format `#EMP01` (ours is `EMP-0001` per `DATABASE.md`), Contract/Manpower/Org Structure tabs, Import button, profile photos, "Invited" status, Transfer Employee, the yellow add-button styling (use our forest-800 primary instead) |

---

## 2. Shared list/table pattern (define once, reuse on all three pages)

- **Page header:** title, one-line description, primary action button top-right if the page has one (Employees: "Add employee"; Leave: "Apply for leave" for employee context, none for the approvals view; Attendance: no primary action, it's read-only).
- **Filter bar** directly under the header: search input (icon-left) + up to 3 filter dropdowns relevant to that page + a date-range picker where relevant. Never more than what's specified per page below — don't add filters "because the reference had a slot for one."
- **Table:** flat on `--color-surface`, header row on `--color-surface-2` with sort carets on sortable columns, row hover = subtle `--color-mint-50` tint, row height comfortable (not dense), avatar = initials circle (never a photo), status always a `StatusPill` using the fixed status-color mapping from the brand brief — never a bare colored dot with no label.
- **Row actions:** a trailing "⋯" menu for secondary actions (Edit, Deactivate, View), with the primary action as an inline button where there's only one primary thing to do per row (Approve on a leave-approvals row).
- **Detail drawer:** a single reusable right-side drawer component, used for both "view details" and "edit," that slides in without navigating away from the table (keeps filter/scroll state). It opens in read-only mode with an "Edit" button that switches the same drawer to editable fields, plus Save/Cancel. Don't build a separate full-page edit route for this pass.
- **Pagination:** footer row, "Page X of Y", Prev/Next, and a fixed page-size (don't design a page-size selector — keep it simple).
- **States:** every table needs loading (skeleton rows matching the real column widths), empty (a specific message per context, e.g. "No employees match these filters" vs. "No employees yet" — different empty states for filtered-empty vs. actually-empty), and populated.
- Mobile (<768px): tables become a stacked card-per-row list (label: value pairs), never a horizontally-scrolling table. Filters collapse into a single "Filters" button opening a bottom sheet.

---

## 3. Employees page

Route context: `/app/employees` (Admin only; Managers get a separate, simpler "My team" list — see §3.4).

### 3.1 Fields (exact set, per `docs/PRD.md` / the PDF — don't add or drop any)
Employee ID (`EMP-0001` format), Full Name, Email, Phone, Department, Designation, Manager, Joining Date, Employment Status (Active/Inactive).

### 3.2 Table columns
Name (with avatar + ID as secondary line under the name), Department, Designation, Manager, Joined, Status. Email/phone are **not** table columns (too wide) — they live in the detail drawer. Sortable: Name, Department, Joined.

### 3.3 Filter bar
Search (name/email/ID) · Department filter · Status filter (Active/Inactive/All) · "Add employee" primary button, top-right of the header, not in the filter bar itself.

### 3.4 Detail drawer (view → edit)
View mode shows all 9 fields plus a small "Direct reports" count if the person is a manager. Edit mode: every field editable except Employee ID (immutable) and Employment Status (that's a separate deliberate action, not a form field — see §3.5). Manager field is a searchable select restricted to active Managers/Admins (never allows selecting the employee themself). Validation errors show inline per field.

Add employee uses the exact same drawer in "create" mode (no ID field shown — it's generated), defaulting Employment Status to Active.

### 3.5 Activate/Deactivate
A distinct action (row menu item, and a button in the drawer's view mode) — not a toggle buried in the edit form, since it's a consequential action. Deactivating opens a small confirm dialog: "Deactivate Priya Shah? She won't be able to sign in, and her pending leave requests will be cancelled." (matches `BR-24`). If the person has active direct reports, the confirm dialog is replaced by a blocking message: "Reassign her direct reports before deactivating" (matches `BR-24`), with a list of those reports.

### 3.6 Manager's view: "My team"
A simpler, read-only version at a different route: same table pattern, columns Name/Designation/Status only, no filters beyond search, no Add/Edit/Deactivate actions, no drawer edit mode (view-only drawer). This gives managers visibility (PDF: "View team employees") without admin capability.

---

## 4. Attendance page

Route: `/app/attendance`. Content differs sharply by role — design both.

### 4.1 Admin / Manager view (all employees, or team-only for Manager)
- **Summary row:** 4 cards using our actual statuses — Present Today, Half Day, Absent, On Leave — each a count, not the tiimi reference's on-time/late/early breakdown (we don't track lateness, there's no shift concept).
- **Filter bar:** search (employee) · date picker (single day, defaulting to today — not a date range for this view, since the table shows one day at a time) · Department filter (Admin only, not shown for Manager) · Status filter.
- **Table:** Name, Check-in, Check-out, Hours worked (computed), Status (pill). No location, no photo, no note, no overtime.
- Date navigation: prev/next day arrows beside the date, like the tiimi reference's `< Monday, 15 October >` pattern — good pattern, reuse it.

### 4.2 Employee's own view
Different, simpler layout at the same route (role-based render): a compact **month view** — not a full calendar grid with drag/drop, just a row of day cells (reuse the WeekStrip visual language extended to a month) each colored by that day's status, with a legend. Below it, a plain list of the last 30 days: date, check-in, check-out, hours, status. No filters needed here — it's already scoped to one person.

---

## 5. Leave page

Route: `/app/leave`. Uses a **tab pattern** (reused from the Calendar reference): tabs differ by role.

### 5.1 Employee tabs: My requests · Balance · Calendar
- **My requests:** table of the employee's own requests — Dates, Type, Days, Status, submitted date. Row action: **Cancel**, shown only when `BR-13` allows it (pending anytime; approved only if start date is in the future) — disabled/hidden otherwise, not just non-functional. Clicking a row expands to show the full reason and, if rejected, the rejection reason.
- **Balance:** one card per leave type (Casual, Sick, Earned, Unpaid) showing quota, used, remaining — a simple meter/bar, not a gauge chart. Unpaid shows "No limit" instead of a bar.
- **Calendar:** month view (reuse the HRISELINK pattern: small colored chips per day, today ring-highlighted) showing only this employee's own approved/pending leave. No emoji — use the type as a colored chip with the type name as text, colored by our Leave status mapping (blue), with the type name as the label text (e.g. "Sick" chip), since type itself doesn't get a separate color system — only status does.
- **Apply for leave:** primary button, top-right of the header (not inside a tab) — opens a modal/drawer: leave type select, date range (with a same-day + half-session toggle for half-day, per `BR-05`), reason textarea, live balance check, live overlap warning if it would trigger `BR-02`.

### 5.2 Manager tabs: Approvals · Team calendar
- **Approvals:** queue of the manager's team's pending requests — Name, Dates, Type, Days, Reason (truncated, expandable). Row actions: **Approve** (primary) and **Reject** (secondary, opens an inline required-reason field before confirming — matches the Manager Dashboard's pattern from P-004, reuse it exactly, don't redesign it).
- **Team calendar:** same month-chip pattern as §5.1's Calendar, but showing all direct reports' approved leave overlaid (each person as a small avatar chip on their leave days, not colored by type — colored by status since everyone shown here is either pending or approved).

### 5.3 Admin tabs: All requests · Approvals · Calendar
- **All requests:** every request, filterable by Employee, Status, and Date range (per PDF §5's "HR/Admin: Filter by employee, status and date") — this is the one place a date-*range* filter belongs, unlike Attendance's single-day view.
- **Approvals:** identical pattern to Manager's, scoped to everyone rather than a team, since Admin can act on any request except their own (`BR-10`/ADR-009).
- **Calendar:** org-wide leave calendar, same visual pattern.

---

## 6. Responsive

Design at 1440, 1024, 768, 390 for all three pages including both role variants of Attendance and both/all role variants of Leave tabs. On mobile, tabs become a horizontally scrollable pill row (not a dropdown), and the Apply/Add primary buttons move to a fixed bottom bar or a floating action button — pick one and be consistent with how P-004 handled the mobile primary action, don't introduce a third pattern.

---

## 7. Motion

Keep it as calm as the dashboards (`docs/prompts/P-004-dashboard-design.md` §7 applies here too). New additions specific to these pages:
- Filter/search changes: table rows cross-fade (~150ms), never a jarring re-flow with no transition.
- Drawer open/close: slide + fade, ~250ms, `power2.inOut`, focus moves into the drawer on open and returns to the trigger on close.
- Tab switch (Leave page): content cross-fades, ~150ms, no layout jump — pre-measure or skeleton the incoming tab briefly if its content is async.
- Calendar day chips: no entrance animation needed (it's reference material people scan, not a moment to sell) — reserve motion for the reject-reason field expanding (height auto, ~200ms) and the approve success (row exits like the dashboard's approvals panel, reused exactly).
- Respect reduced motion throughout.

---

## 8. Self-review before delivering

Run Part A §A9, plus:
- [ ] No CSV/export/import button anywhere on these three pages
- [ ] No profile photos, no salary/payroll/contract content, no location field
- [ ] Attendance statuses are exactly Present/Half Day/Absent/Leave (+ Not checked in) everywhere, styled with the fixed status-color mapping
- [ ] Employee fields match the PDF's list exactly, no extras invented to fill table columns
- [ ] Manager and Admin see appropriately scoped data (team vs. everyone) — never design a screen where a manager could see another team's data
- [ ] Detail drawer, filter bar, and table row patterns are visually identical across all three pages — a person should recognize the pattern instantly on the second page

## 9. Deliverables

Same handoff format as previous prompts: component inventory (new: `DataTable`, `FilterBar`, `DetailDrawer`, `Tabs`, `CalendarMonth`, `ConfirmDialog` if not already built — name anything reused vs. new), states matrix, motion spec table, and a note on the mobile primary-action pattern chosen.

If any PDF requirement doesn't have an obvious place in this design (e.g., where exactly "filter by employee" lives on a given screen), ask rather than guessing a spot for it.
