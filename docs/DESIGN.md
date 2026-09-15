> Status: Approved   ·   Last updated: 2026-09-15 22:45 IST   ·   Owner: Ankush
> Related: docs/DECISIONS.md ADR-017, ADR-025, docs/PHASES.md P2, docs/prompts/P-002-brand-and-landing-design.md

# Design system

Tokens below are the real, locked values from the P-002 Claude Design deliverable (ADR-025) — a full interactive landing prototype and brand-asset sheet, not a placeholder sketch. Token **names** were fixed in P0 so code can reference them without churn; the earlier placeholder hex values from that first pass have been replaced with the real ones below.

## Tokens

```css
:root {
  /* Color */
  --color-bg: #F6F8F6;
  --color-surface: #FFFFFF;
  --color-surface-2: #EFF3F0;         /* recessed surface: chips, inputs, table headers */
  --color-border: #DDE5E0;
  --color-text: #0F1C17;
  --color-text-muted: #43534C;        /* body-adjacent muted text */
  --color-text-muted-2: #5F6F68;      /* meta/caption text, one step lighter */
  --color-accent: #1E7A55;            /* canopy-600 — links, icons, secondary text action */
  --color-accent-contrast: #FFFFFF;
  --color-primary: #123D2F;           /* forest-800 — primary button, active nav pill */
  --color-primary-hover: #185240;
  --color-dark: #0C2A20;              /* forest-900 — footer, dark panels (manager queue, dashboards tile) */
  --color-dark-border: #1B4636;
  --color-dark-border-2: #2C5A48;     /* dashed borders / dividers on dark */
  --color-on-dark-muted: #A8CBBB;
  --color-on-dark-faint: #7FA896;
  --color-success: #54B487;           /* canopy-400 — present dot, success accents */
  --color-success-chip-bg: #D9F2E4;   /* mint-100 */
  --color-success-chip-hairline: #BEE6D1;
  --color-warning: #E9A23B;
  --color-warning-chip-bg: #FCEFD8;
  --color-warning-chip-text: #8A5300;
  --color-danger: #B42318;
  --color-danger-chip-bg: #FDE7E5;
  --color-info: #2F5FB3;
  --color-info-chip-bg: #E6EEFB;
  --color-neutral-dot: #5B6661;       /* weekend / inactive / no-quota dot and text */
  --color-neutral-chip-bg: #EDF0EE;

  --color-status-present: #54B487;
  --color-status-half-day: #E9A23B;
  --color-status-absent: #B42318;
  --color-status-leave: #2F5FB3;
  --color-status-pending: #E9A23B;
  --color-status-approved: #1E7A55;
  --color-status-rejected: #B42318;
  --color-status-cancelled: #5B6661;

  /* Typography */
  --font-display: 'Bricolage Grotesque', system-ui, sans-serif;   /* weights 600/700, letter-spacing -0.02em to -0.03em on headings */
  --font-text: 'Hanken Grotesk', system-ui, sans-serif;           /* weights 400/500/600 */
  --font-size-xs: 0.8125rem;  /* 13px — meta, captions, filter chips */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5625rem; /* 25px — bento/subsection H3 */
  --font-size-3xl: 1.953rem;  /* 31px — metric numbers, HR counters */
  /* Landing hero/section H1/H2 use fluid clamp() sizes, not fixed tokens:
     H1 clamp(2.441rem,6.2vw,4.5rem); H2 clamp(1.953rem,4vw,3.052rem). */
  font-variant-numeric: tabular-nums; /* applied to clocks, dates, counts, table numerals — both faces support it */

  /* Spacing (4px base) */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */

  /* Radius / shadow / z-index */
  --radius-sm: 6px;    /* filter chips */
  --radius-md: 10px;   /* buttons, inputs */
  --radius-lg: 16px;   /* cards, panels */
  --radius-full: 999px; /* pills, dots, avatars */
  --shadow-sm: 0 1px 2px rgba(12, 42, 32, 0.06);
  --shadow-md: 0 8px 24px rgba(12, 42, 32, 0.08);
  --z-dropdown: 100;
  --z-modal: 200;
  --z-toast: 300;

  /* Breakpoints */
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;  /* bento grid switches to multi-column */
  --breakpoint-lg: 1024px; /* desktop nav appears */

  /* Motion (app baseline — see Motion spec table below for landing's actual per-interaction timings) */
  --duration-fast: 250ms;
  --duration-base: 400ms;
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-standard: ease-in-out;
}
```

Shadows are tinted from the dark brand color (`rgba(12, 42, 32, …)`), not pure black — consistent with the "no pure `#000`/`#fff`" rule extending to shadow color. `--color-surface` is genuine pure white in the real design (cards on the tinted `--color-bg`) — accepted as delivered rather than overridden, since it reads as intentional elevation contrast, not neutral-scale laziness.

## Layout

- **Public shell**: landing/login/privacy/terms — full-bleed sections, content max-width 1200px, centered, 24px side padding.
- **App shell**: sidebar (desktop) / bottom nav or drawer (mobile), content max-width 1200px (matches landing for visual consistency).

## Brand assets

Palette/type/logo/landing-handoff reference: [Stafy Brand Assets](https://claude.ai/code/artifact/e52a7b85-d0a4-42b2-a2f3-0866c8be2356) (Claude Design canvas). Logo: five vertical rounded-end capsules of ascending height (an "S" rhythm read as a working week), in `stafy-logo-light.svg` / `stafy-logo-dark.svg` (189×36 wordmark lockups) and `stafy-mark.svg` / `favicon.svg` (standalone capsule mark). Wordmark type is Bricolage Grotesque 700, tracking −2%. Clear space equals one capsule width.

## Landing page design

Full interactive design (real GSAP/ScrollTrigger/Flip prototype, not a static mockup): [Stafy Landing](https://claude.ai/code/artifact/b612f28c-00a6-482b-a2c7-30e27125027a) (Claude Design canvas). Section IDs, in order, for 1:1 implementation (these are the actual DOM anchor ids used):

| # | id | Name | Note |
|---|---|---|---|
| 1 | `#top` | Header | Transparent over hero, solid after 24px scroll, hides on scroll-down |
| 2 | `#hero` | Hero | Headline, sub, primary action, live product composition (interactive: check-in, role's leave card, manager approve) |
| 3 | `#roles` | One system, three views | Tablist (HR/Admin, Manager, Employee), dashboard preview with Flip-animated metrics, Can/Cannot lists |
| 4 | `#product` | Product | Six-panel bento, 12-col desktop grid (directory, attendance month grid, leave balance, team approvals, dashboards, audit log) |
| 5 | `#rules` | Rules, not reminders | Six attempt/response rows, each citing a real BR behavior |
| 6 | `#approvals` | How approvals work | Four steps on a scroll-scrubbed path (no pin) |
| 7 | `#security` | Security | Three-layer diagram (Browser / API checks / Database constraints) + four plain facts |
| 8 | `#demo` | Try it | Three role panels ("things to try"), one primary button |
| 9 | `#faq` | FAQ | Accordion, one panel open at a time |
| 10 | `#footer` | Closing band and footer | Forest-900 band, link columns, capsule-row watermark |

Copy is grounded in real functionality, not marketing filler:
- **RolesSection**: sample personas are UI *labels*, not testimonials — "Priya Shah" (HR/Admin), "Arjun Mehta" (Manager), "Riya Sen" (Employee, hero), "Karan Joshi" (Employee, inactive sample row), "Aarav Sharma" / "Neha Kulkarni" (sample approval-queue rows).
- **RulesSection**: six attempt→response pairs paraphrasing real business rules (double check-in → BR-14, check-out before check-in → BR-15, leave overlap → BR-02, end-before-start date → BR-01, check-in on approved leave → BR-17, approving another team's or your own request → BR-10/BR-11). Links out to `docs/BUSINESS_RULES.md` via `{{REPO_URL}}/blob/main/docs/BUSINESS_RULES.md`.
- **SecuritySection**: three real enforcement layers (Browser: UX-only, never trusted; API: role/team check every request, out-of-scope returns not-found — ADR-008; Database: constraints block duplicate check-ins and overlapping leave even if a request slips through — ADR-005) plus four plain facts (`HttpOnly` cookies, no DB keys shipped to the browser, Supabase Auth handles passwords, deactivation takes effect on the next request — ADR-004).
- **FAQ**: six real questions, including "Who approves a manager's leave?" (ADR-009 routing), "Can I cancel leave after it's approved?" (BR-13b), "Is this a production product?" (honest "no, assessment project" answer).

One primary CTA ("Try the live demo") repeated in the header, hero, and the closing band before the footer — never a second, competing CTA style.

### Component inventory

Merged list: landing-specific components (from the Claude Design handoff) plus the app-only components P0 already scoped (needed for employees/attendance/leave/dashboard screens that the landing page doesn't cover).

| Component | Note |
|---|---|
| Status pill | Dot + text label; five status→color mappings (present/half-day/absent/leave/weekend), extends to pending/approved/rejected/cancelled for app use |
| Week strip | Five rounded capsules, `aria-label`led per day |
| Primary button | `--color-primary` bg, radius 10, min-height 48 (44 in the compact header) |
| Text link action | `--color-accent` (canopy-600) |
| Metric | Display-weight number + status dot + label, `tabular-nums` |
| Segmented tablist | Pill track, `role="tablist"`, arrow-key navigation (used for the role switcher) |
| Data table | `--color-surface-2` header row, hairline row dividers |
| Filter chip | Radius 6, `--color-surface-2` background |
| Month grid day pill | Number + status dot, used in the attendance month view |
| Balance meter | Track + fill bar (leave balance) |
| Approval queue row | Initials avatar, name/detail, status pill, exit animation on decide |
| Inline alert | Status-tinted background + icon + message (used in RulesSection responses) |
| Step item | Number, title, body, 2px top rule (approvals flow) |
| Accordion item | Button + `aria-expanded` panel (FAQ) |
| Initials avatar | `--color-success-chip-bg` on light, `--color-success` on dark |
| Audit entry | Time column + description |
| Input, Select, DateRangePicker, Textarea | App forms (employees/leave), not shown on landing |
| Modal/Drawer, Toast, EmptyState, Skeleton, PageHeader, ConfirmDialog | App shell chrome, not shown on landing |

## States contract

Every data view defines: **loading** (skeleton matching final layout, not spinner-only), **empty** (explains why + the one next action), **error** (plain message + retry), **success feedback** (toast).

## "Alive, not busy" rule (ADR-017)

Every app screen has at least one element driven by real, changing data: a live IST clock and elapsed-time counter after check-in, stat cards that count up to real values, a this-week attendance strip, a leave balance ring, team "in today" avatars, a pending-approvals row exit animation on action. Nothing fake, randomized, or decorative-only. The landing hero demonstrates this pattern directly: a real ticking IST clock, a check-in button that flips local state, and a manager-approval row that exits on decide.

## Motion rules

- **Landing**: GSAP timelines + ScrollTrigger (+ Flip for the role-switcher metrics), reveal-once, no scroll-jacking, the approvals-path scrub is the only scroll-linked (non-pinned) animation and stays within one section. Hero load sequence ≤6s total as an ambient "story" (not a blocking intro — the page is fully usable throughout), with the actual first-paint content visible immediately; a "Replay" control lets a visitor re-trigger it.
- **App**: 150–450ms, transform/opacity only, `useGSAP` with scoped refs and automatic cleanup, `gsap.matchMedia()` honoring `prefers-reduced-motion` (reduced = instant final state, no story, no transforms — see the motion spec table's "Reduced motion" column for the exact per-case fallback).
- Never animate layout properties (the header hide/show animates `transform: translateY`, not `height`), never delay interaction, never stagger more than ~8 items.
- `SplitText` (a paid GSAP plugin) is deliberately avoided: the hero headline is authored as three separately-clipped lines instead, achieving the same line-by-line reveal with the free GSAP core + ScrollTrigger + Flip only.

### Motion spec table

Reproduced from the Claude Design handoff — authoritative for the GSAP port in P-003.

| ID | Trigger | Targets | Properties | Duration / ease | Reduced motion |
|---|---|---|---|---|---|
| M1 | Load, after fonts ready | Hero headline lines, sub, actions, product frame; then state beats (check-in, week strip, counters, approve, row exit) | Clip-masked `yPercent`, opacity, y, scale | Lines stagger 0.08s (0.6s each); frame 0.8s; full story ≤6s; `power3.out` | Final state set instantly, no story |
| M2 | After M1 | IST clock, elapsed timer | Text only; paused when `document.hidden` | 1s interval | Clock renders, timer static |
| M3 | Scroll | Header background, header position | Background opacity; header `y` (hide on scroll-down past 120px) | 0.25s `power2.inOut` | Always visible, no transform |
| M4 | Role tab change | Role metric tiles | `Flip.from` on metric layout | 0.35s `power2.inOut` | Instant swap |
| M5 | Month grid in view; approvals button press | Month-grid status dots; approval queue row | Scale-in with stagger; row opacity + x exit | 0.3s stagger 0.01s; 0.3s | Static; row removed without tween |
| M6 | ScrollTrigger, once per row | Rule "attempt" text, "response" chip | Opacity + y, then opacity + x:12 | 0.35s / 0.4s `power3.out` | Static |
| M7 | ScrollTrigger scrub in section, no pin | Approvals path stroke, status card | `strokeDashoffset`; card `x`; pill state flips at 62% progress | `scrub: 0.5`, `ease: none` | Path fully drawn, card at step 4 |
| M8 | Accordion click | FAQ panel | `height` + `opacity` | 0.25s `power2.inOut` | Instant |
| M9 | ScrollTrigger, once | Footer capsule watermark | `yPercent` | 0.6s stagger 0.06s `power3.out` | Static |

Constraints satisfied: reveal-once per element, no scroll-jacking, no pinning, hero story ≤6s and non-blocking (page is interactive from first paint).

## Anti-AI-slop rules

- No purple→blue gradients, glassmorphism everywhere, glowing blobs, or neon-on-dark by default.
- No emoji as icons. One icon set (inline stroke SVG) at consistent stroke/size.
- No cards nested in cards. No card grid where a table or list is the honest structure.
- No pure `#000`/`#fff` greys used as the neutral *scale* (background/text/border). Neutrals are tinted toward the brand hue. (`--color-surface` white-on-tinted-bg is an accepted exception for card elevation — see Tokens note above.)
- No gray text on colored backgrounds. Contrast AA minimum.
- No generic copy ("Streamline your workflow", "Unlock the power of…", "Revolutionize"). Copy states concrete HRMS facts.
- No fabricated social proof: no fake company logos, testimonials, user counts, ratings, or "trusted by" claims. Sample personas are explicitly UI content, not quotes.
- No lorem ipsum, no placeholder avatars of real-looking people, no stock photos of handshakes.
- No bouncy/elastic easing.
- No centered-everything layouts. Clear typographic hierarchy, two font families (Bricolage Grotesque + Hanken Grotesk).
- No more than one primary button style per view (the CTA repeats, never competes with a second one).
- No spinner-only loading for layout content — skeletons matching final layout.
- No literal "sign up" language anywhere — HR provisions accounts (ADR-026 territory); the landing nav/hero/footer all say "Sign in" or "Try the live demo" only.

## Accessibility

Focus-visible styles (`outline: 2px solid var(--color-accent)`), keyboard paths for every action (role tablist supports arrow-key navigation, FAQ accordion is a real `<button>`), `aria-live` for the hero's check-in/approval announcements and toasts generally, labels on all inputs, tables with proper `<th scope>` headers, 44px+ touch targets, a real skip-to-content link, `prefers-reduced-motion` fully honored (see motion table).

## Open items for P-003 / build phases

- `{{SITE_URL}}` (canonical URL, OG/Twitter image URLs) stays a placeholder until the Vercel deploy exists (P1 exit criteria) — not blocking for the UI port itself.
- `{{REPO_URL}}` already resolves to `https://github.com/AnkushGitRepo/Stafy` as a tweak default — carry that literal value into the ported code.
- The 1200×630 social preview and the 180×180 apple-touch icon exist as an HTML/SVG mockup in the Brand Assets canvas; they need rasterizing (e.g. via a headless screenshot or export) before deploy. Everything else ships as SVG.
- **Lighthouse risk, flagged by the design itself**: GSAP + ScrollTrigger + Flip is roughly 70KB gzipped, plus two Google Fonts families add two extra requests. Mitigations to apply in P-003/P2: self-host and subset both fonts; consider dropping Flip and using a plain crossfade for the role-switcher metrics if the bundle-size hit isn't worth it. Check this against the P2 Lighthouse ≥90 requirement before calling that phase done.
- The design's `<script>` tags reference GSAP/ScrollTrigger/Flip via `cdn.jsdelivr.net` (fine for the real deployed site once P-003 wires them as real npm dependencies per `docs/ARCHITECTURE.md`'s approved list) — the CDN `<script src>` tags themselves won't execute inside the Claude Design canvas's sandboxed preview (no third-party script egress there), so the interactive motion only fully plays once ported into the real app, not inside the design canvas preview.

## Screen registry

| Screen | Route | Roles | Design prompt ID | Impl prompt ID | Status |
|---|---|---|---|---|---|
| Landing | `/` | public | P-002 | P-003 | Design ready |
| Login | `/login` | public | — (no dedicated design file; build from tokens per P-003 §5.1) | P-003 | Design ready (spec only) |
| Account activation | `/activate` | public | — (no dedicated design file; build from tokens per P-003 §5.2) | P-003 | Design ready (spec only) |
| Privacy | `/privacy` | public | TBD | TBD | not started |
| Terms | `/terms` | public | TBD | TBD | not started |
| 404 | `*` | public | TBD | TBD | placeholder exists (P0) |
| App Shell | `/app` | any | — (spec only, P-003 §6) | P-003 | Design ready (spec only) |
| Dashboard (admin/manager/employee variants) | `/app` | any | — (spec only, P-003 §6; role metrics/Can-Cannot lists reusable from `#roles`) | P-003 | Design ready (spec only) |
| Employees list | `/app/employees` | admin | — (directory bento panel is a real preview) | TBD | Reference exists in landing `#product` |
| Employee detail/edit | `/app/employees/:id` | admin | TBD | TBD | not started |
| Add employee | `/app/employees/new` | admin | TBD | TBD | not started |
| My profile | `/app/profile` | any | TBD | TBD | not started |
| Attendance | `/app/attendance` | any | — (month-grid panel is a real preview) | TBD | Reference exists in landing `#product` |
| Leave (my) | `/app/leave` | any | — (balance-meter panel is a real preview) | TBD | Reference exists in landing `#product` |
| Apply leave | `/app/leave/new` | any | TBD | TBD | not started |
| Approvals | `/app/approvals` | manager, admin | — (queue-row panel is a real preview) | TBD | Reference exists in landing `#product` |
| Audit log | `/app/audit` | admin | — (audit-entry panel is a real preview) | TBD | Reference exists in landing `#product` |
