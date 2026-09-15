# P-002 — Brand Identity & Landing Page Design (Claude Design)

> Paste into Claude Code, in Plan Mode. Save this file first at `docs/prompts/P-002-brand-and-landing-design.md`.
> Prerequisite: P-001 scaffold committed.

## 0. Scope and boundary

This is a **design-only** pass. It produces a real Claude Design project (a brand-assets canvas and a landing-page canvas, each published as an Artifact) and syncs the resulting decisions into `docs/DESIGN.md`. It does not touch `client/src/` — that porting happens in P-003.

DO:
- Use the `design` skill to create two canvases: `Stafy Brand Assets.dc.html` and `Stafy Landing.dc.html`.
- Lock brand identity as **ADR-025** in `docs/DECISIONS.md` (full template).
- Replace every `TBD` token in `docs/DESIGN.md` with a real value.
- Produce the landing section list (§2 Part B3) and motion spec table (§2 Part B5) that P-003 will port 1:1.

DO NOT:
- Write React/GSAP component code or touch `client/src/` (P-003's job).
- Change `docs/ARCHITECTURE.md` or `docs/BUSINESS_RULES.md`.
- Put fabricated social proof (fake logos, testimonials, user counts) anywhere in the landing content — `docs/DESIGN.md` already forbids this.

First, produce a plan and wait for approval. Then execute.

## 1. Brand identity (ADR-025)

- **Context**: `docs/DESIGN.md`'s anti-slop rules forbid generic AI-slop defaults (purple→blue gradients, neon-on-dark, pure black/white greys). Tokens are currently all `TBD`.
- **Decide and justify** (Discussion field must record why, not just what):
  - One brand accent hue + a neutral scale tinted toward it. Status colors for all 8 states (Present / Half Day / Absent / Leave / Pending / Approved / Rejected / Cancelled) — each visually distinct, colorblind-considerate.
  - A two-font-max pairing (one display, one text face) — must be a real, safely-licensable face (system stack or Google Fonts).
  - Real numbers for spacing/radius/shadow/z-index/breakpoints/motion durations (sane defaults are fine, but they must be numbers, not `TBD`).
  - Logo: wordmark + standalone mark, dark/light variants, favicon.
- If brand *personality* (e.g. "serious/enterprise" vs. "friendly/approachable") isn't inferable from `docs/PRD.md`, ask (Ask-First) rather than guessing; otherwise default to professional/utilitarian (fits an HR system) and say so in the ADR.
- Build the `Stafy Brand Assets` canvas: palette swatches, type scale, logo lockups, exporting `assets/favicon.svg`, `assets/stafy-logo-dark.svg`, `assets/stafy-logo-light.svg`, `assets/stafy-mark.svg`.

## 2. Landing page design

- **B1 — Information architecture**: confirm sections `Hero`, `RolesSection`, `ProductBento`, `RulesSection`, `ApprovalsFlow`, `SecuritySection`, `TryItSection`, `Faq`, `Footer`.
- **B2 — Content**: concrete Stafy facts per section, sourced from `docs/PRD.md` FRs and `docs/BUSINESS_RULES.md` (e.g. `RulesSection` plainly describes real approval/cancellation behavior; `SecuritySection` honestly describes RLS-deny-all + scoped queries + `HttpOnly` cookies — no over-claiming). `RolesSection` may use named illustrative personas (e.g. "Riya, HR Admin") as sample UI content only — never phrased as a testimonial or quote.
- **B3 — Section ID list** (exact strings, P-003 ports these 1:1): `Hero`, `RolesSection`, `ProductBento`, `RulesSection`, `ApprovalsFlow`, `SecuritySection`, `TryItSection`, `Faq`, `Footer`.
- **B4 — Build** the `Stafy Landing` canvas using only the ADR-025 tokens, following `docs/DESIGN.md`'s one-primary-CTA and anti-slop rules.
- **B5 — Motion spec table**: per section — trigger (on-load / on-scroll), targets, GSAP property, duration, easing, stagger count (≤8), reduced-motion fallback. Must satisfy `docs/DESIGN.md` motion rules (reveal-once, no scroll-jacking, no pinning >1 viewport, hero ≤1.2s).

## 3. Sync back into docs

- Replace every `TBD` in `docs/DESIGN.md`'s token block with the real chosen value; flip its status header from "Draft" to "Approved".
- Update the `docs/DESIGN.md` screen registry: Landing row gets design prompt ID `P-002`, status "Design ready".
- Add ADR-025 to `docs/DECISIONS.md`.
- Log both canvas URLs in `docs/AI_DEVELOPMENT.md` (Tool: Claude Design) and in `docs/CONTEXT.md` gotchas, so P-003 can find them.

## 4. Definition of done

- Zero `TBD` remains in `docs/DESIGN.md`'s token block.
- Both canvases exist, published, URLs recorded.
- ADR-025 added; `docs/CONTEXT.md` and `CHANGELOG.md` updated.
- No `client/src/` code touched.

Reply with: both canvas URLs, the final token values table, the section/motion spec tables, and any `QUESTION [Q-###]`.
