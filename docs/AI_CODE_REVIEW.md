> Status: Living — template only, no entries yet   ·   Last updated: 2026-09-15 18:00 IST   ·   Owner: Ankush
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

No cases logged yet — no feature code has been written (P0 is docs/scaffold only).
