# AGENTS.md — Stafy

Canonical, tool-agnostic engineering rules. `CLAUDE.md` imports this file and adds Claude-Code-specific notes only.

## 1. Project one-liner + deadline

Stafy — a role-based Mini HRMS assessment for AppTrait Solutions. **Deadline: 2026-09-16 16:00 IST. Feature freeze: 2026-09-16 13:00 IST.**

## 2. Session start protocol

Read, in order: `AGENTS.md` → `docs/CONTEXT.md` → `docs/00-INDEX.md` → only the docs `00-INDEX.md` maps to the current task. Do not bulk-read `docs/archive/`.

## 3. Ask-First Protocol

Stop and ask the human (Ankush) before:
1. Changing the database schema or an approved migration.
2. Adding a dependency not listed in `docs/ARCHITECTURE.md`.
3. Deviating from a decision in `docs/DECISIONS.md` or a rule in `docs/BUSINESS_RULES.md`.
4. Changing authentication, authorization, cookies, or permission logic.
5. Encountering a business rule that's ambiguous or not covered in `BUSINESS_RULES.md`.
6. Deleting or substantially rewriting a file not created in the current task.
7. Finding that current official docs (Supabase, Vercel, Claude Code, GSAP) contradict something already decided.
8. Any change that would push a phase beyond its timebox in `docs/PHASES.md`.

Question format (mandatory):
```
QUESTION [Q-###]: <one-line question>
Context: <why this came up, file/line if relevant>
Options:
  A) <option> — tradeoff
  B) <option> — tradeoff
Recommendation: <A/B> because <reason>
Blocking: yes/no (if no, state what you will do meanwhile)
```
Never guess silently. After the answer, append the outcome to `docs/DECISIONS.md` (architectural) or `docs/BUSINESS_RULES.md` (a rule), and log the Q&A in the current prompt log.

## 4. Engineering rules

- Layering per `docs/ARCHITECTURE.md`: `authenticate → loadEmployee → authorize → validate → service → repository → response/errorHandler`.
- No inline role checks (`role === 'admin'`) in routes — always `authorize(policy)` from `server/src/policies/`.
- All SQL parameterized, all input Zod-validated with `.strict()`.
- Every scoped query takes the actor and filters in SQL (never in application code after an unscoped fetch).
- Errors via `AppError(code, status, message, details?)`.
- IST time handling goes through one file: `server/src/lib/time.js`.
- No `console.log` in committed code — use the `pino` logger.
- No secrets in client code, ever.
- No new dependency without approval (Ask-First #2).
- JavaScript ESM, named exports, small files (~250 lines target).

## 5. Business-logic rule

Before implementing any leave/attendance/employee endpoint, list the BR-IDs it must enforce and the tests that will prove them. Code without mapped tests is not done.

## 6. Frontend rules

- Design tokens only — no raw hex values in components (`docs/DESIGN.md`).
- Every data view implements loading/empty/error states (skeleton, not spinner-only, for loading).
- Forms validate client-side (Zod) and server-side (Zod) — never trust the client alone.
- UI guards (route guards, hidden buttons) are never the only authorization check.
- Follow `docs/DESIGN.md` anti-slop and motion rules for any visual/animation work.
- `alt` on every `<img>` (empty `alt=""` for decorative images).

## 7. Definition of Done (per task)

- [ ] Lint passes
- [ ] Relevant unit/integration tests written and passing
- [ ] BR/test matrix (`docs/TESTING.md`) updated
- [ ] Manual check of each affected role
- [ ] Docs updated: `docs/CONTEXT.md`, `docs/AI_DEVELOPMENT.md` entry, `docs/DECISIONS.md` if any new decision, `CHANGELOG.md`
- [ ] Conventional commit(s)

## 8. Task close protocol

1. Update `docs/CONTEXT.md`.
2. Append a `docs/AI_DEVELOPMENT.md` entry.
3. Log any AI-generated defect found in `docs/AI_CODE_REVIEW.md` immediately (not later, not from memory).
4. Commit.

## 9. Phase close protocol

1. Summarize the phase to `docs/archive/phase-N-<slug>.md` (what was built, decisions, BRs covered, tests, issues, prompt IDs).
2. Shrink the `docs/CONTEXT.md` phase section to ≤5 lines + link to the archive.
3. Tick the phase's exit criteria in `docs/PHASES.md`.

## 10. Honesty rules

- Never claim tests pass without running them.
- Never invent metrics, reviews, or credentials.
- Say "not verified" when something is not verified.

## 11. Git

Conventional commits (`feat(leave): ...`, `docs: ...`, `test: ...`, `chore: ...`). Commit per task. Never commit `.env*` except `.env.example`.
