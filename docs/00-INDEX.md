> Status: Living   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
> Related: all docs below

# Context Map

Read this file first after `AGENTS.md` and `docs/CONTEXT.md`. Load only the rows relevant to the task at hand — do not bulk-read `docs/archive/`.

| Doc | Purpose | Read when |
|---|---|---|
| `docs/CONTEXT.md` | Live session state: phase, done/next, open questions, gotchas | Every session start |
| `docs/PRD.md` | Roles, permission matrix, functional requirements, acceptance criteria, dashboard metric definitions | Defining/changing any feature's behavior |
| `docs/PLANNING.md` | Submission-facing 1–2 page overview | Writing README summary or submission materials |
| `docs/ARCHITECTURE.md` | Layering, request lifecycle, API contract table, repo structure, dependency list, env vars | Adding an endpoint, a dependency, or touching request flow |
| `docs/SECURITY.md` | Threat model, permission matrix, headers, cookies, web quality checklist | Touching auth, cookies, headers, or any user-facing form/page |
| `docs/DATABASE.md` | ER diagram, DDL design, constraints, seed plan | Touching schema, migrations, or seed data |
| `docs/BUSINESS_RULES.md` | BR-01…BR-26: rule, enforcement layer, status/code, test IDs | Implementing or reviewing leave/attendance/employee logic |
| `docs/TESTING.md` | Test strategy, BR/threat → test-ID matrix, commands | Writing or checking test coverage |
| `docs/PHASES.md` | Timeboxed plan to deadline, cut order | Scoping work, checking if a phase deadline is at risk |
| `docs/DECISIONS.md` | ADR log (ADR-001…ADR-024+) | Before deviating from an existing decision |
| `docs/DESIGN.md` | Design tokens, component inventory, motion/anti-slop rules, screen registry | Any UI/frontend work |
| `docs/AI_DEVELOPMENT.md` | Prompt-by-prompt AI usage log | Task close (append an entry) |
| `docs/AI_CODE_REVIEW.md` | Logged AI defect cases | Whenever an AI-generated defect is found |
| `docs/prompts/*.md` | Verbatim prompts, one per file | Tracing why a decision/prompt happened |
| `CHANGELOG.md` | Keep-a-Changelog entries per phase | Phase close |
| `AGENTS.md` | Canonical engineering rules (tool-agnostic) | Every session start |
| `CLAUDE.md` | Claude-Code-specific notes, imports `AGENTS.md` | Every session start (Claude Code only) |
