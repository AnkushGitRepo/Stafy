---
name: close-task
description: Runs the Task close protocol (AGENTS.md §8) step by step at the end of a task, delegating doc updates to docs-keeper.
---

Run these steps in order for the task just completed:

1. Confirm lint and relevant tests actually passed (re-run if unsure — never assume). If they didn't, stop and fix before closing.
2. Delegate to the `docs-keeper` subagent to: update `docs/CONTEXT.md`, append a `docs/AI_DEVELOPMENT.md` entry, and add a `CHANGELOG.md` entry if user-visible behavior changed.
3. If any AI-generated defect was found and fixed during this task, invoke the `log-ai-defect` skill now — don't skip this even if it feels minor.
4. Confirm `docs/TESTING.md`'s matrix reflects reality (no `planned` rows for tests that now actually pass, and vice versa).
5. Make the commit(s) using conventional commit format (`AGENTS.md` §11).

Do not mark the task closed if any step above was skipped or faked.
