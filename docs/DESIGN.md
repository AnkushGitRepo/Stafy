> Status: Draft — tokens TBD until P-002   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: docs/DECISIONS.md ADR-017, docs/PHASES.md P2

# Design system (skeleton)

Token **values** are `TBD — set in P-002 from landing reference`. Token **names** (CSS variables) are fixed now so code can reference them without churn later.

## Tokens

```css
:root {
  /* Color — TBD — set in P-002 from landing reference */
  --color-bg: TBD;
  --color-surface: TBD;
  --color-border: TBD;
  --color-text: TBD;
  --color-text-muted: TBD;
  --color-accent: TBD;
  --color-accent-contrast: TBD;
  --color-success: TBD;
  --color-warning: TBD;
  --color-danger: TBD;
  --color-info: TBD;
  --color-status-present: TBD;
  --color-status-half-day: TBD;
  --color-status-absent: TBD;
  --color-status-leave: TBD;
  --color-status-pending: TBD;
  --color-status-approved: TBD;
  --color-status-rejected: TBD;
  --color-status-cancelled: TBD;

  /* Typography — TBD */
  --font-display: TBD;
  --font-text: TBD;
  --font-size-xs: TBD;
  --font-size-sm: TBD;
  --font-size-base: TBD;
  --font-size-lg: TBD;
  --font-size-xl: TBD;
  --font-size-2xl: TBD;
  --font-size-3xl: TBD;

  /* Spacing (4px base) — TBD */
  --space-1: TBD; /* 4px */
  --space-2: TBD; /* 8px */
  --space-3: TBD; /* 12px */
  --space-4: TBD; /* 16px */
  --space-6: TBD; /* 24px */
  --space-8: TBD; /* 32px */

  /* Radius / shadow / z-index — TBD */
  --radius-sm: TBD;
  --radius-md: TBD;
  --radius-lg: TBD;
  --shadow-sm: TBD;
  --shadow-md: TBD;
  --z-dropdown: TBD;
  --z-modal: TBD;
  --z-toast: TBD;

  /* Breakpoints — TBD */
  --breakpoint-sm: TBD;
  --breakpoint-md: TBD;
  --breakpoint-lg: TBD;

  /* Motion — TBD */
  --duration-fast: TBD;   /* app micro-interactions, 150–350ms range */
  --duration-base: TBD;
  --ease-out-quint: TBD;
  --ease-standard: TBD;
}
```

## Layout

- **Public shell**: landing/login/privacy/terms — full-bleed hero, content max-width TBD.
- **App shell**: sidebar (desktop) / bottom nav or drawer (mobile), content max-width TBD.

## Component inventory (to be built)

Button, Input, Select, DateRangePicker, Textarea, Badge/StatusPill, DataTable (sortable, paginated, empty/loading/error states), StatCard (animated), Modal/Drawer, Toast, Avatar (initials only, no photos), EmptyState, Skeleton, PageHeader, FilterBar, ConfirmDialog.

## States contract

Every data view defines: **loading** (skeleton matching final layout, not spinner-only), **empty** (explains why + the one next action), **error** (plain message + retry), **success feedback** (toast).

## "Alive, not busy" rule (ADR-017)

Every app screen has at least one element driven by real, changing data: a live IST clock and elapsed-time counter after check-in, stat cards that count up to real values, a this-week attendance strip, a leave balance ring, team "in today" avatars, a pending-approvals row exit animation on action. Nothing fake, randomized, or decorative-only.

## Motion rules

- **Landing**: GSAP timelines + ScrollTrigger, reveal-once, no scroll-jacking, no pinning longer than one viewport, hero sequence ≤1.2s.
- **App**: 150–350ms, transform/opacity only, `useGSAP` with scoped refs and automatic cleanup, `gsap.matchMedia()` honoring `prefers-reduced-motion` (reduced = instant or opacity-only).
- Never animate layout properties, never delay interaction, never stagger more than ~8 items.

## Anti-AI-slop rules

- No purple→blue gradients, glassmorphism everywhere, glowing blobs, or neon-on-dark by default.
- No emoji as icons. One icon set (lucide) at consistent stroke/size.
- No cards nested in cards. No card grid where a table or list is the honest structure.
- No pure `#000`/`#fff` greys. Neutrals are tinted toward the brand hue.
- No gray text on colored backgrounds. Contrast AA minimum.
- No generic copy ("Streamline your workflow", "Unlock the power of…", "Revolutionize"). Copy states concrete HRMS facts.
- No fabricated social proof: no fake company logos, testimonials, user counts, ratings, or "trusted by" claims.
- No lorem ipsum, no placeholder avatars of real-looking people, no stock photos of handshakes.
- No bouncy/elastic easing.
- No centered-everything layouts. Clear typographic hierarchy, max 2 font families.
- No more than one primary button per view.
- No spinner-only loading for layout content — skeletons matching final layout.

## Accessibility

Focus-visible styles, keyboard paths for every action, `aria-live` for toasts and check-in result, labels on all inputs, tables with proper headers, 44px touch targets.

## Screen registry

| Screen | Route | Roles | Design prompt ID | Impl prompt ID | Status |
|---|---|---|---|---|---|
| Landing | `/` | public | TBD | TBD | not started |
| Login | `/login` | public | TBD | TBD | not started |
| Privacy | `/privacy` | public | TBD | TBD | not started |
| Terms | `/terms` | public | TBD | TBD | not started |
| 404 | `*` | public | TBD | TBD | placeholder exists (P0) |
| App Shell | `/app` | any | TBD | TBD | not started |
| Dashboard (admin/manager/employee variants) | `/app` | any | TBD | TBD | not started |
| Employees list | `/app/employees` | admin | TBD | TBD | not started |
| Employee detail/edit | `/app/employees/:id` | admin | TBD | TBD | not started |
| Add employee | `/app/employees/new` | admin | TBD | TBD | not started |
| My profile | `/app/profile` | any | TBD | TBD | not started |
| Attendance | `/app/attendance` | any | TBD | TBD | not started |
| Leave (my) | `/app/leave` | any | TBD | TBD | not started |
| Apply leave | `/app/leave/new` | any | TBD | TBD | not started |
| Approvals | `/app/approvals` | manager, admin | TBD | TBD | not started |
| Audit log | `/app/audit` | admin | TBD | TBD | not started |
