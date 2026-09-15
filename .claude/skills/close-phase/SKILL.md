---
name: close-phase
description: Runs the Phase close protocol (AGENTS.md §9) — archives phase detail, shrinks CONTEXT.md, ticks PHASES.md exit criteria.
---

Run these steps in order when a phase in `docs/PHASES.md` is complete:

1. Verify every exit criterion checkbox for the phase is actually satisfied — don't tick one you haven't verified.
2. Delegate to the `docs-keeper` subagent to write `docs/archive/phase-N-<slug>.md`: what was built, decisions made (link ADR IDs), BRs covered, tests written (link test IDs), issues found, prompt IDs used.
3. Shrink the phase's section in `docs/CONTEXT.md` to ≤5 lines + a link to the new archive file.
4. Tick the phase's exit criteria checkboxes in `docs/PHASES.md`.
5. Update `docs/CONTEXT.md`'s "Current phase & task" and "Status of phases" table to reflect the next phase.

If any exit criterion is unmet, do not close the phase — report what's missing instead.
