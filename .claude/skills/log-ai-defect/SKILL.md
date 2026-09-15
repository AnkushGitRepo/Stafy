---
name: log-ai-defect
description: Interactive docs/AI_CODE_REVIEW.md entry creation for a real AI-generated defect just found. Use immediately when one is found — never back-filled later from memory.
---

When an AI-generated defect is found (via a failing test, manual review, a reviewer subagent finding, or a runtime error):

1. Identify the next `AICR-###` case ID.
2. Fill in the template from `docs/AI_CODE_REVIEW.md`:
   - **What AI generated**: file path + a snippet of ≤20 lines showing the actual defective code.
   - **What was wrong**: the concrete defect, not a vague description.
   - **How I identified it**: test failed | manual review | reviewer subagent | runtime error — pick the one that's actually true.
   - **How I fixed it**: a diff summary + the commit that fixed it.
   - **Lesson → rule added to AGENTS.md?**: if this defect pattern is likely to recur, propose a concrete rule addition to `AGENTS.md` and ask the human before adding it (Ask-First applies to rule changes too).
3. Append the entry to `docs/AI_CODE_REVIEW.md` now, in the same session the defect was found — do not defer this to task close.

Never write an entry for a hypothetical or remembered-from-a-previous-session defect without the actual code/diff in front of you.
