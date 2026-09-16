> Status: Living   ·   Last updated: 2026-09-16 00:10 IST   ·   Owner: Ankush
> Related: .claude/agents/security-reviewer.md, docs/AI_DEVELOPMENT.md

# AI Code Review Log

**Rule: entries must be real, logged at the moment they occur, never back-filled from imagination.** Target ≥4 real cases so the best 2+ can be chosen for the README.

## Template

```
## Case ID: AICR-###

- **What AI generated**: <file path> — <snippet, ≤20 lines>
- **What was wrong**: <the defect>
- **How I identified it**: test failed | manual review | reviewer subagent | runtime error
- **How I fixed it**: <diff summary> — <commit>
- **Lesson → rule added to AGENTS.md?**: <yes, rule text | no, why not>
```

## Case ID: AICR-001

- **What AI generated**: the from-scratch "Stafy Landing" Claude Design canvas (P-002, before the real deliverable was substituted in), specifically:
  ```css
  --color-surface: #FFFFFF;
  ```
  and FAQ copy: `"Can I sign myself up?"`
- **What was wrong**: `--color-surface: #FFFFFF` is literally pure white, violating this project's own anti-slop rule ("No pure `#000`/`#fff` greys. Neutrals are tinted toward the brand hue.") in `docs/DESIGN.md`. Separately, the FAQ question text contained the literal phrase "sign myself up," which reads as "Sign up" even though the answer correctly denies self-registration.
- **How I identified it**: reviewer subagent (a fresh `general-purpose` agent briefed to check the canvas source against the anti-slop rules and the "no Sign up" rule, run before publishing).
- **How I fixed it**: changed `--color-surface` to `#FBFDFD` (a barely-tinted near-white, keeping the elevation contrast against the tinted `--color-bg` while no longer being literally `#FFFFFF`) everywhere it appeared in both canvases; reworded the FAQ question to "Can I create my own account?". Republished both canvases. (This canvas was itself superseded minutes later by the real Claude Design deliverable the owner provided — the fix stands as a record that the review step worked, even though the specific file it applied to was later replaced.)
- **Lesson → rule added to AGENTS.md?**: No — the existing anti-slop rule already covered this; the gap was process (reviewing before publish), not a missing rule, and that review step is now standard practice for design-canvas work per the `design` skill's own "check complex work afterwards" guidance.

## Case ID: AICR-002

- **What AI generated**: `client/src/features/landing/components/{Header,RulesSection,ApprovalsFlow,ProductBento,RolesSection}.jsx` (P-003), e.g. in `Header.jsx`:
  ```js
  function ScrollTriggerCreate() {
    if (!window.ScrollTrigger) return null;
    return window.ScrollTrigger.create({ ... });
  }
  ```
  and in `RolesSection.jsx`:
  ```js
  const state = window.Flip && !reduced && items.length ? window.Flip.getState(items) : null;
  ```
- **What was wrong**: the original Claude Design source (a standalone `.dc.html`) loads GSAP/ScrollTrigger/Flip via `<script src="cdn.jsdelivr.net/...">`, which makes them global (`window.gsap`, `window.ScrollTrigger`, `window.Flip`). When porting that source into the real React app, `gsap`/`ScrollTrigger`/`Flip` are correctly imported as npm modules per `docs/ARCHITECTURE.md`'s approved dependency list — but five components still carried over the original's `window.ScrollTrigger`/`window.Flip` checks verbatim. Since nothing ever assigns those globals in the npm build, every one of those checks silently evaluated falsy and no-opped: the header's scroll-based hide/show and background fade, the rules-section scroll reveal, the approvals scroll-scrubbed path, the product-bento month-dot reveal, and the role-switcher's `Flip` metric animation all did nothing, with no console error to flag it.
- **How I identified it**: manual review in a real browser (Chrome via the browser automation tools) — the hero's headline was visibly stuck mid-animation; `javascript_exec` confirmed `typeof window.gsap === "undefined"` while the imported module was working fine elsewhere, which pointed straight at the `window.*` references.
- **How I fixed it**: imported `ScrollTrigger` from `gsap/ScrollTrigger` and `Flip` from `gsap/Flip` directly in each affected file (both plugins are already registered once via `gsap.registerPlugin` in `LandingPage.jsx`) and replaced every `window.ScrollTrigger`/`window.Flip` reference with the imported binding; removed the now-unnecessary `if (!window.ScrollTrigger) return` guards.
- **Lesson → rule added to AGENTS.md?**: Yes — added to `AGENTS.md` §6 (frontend rules): when porting a Claude Design `.dc.html` source into React, grep the ported files for `window.gsap`, `window.ScrollTrigger`, and `window.Flip` before considering the port done, since the design source assumes CDN globals that don't exist in the npm build.

## Case ID: AICR-003

- **What AI generated**: `client/src/features/dashboard/components/AppShell.jsx` (P-003, now removed), specifically:
  ```js
  const NAV_ITEMS = [
    { to: '/app', label: 'Dashboard', end: true, roles: ['admin', 'manager', 'employee'] },
    { to: '/app/attendance', label: 'Attendance', roles: ['admin', 'manager', 'employee'] },
    { to: '/app/leave', label: 'Leave', roles: ['admin', 'manager', 'employee'] },
    { to: '/app/approvals', label: 'Approvals', roles: ['admin', 'manager'] },
    { to: '/app/employees', label: 'Employees', roles: ['admin'] },
    { to: '/app/audit', label: 'Audit log', roles: ['admin'] },
  ];
  ```
- **What was wrong**: `docs/prompts/P-004-dashboard-design.md` §2 (written and approved before P-003 shipped) specifies Manager's nav as Dashboard/**My Team**/Attendance/Leave/Approvals (5 items) and Employee's as Dashboard/Attendance/Leave/**My Profile** (4 items). P-003's shipped nav list never included a "My Team" or "My Profile" entry at all — those two roles quietly shipped with fewer nav items than the already-approved design called for, with no route or nav entry for either destination.
- **How I identified it**: manual review — while mapping the P-005 dashboard-design zip export's own `NAV` constant against P-004 §2 (per P-005 §1's inventory step), the export's manager/employee nav lists included `team`/`profile` items P-003's actual code didn't have; cross-checking confirmed the gap was already present in P-003, not something P-005 was newly inventing.
- **How I fixed it**: added `/app/team` and `/app/profile` routes to `App.jsx` (both render the existing `ComingSoonPage`, same pattern as the other not-yet-built pages) and added the two missing entries to the new `client/src/features/app-shell/navConfig.js`'s `NAV_ITEMS`. No new destinations were designed — this only restores nav-list completeness against the design that was already approved.
- **Lesson → rule added to AGENTS.md?**: Yes — added to `AGENTS.md` §6 (frontend rules): when a design prompt is approved before its implementation prompt runs, the implementation must diff its shipped nav/metric list against the design prompt's exact spec before the task is marked done.

## Case ID: AICR-004

- **What AI generated**: `client/src/lib/api.js` (P-003, written while `USE_MOCKS = true` so this branch was dead code at the time):
  ```js
  if (res.status === 401 && path !== '/api/auth/refresh') {
    const refreshRes = await refreshSession();
    if (refreshRes.ok) {
      res = await doFetch();
    } else {
      window.location.assign('/login');
      return res;
    }
  }
  ```
- **What was wrong**: `getMe()` calls this same `api()` helper against `/api/auth/me` on every page load (including `/login` itself, via `authContext.jsx`'s mount effect) purely to check "is anyone signed in" — a 401 there is the expected, normal answer for any anonymous visitor, not a session-expiry event. Because the helper redirected to `/login` on *any* 401 outside `/api/auth/refresh`, an anonymous visitor landing on `/login` triggered: `getMe()` → 401 → refresh attempt (404, no such endpoint) → `window.location.assign('/login')` → full page reload → `getMe()` runs again → same 401 → infinite reload loop. The page never painted past a blank root div. This was invisible under P-003 because `USE_MOCKS = true` meant this whole branch never executed.
- **How I identified it**: manual review in a real browser (Chrome via the browser automation tools) — the live production URL rendered blank; `read_network_requests` showed a tight repeating cycle of `POST /api/auth/refresh` (404) → `GET /login` (200, full reload) → `GET /api/auth/me` (401) every ~1–2 seconds.
- **How I fixed it**: excluded `/api/auth/me` from the redirect-on-401 path alongside the existing `/api/auth/refresh` exclusion — a 401 from `/me` now just resolves the promise and lets `authContext.jsx`'s existing `.catch(() => setUser(null))` handle it, matching how "check if logged in" is supposed to behave. Redeployed and confirmed the live login page loads and signs in cleanly for all 4 demo accounts.
- **Lesson → rule added to AGENTS.md?**: No — this is a standard "unreachable code becomes reachable when a feature flag flips" risk, already generally mitigated by AGENTS.md §10's honesty rule (verify by running, don't assume). Didn't add a new standing rule under deadline time pressure; worth a `.strict()`-style "test every `USE_MOCKS`-gated real branch once before flipping the flag" rule in a calmer pass later.

## Case ID: AICR-005

- **What AI generated**: `server/src/lib/time.js` (P-007, first Tier 0 pass):
  ```js
  function toIst(date) {
    return new Date(date.getTime() + (date.getTimezoneOffset() + 330) * 60000);
  }
  export function workDateInIst(at = new Date()) {
    return toIst(at).toISOString().slice(0, 10);
  }
  ```
- **What was wrong**: `Date.prototype.getTimezoneOffset()` returns the *host runtime's own local* UTC offset, not zero — the formula silently assumed the process always runs with a UTC-local system clock. It happens to work on Vercel (whose Node runtime defaults to UTC) but is wrong on any other host timezone. Concretely: on a machine local to IST itself (`getTimezoneOffset() = -330`), the formula adds `(-330 + 330) * 60000 = 0` minutes — i.e. it silently no-ops the IST conversion entirely and just returns the input instant's UTC calendar date, which is wrong for the ~5.5 hours per day where the UTC date and the IST date differ.
- **How I identified it**: unit test failed — `workDateInIst(new Date('2026-09-16T19:00:00Z'))` (00:30 IST on the 17th) returned `'2026-09-16'` instead of `'2026-09-17'` when run locally (this machine's local timezone is not UTC).
- **How I fixed it**: replaced the manual offset arithmetic with `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', ... })`, which is correct regardless of the host runtime's own local timezone. Redeployed (this function backs `workDateInIst()`, used by the attendance check-in/out and dashboard "present today" routes) and re-verified check-in against the live production API.
- **Lesson → rule added to AGENTS.md?**: Yes — added to `AGENTS.md` §4 (engineering rules), under the existing "IST time handling goes through one file" rule: that file must derive IST via `Intl.DateTimeFormat`/a timezone-aware library, never via manual UTC-offset arithmetic keyed off `Date.prototype.getTimezoneOffset()` (host-timezone-dependent, breaks silently off Vercel's default UTC runtime).
