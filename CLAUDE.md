@AGENTS.md

## Claude-Code-specific notes

- Start any risky or multi-file task in **Plan Mode** and get explicit approval before writing code (Ask-First protocol in `AGENTS.md` §3 still applies on top of this).
- Subagents available in `.claude/agents/`: `security-reviewer` (read-only, checks diffs against `docs/SECURITY.md`), `rules-tester` (writes/runs tests against BR-IDs, updates `docs/TESTING.md`), `docs-keeper` (updates docs at task/phase close, never touches code), `ui-reviewer` (read-only, checks screens against `docs/DESIGN.md`).
- Skills available in `.claude/skills/`: `close-task`, `close-phase`, `log-prompt`, `log-ai-defect` — use at the points described in `AGENTS.md` §8/§9.
- Any animation code (GSAP) must be checked against `docs/DESIGN.md` motion rules before being considered done.
- Prefer actually running tests over reasoning about whether they would pass — honesty rule in `AGENTS.md` §10 applies to Claude Code specifically because it's easy to *say* `npm test` passed without running it.
