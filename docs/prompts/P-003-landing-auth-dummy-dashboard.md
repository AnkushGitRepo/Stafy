# P-003 — Implement Design: Landing, Auth Screens, Dummy Dashboards

> Paste into Claude Code, in Plan Mode. Save this file first at `docs/prompts/P-003-landing-auth-dummy-dashboard.md`.
> Prerequisite: P-001 scaffold and P-002 brand/token sync are committed. If `docs/DESIGN.md` still has any `TBD` token, stop and tell me — do not invent values.

---

## 0. Scope and boundary

This pass makes the app **visually real** end to end (landing → sign in → role dashboards) using **mock data only**. It is a UI pass, not a backend pass. Real auth, real API, and real database wiring happen in the next prompt, against the foundation from Phase P1. Do not build P1 backend logic here even if it seems easy; keep the seam clean so mocks can be deleted without touching component code.

**Locked decision — ADR-026** (add to `docs/DECISIONS.md` with full Context/Discussion/Options/Decision/Why/Tradeoffs/Revisit-if using the template in AGENTS.md):
- **Context:** Stafy has no public self-registration (ADR-003, ADR-008): HR creates every employee record, including role and manager. An open "Sign up" form would let a visitor choose their own role, which breaks the authorization model the whole assessment is scored on.
- **Discussion:** Ankush asked for a "sign up" screen. Claude flagged the conflict and proposed reframing it as an **account-activation** flow, the standard pattern for admin-provisioned accounts (HR creates the person; they get an invite link and set their own password). This keeps a signup-shaped screen without contradicting RBAC.
- **Decision:** Build `/activate?token=...` ("Set up your account") instead of a public `/signup`. No route or link named "Sign up" appears anywhere in the app nav. `/login` is the only entry point in navigation.
- **Tradeoff:** the activation flow can't be demoed end-to-end until HR "add employee" exists (a later phase) and issues real tokens. For now it's reachable only by typing the URL directly, with mock token handling, and is explicitly labeled a preview in `docs/AI_DEVELOPMENT.md`.
- **This mock pass does not violate ADR-021 (foundation before pages):** it is isolated behind a mock API layer (§3) that will be deleted, not extended, when real auth lands.

If you disagree with this, or believe the sign-up requirement means something else, use Ask-First and stop — do not silently build an open signup form.

---

## 1. Import the design

Use the `claude_design` MCP (`https://api.anthropic.com/v1/design/mcp`, auth via `/design-login` if not already authenticated).

**Import 1 — Brand assets**
Project: `https://claude.ai/design/p/09843fce-cd65-4a4e-afcf-e1ee817b34ff?file=Stafy+Brand+Assets.dc.html`
Focus file: `Stafy Brand Assets.dc.html`. Also read: `assets/favicon.svg`, `assets/stafy-logo-dark.svg`, `assets/stafy-logo-light.svg`, `assets/stafy-mark.svg`, `support.js`.
Implement: `Stafy Brand Assets.dc.html`.

**Import 2 — Landing**
Project: `https://claude.ai/design/p/09843fce-cd65-4a4e-afcf-e1ee817b34ff?file=Stafy+Landing.dc.html`
Focus file: `Stafy Landing.dc.html`. Also read: `support.js`.
Implement: `Stafy Landing.dc.html`.

There is no Claude Design file yet for Sign in, Account activation, or the three dashboards. Build those yourself in §4–§6, strictly from `docs/DESIGN.md` tokens, component inventory, motion rules, and anti-slop checklist — do not invent new colors, fonts, or a different visual language. If you find a token or component DESIGN.md doesn't cover, ask (Ask-First), don't improvise.

> **Note (added after P-002, 2026-09-15):** This Claude Code session has no `claude_design` MCP tool and no `/design-login` command — importing an existing `claude.ai/design/p/...` project by URL is a claude.ai/design (web) capability, not available from this preview. The owner instead supplied the real deliverable as zip exports; its content was published to two Claude Code Artifact canvases and `docs/DESIGN.md` was synced from it (see ADR-025). §5–§6 below (login, activation, dashboards) still need to be built from `docs/DESIGN.md` tokens/components/motion, as originally specified — no Claude Design file exists for those.

---

## 2. Where things go (respect `docs/ARCHITECTURE.md`)

```
client/src/
├─ assets/brand/          # svgs from the design import: favicon, logo-dark, logo-light, mark
├─ components/ui/         # Button, Input, Checkbox, Select, Badge/StatusPill, StatCard,
│                          # Toast(sonner wrapper), Skeleton, EmptyState, PageHeader, Tabs,
│                          # Accordion, SegmentedControl — build only what §4-6 need right now
├─ features/
│  ├─ landing/            # Stafy Landing.dc.html port, section-by-section components
│  ├─ auth/
│  │  ├─ pages/SignInPage.jsx
│  │  ├─ pages/ActivateAccountPage.jsx
│  │  └─ components/ (form fields, auth layout shell)
│  └─ dashboard/
│     ├─ pages/AdminDashboardPage.jsx
│     ├─ pages/ManagerDashboardPage.jsx
│     ├─ pages/EmployeeDashboardPage.jsx
│     └─ components/ (StatCard row, WeekStrip, RecentAttendanceList, ApprovalsQueue, etc.)
├─ mocks/
│  ├─ session.js          # mock "current user" state, see §3
│  ├─ users.js            # sample HR/Manager/Employee records (reuse landing's Riya/Arjun etc.)
│  └─ dashboardData.js    # per-role mock metrics matching docs/PRD.md dashboard definitions
└─ lib/
   ├─ api.js              # the REAL future contract — implement now against mocks (§3)
   └─ authContext.jsx      # React context: user, role, login(), logout(), isAuthenticated
```

---

## 3. Mock layer contract (the seam that must survive replacement)

`lib/api.js` exports functions with the **exact shape the real API will have** per `docs/ARCHITECTURE.md`'s API contract table, e.g. `login({ email, password })`, `getMe()`, `logout()`, `getDashboard()`. Right now each function is a thin wrapper that calls a matching function in `mocks/` after an artificial 400–700ms delay (to make loading states real and testable), and returns/throws in the same shape real fetches will (`{ data }` or `throw new ApiError(code, status, message)`).

- Add a single constant `const USE_MOCKS = true` at the top of `lib/api.js`. Next prompt flips this and deletes the mock branch — nothing else should need to change. Comment this clearly.
- `login()` accepts the 4 demo emails only (`hr@stafy.app`, `manager@stafy.app`, `manager.b@stafy.app`, `employee@stafy.app`), any non-empty password, and rejects anything else with the same `INVALID_CREDENTIALS` error shape the real API will use (generic message, no user enumeration — this is a security rule from `docs/SECURITY.md` and should hold even in the mock). Wrong attempts are rate-limited client-side after 5 tries (mirrors BR intent), with a countdown message.
- Session persistence: store only a non-sensitive session flag in `sessionStorage` (not `localStorage`, so it clears when the tab closes — closer to real cookie behavior than a persistent mock). Never store a fake "token" that looks like a real credential.
- `getDashboard()` returns the mock data shaped exactly like `docs/PRD.md`'s dashboard metric definitions per role, so the real backend can drop in without changing any dashboard component prop.

---

## 4. Landing page implementation

Port `Stafy Landing.dc.html` into `features/landing/`, one component per section ID from `docs/prompts/P-002-brand-and-landing-design.md` Part B3 (`Hero`, `RolesSection`, `ProductBento`, `RulesSection`, `ApprovalsFlow`, `SecuritySection`, `TryItSection`, `Faq`, `Footer`).

> **Note (added after P-002):** the real delivered section IDs are the DOM anchors `#top`, `#hero`, `#roles`, `#product`, `#rules`, `#approvals`, `#security`, `#demo`, `#faq`, `#footer` — see `docs/DESIGN.md` Landing page design table, which supersedes the illustrative names above.

- Port all GSAP motion from the design file into `useGSAP` hooks scoped to each section's ref, matching the motion spec table (P-002 Part B5) exactly: same triggers, targets, durations, easing, and **reduced-motion fallback** via `gsap.matchMedia()`. Every timeline must clean up on unmount.
- The primary CTA ("Try the live demo") routes to `/login`. The FAQ, rules, and role-switcher content must not claim anything the app doesn't yet do — if the design file shows something not built yet (e.g. an audit log entry), keep it as illustrative sample content, not a working link.
- Wire the `<head>` tags, favicon, OG image, manifest, `robots.txt`, `sitemap.xml` from the design import into `client/index.html` / `client/public/`.
- Create `/privacy` and `/terms` as plain, real pages (not placeholders) with actual content appropriate for this project: what data is collected (name, email, phone, attendance/leave records), that it's a practical assessment with demo data reset at any time, cookie/session use (session cookie only, no tracking cookies beyond cookieless analytics), contact = your email. Ask me for the contact email if you don't have it.
- Build the custom 404 page now (route `*`), on-brand, with the primary action "Back to Stafy" → `/`.
- Lighthouse: run it locally (`npx lighthouse` or Chrome DevTools if available in this environment) against the built landing page; report the four category scores. If any is below 90, fix what you can (image formats, font loading, unused JS) before moving on, and tell me what you couldn't fix and why.

---

## 5. Sign-in and account activation

### 5.1 `/login` — Sign in
- Centered auth card on the paper background with the Stafy mark, not the full nav header. Link back to `/` on the logo.
- Fields: email, password (show/hide toggle), "Remember me" is **not included** (session-only per §3). Primary button "Sign in". No "Forgot password" flow yet — add a disabled-looking text link "Forgot your password?" that on click shows a toast "Ask your HR admin to reset it for now" (accurate to how a real HR-provisioned system works, not a dead promise).
- Client validation with Zod + React Hook Form: valid email format, password required. Server-shaped errors (from the mock) render as a single inline banner above the form, not per-field, since `INVALID_CREDENTIALS` isn't field-specific — this also matches the no-user-enumeration rule.
- Loading state disables the form and shows a spinner in the button (not a full skeleton — this is a small form).
- On success: route to `/app` which redirects to the role's dashboard based on the mock session's role.
- Below the form, a **clearly separated demo panel** (bordered, secondary, not competing with the real form visually): "Demo accounts" with the 4 emails and note "any password works in this preview". Label it "Preview only" — this must not look like a real feature when backend auth replaces mocks; use a `{/* MOCK-ONLY: remove this block when USE_MOCKS=false */}` comment.
- `<title>Sign in — Stafy</title>`, meta robots `noindex` (auth pages shouldn't be indexed).

### 5.2 `/activate` — Set up your account
- Reads `?token=` from the URL. In mock mode, any non-empty token is "valid"; an empty or missing token shows an expired/invalid state with a plain explanation and a mailto-style contact line, no dead-end.
- Shows the invitee's name and email **read-only** (from a mock lookup keyed by token — pretend HR already created Priya Shah / employee role), because in the real system these come from the HR-created record, not user input. This is important: the person completing activation must not be able to pick their own name/email/role here.
- Fields: new password, confirm password. Password rule shown inline (min 8 chars — keep simple; real complexity rules can be revisited with the real backend). Primary button "Set password and sign in". On success, behaves like a successful login and routes to `/app`.
- Same auth-card shell as `/login`, reusable `AuthLayout` component.

---

## 6. Dummy role dashboards

Route `/app` reads the mock session and renders the matching page. Include a **route guard**: if there's no mock session, redirect to `/login` (UX-only guard, matches ADR-005 — real enforcement is server-side later).

Build a persistent **app shell** now (used by all three dashboards and reused by every future `/app/*` page): sidebar (desktop) / bottom nav or drawer (mobile) per `docs/DESIGN.md` layout section, with nav items appropriate to the logged-in role (e.g. employee doesn't see "Employees"), a top bar with the IST clock, user menu (initials avatar, name, role, "Sign out" which clears the mock session and returns to `/`). Nav items that aren't built yet (Attendance, Leave, Employees, Approvals, Audit) are **visible but route to a shared `ComingSoonPage`** (on-brand empty state: "This page ships in the next phase"), so navigation feels real without faking functionality.

Each dashboard uses `mocks/dashboardData.js`, matches `docs/PRD.md`'s exact metric definitions for that role, and must feel "alive" per `docs/DESIGN.md` (ADR-017): a live IST clock, at least one counter that visibly tweens to its value on load (GSAP, not a plugin), and — for the employee dashboard — a check-in button that, in mock mode, actually flips local state (checked out → checked in, starts an elapsed timer) so the interaction feels real, clearly commented as mock-only.

- **Admin dashboard:** Total Employees, Active Employees, Present Today, Employees on Leave, Pending Leave Requests. Include a small recent-activity list (reuse audit log sample style from landing).
- **Manager dashboard:** Total Team Members, Present Today, Team Members on Leave, Pending Approvals, plus a compact team list with status pills (reuse WeekStrip component).
- **Employee dashboard:** Today's attendance status + check-in/out control, Total leave requests, Pending, Approved/Rejected, Recent attendance (last 5, as a list, not a table on mobile).

All three share a `StatCard`, `WeekStrip`, and `StatusPill` component from `components/ui/` — do not fork per-dashboard variants of these.

---

## 7. Definition of done for this task (in addition to AGENTS.md's standard DoD)

- `npm run lint` and `npm run build` pass.
- Manual pass at 1440/768/390 for: landing, /login, /activate (with and without token), and all 3 dashboards, plus 404.
- Reduced-motion pass on landing confirms full comprehension with animation off.
- No route or visible text anywhere says "Sign up" or implies self-registration.
- No secrets, no real Supabase calls; `USE_MOCKS = true` confirmed as the only auth path right now.
- `docs/DESIGN.md` screen registry updated: Landing/Login/Activate/404/Privacy/Terms/3 dashboards marked with status "UI built (mock data)".
- Update `docs/CONTEXT.md`, append `docs/AI_DEVELOPMENT.md` entries for the design import and for this build (What I accepted/changed/rejected = `TO BE FILLED BY ANKUSH`), add ADR-026 to `docs/DECISIONS.md`, update `CHANGELOG.md`.
- Log at least one real entry in `docs/AI_CODE_REVIEW.md` if the design import or GSAP port produced anything you had to fix — don't skip logging just because this was a "design implementation" task; that's exactly the kind of AI output the PDF wants reviewed.
- Commit in logical chunks (brand assets → landing → auth shell+pages → dashboards+mocks), conventional commit messages, not one giant commit.

Reply with: the file tree created, Lighthouse scores, screenshots or a description of each screen at the three breakpoints, and any `QUESTION [Q-###]` raised.
