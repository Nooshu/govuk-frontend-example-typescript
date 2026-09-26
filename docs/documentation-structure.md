# Documentation structure (humans + agents)

## Principles

1. **One source of truth per topic** — avoid duplicating long guidance in both `AGENTS.md` and `/docs`.
2. **`AGENTS.md` stays slim** — priorities, non-negotiables, checklists, and links. Agents load this first.
3. **`/docs` holds the detail** — written so a human can follow it end-to-end without reading agent meta.
4. **Skill + rules encode habits** — [`.cursor/skills/`](../.cursor/skills/) for workflows; [`.cursor/rules/`](../.cursor/rules/) for always-on consistency.
5. **Official URLs win** — [guidance-sources.md](guidance-sources.md) before inventing policy.

## Audience cues

| Cue in a doc                                            | Meaning                                 |
| ------------------------------------------------------- | --------------------------------------- |
| “Start here”, “Repo map”, “Troubleshooting”             | Human onboarding                        |
| “Non-negotiables”, “Playbook”, “Do / don’t”, checklists | Agent-oriented (still useful to humans) |
| “Stack note”, “TBD until language chosen”               | Applies to both; do not invent paths    |

When editing docs:

- Prefer short sections and tables over long prose.
- Link to upstream GDS pages instead of pasting large excerpts.
- If you add an agent playbook step, add a one-line human explanation nearby or in onboarding.
- Update [`docs/README.md`](README.md) whenever you add a new doc.

## Suggested reading order

**Human (day one)**

1. [../README.md](../README.md)
2. [project-purpose.md](project-purpose.md)
3. [onboarding.md](onboarding.md)
4. [tech-stack.md](tech-stack.md)
5. [../CONTRIBUTING.md](../CONTRIBUTING.md)

**Agent (every session)**

1. [../AGENTS.md](../AGENTS.md)
2. Skill: `gds-compliant-frontend`
3. Relevant playbook under `/docs`
4. [guidance-sources.md](guidance-sources.md) when policy is unclear

## Consistency tooling

Dotfiles and shared tooling keep formatting and hygiene aligned — see [../CONTRIBUTING.md](../CONTRIBUTING.md#consistency-tooling). Document language-specific linters in [tech-stack.md](tech-stack.md) when the wrapper language is chosen.
