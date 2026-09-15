---
name: log-prompt
description: Given a prompt file under docs/prompts/, creates the docs/AI_DEVELOPMENT.md entry skeleton and asks the human the "accepted / changed / rejected" questions instead of guessing.
---

Given a prompt file path under `docs/prompts/`:

1. Read the prompt file and summarize: what it asked for, what tool was used (Claude chat / Claude Design / Claude Code), and why it was used.
2. Fill in "AI's approach/output" from what actually happened in that session — not a guess.
3. **Ask the human** (do not guess) what was accepted as-is, and what was changed or rejected and why. Use `AskUserQuestion` or a plain question — this field must reflect the human's real judgment, not an assumption.
4. Fill in commit hash(es) once the associated commit exists — leave `TBD` until then, never invent one.
5. Append the completed entry to `docs/AI_DEVELOPMENT.md`.
