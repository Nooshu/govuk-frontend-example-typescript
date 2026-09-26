<!-- ============================================================
  GOV.UK Design System — Agent instructions
  ============================================================
  Base: TypeScript line of GDS-compliant frontends (Node + GOV.UK Frontend)
  Sync shared docs from Nooshu/govuk-frontend-example (see docs/syncing-from-template.md)
  Detail lives in /docs and .cursor/skills/gds-compliant-frontend
  ============================================================ -->

♛ GOV.UK

# GOV.UK Frontend example (TypeScript)

**TypeScript** specialised line: **Node + TypeScript** generates HTML; **[GOV.UK Frontend](https://frontend.design-system.service.gov.uk/)** (latest pinned version) is the **only** UI component library. **No frontend frameworks** (React, Vue, Angular, Svelte, etc.) for UI.

All component HTML should come from **GOV.UK Frontend macros** (prefer **Nunjucks** over copy-pasting release HTML). Official **test fixtures** enable extensive **100% HTML parity** testing of TypeScript/Nunjucks output.

Language-agnostic template (shared playbooks): https://github.com/Nooshu/govuk-frontend-example — sync with `npm run sync:template` ([docs/syncing-from-template.md](docs/syncing-from-template.md)).

**LIVE guidance** — [Design System feedback](https://design-system.service.gov.uk/community/feedback/).

Skill: [`.cursor/skills/gds-compliant-frontend/SKILL.md`](.cursor/skills/gds-compliant-frontend/SKILL.md). Purpose: [`docs/project-purpose.md`](docs/project-purpose.md). Stack: [`docs/tech-stack.md`](docs/tech-stack.md).

## Priorities (in order)

1. Frontend web performance
2. Frontend security
3. Reduced maintenance
4. Accessibility
5. Inclusive design

Details: [`docs/priorities.md`](docs/priorities.md).

## Start here

| Audience                      | Doc                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Human developers**          | [`docs/onboarding.md`](docs/onboarding.md), [`CONTRIBUTING.md`](CONTRIBUTING.md)                                        |
| **AI agents (this file)**     | Keep reading; skill: [`.cursor/skills/gds-compliant-frontend/SKILL.md`](.cursor/skills/gds-compliant-frontend/SKILL.md) |
| Dual-audience docs map        | [`docs/documentation-structure.md`](docs/documentation-structure.md), [`docs/README.md`](docs/README.md)                |
| Project purpose               | [`docs/project-purpose.md`](docs/project-purpose.md)                                                                    |
| Official guidance URLs        | [`docs/guidance-sources.md`](docs/guidance-sources.md)                                                                  |
| Stack / language (TypeScript) | [`docs/tech-stack.md`](docs/tech-stack.md)                                                                              |
| Sync from agnostic template   | [`docs/syncing-from-template.md`](docs/syncing-from-template.md)                                                        |

**Language rule:** This line is **TypeScript on Node**. Follow current TypeScript/Node ESM best practices for structure, typing, tests, and tooling — without weakening the non-negotiables below. **Prefer Nunjucks** (Frontend’s native macros) for component HTML instead of copy-pasting static HTML from each release.

**GOV.UK Frontend’s own stack:** Frontend ships as a **Node** package with **Nunjucks** macros, official `fixtures.json`, and `template.njk` sources. Refer to Node/Nunjucks directly for install, fixtures, macro options, encoding, and fixture-verification scripts.

**Guidance rule:** Prefer searching the URLs in [`docs/guidance-sources.md`](docs/guidance-sources.md) over inventing local policy.

## Non-negotiables

1. **GOV.UK Frontend macros are the HTML source of truth** — prefer rendering via Nunjucks macros (or an equivalent that tracks them). Do **not** copy-paste component HTML from release notes or the Design System site as the long-term approach.
2. **Exact HTML parity via fixtures** — set up official `fixtures.json` so backend output can be tested extensively at **100% parity** (byte-for-byte vs fixture `html` / Nunjucks output). No normalisation; never edit fixture `html` to pass tests.
3. **No frontend UI frameworks** — no React/Vue/Angular/Svelte (or similar) for GOV.UK UI; backend + GOV.UK Frontend only.
4. **No custom CSS** that restyles Frontend — only `govuk-*` classes; extend via component options.
5. **Components via macros / library API** — never hand-paste component `govuk-*` markup into pages.
6. **Patterns compose components** — Design System patterns are pages/journeys, not new low-level components, and have no fixture-parity suites.
7. **WCAG 2.2 AA baseline** — skip link, one `h1`, visible focus (never override yellow focus), keyboard paths, Error summary + field errors, `novalidate`.
8. **Progressive enhancement** — core tasks work without Frontend JS; keep `js-enabled` / `govuk-frontend-supported` and `initAll()`.
9. **Do not ship unreleased GOV.UK chrome** — wait for Frontend release + fixtures. See [`docs/govuk-frontend-roadmap.md`](docs/govuk-frontend-roadmap.md).
10. **100% code coverage** — functions, branches, and statements at **100%** for application/library code under test; CI must fail below that. Do not weaken fixture HTML equality to chase coverage. See [`docs/testing-components.md`](docs/testing-components.md).
11. **Always review the latest release notes** before upgrading — https://github.com/alphagov/govuk-frontend/releases/latest — then follow [`docs/upgrading-govuk-frontend.md`](docs/upgrading-govuk-frontend.md).

Using this repo does **not** make a service assessment-ready. See [`docs/service-assessment-readiness.md`](docs/service-assessment-readiness.md).

## Agent playbooks

| Task                                | Doc                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------- |
| Sync from agnostic template         | [`docs/syncing-from-template.md`](docs/syncing-from-template.md)       |
| Upgrade GOV.UK Frontend             | [`docs/upgrading-govuk-frontend.md`](docs/upgrading-govuk-frontend.md) |
| Add a component                     | [`docs/creating-components.md`](docs/creating-components.md)           |
| Add a pattern                       | [`docs/creating-patterns.md`](docs/creating-patterns.md)               |
| Layout / chrome                     | [`docs/layout-chrome.md`](docs/layout-chrome.md)                       |
| Fixture / parity testing            | [`docs/testing-components.md`](docs/testing-components.md)             |
| Page shell                          | [`docs/page-shell.md`](docs/page-shell.md)                             |
| Accessibility                       | [`docs/accessibility.md`](docs/accessibility.md)                       |
| Content & forms                     | [`docs/content-and-forms.md`](docs/content-and-forms.md)               |
| Design tokens (colour, type, space) | [`docs/design-tokens.md`](docs/design-tokens.md)                       |
| Guidance sources                    | [`docs/guidance-sources.md`](docs/guidance-sources.md)                 |
| Authoritative links                 | [`docs/authoritative-references.md`](docs/authoritative-references.md) |

## Quick page review

Before finishing a page change:

- [ ] Page template shell / before-content / single `h1` / title
- [ ] Macros / library API only for GOV.UK UI blocks (not pasted HTML)
- [ ] Back link **or** breadcrumbs — not both
- [ ] Forms: `novalidate`, Error summary + messages, values retained
- [ ] Focus styles untouched; no `outline: none`
- [ ] Trusted/sanitised HTML only; prefer plain text options
- [ ] Pattern guidance followed; out-of-scope widgets called out with inset text
- [ ] Coverage remains 100% functions / branches / statements for touched library code
- [ ] Fixture parity still green for any touched components

## Watching upstream

**Before every Frontend upgrade:** read https://github.com/alphagov/govuk-frontend/releases/latest (currently documents releases such as [v6.5.1](https://github.com/alphagov/govuk-frontend/releases/latest)).

Also: [roadmap](https://design-system.service.gov.uk/community/roadmap/), [upcoming](https://design-system.service.gov.uk/community/upcoming-components-patterns/), [all releases](https://github.com/alphagov/govuk-frontend/releases). Local: [`docs/govuk-frontend-roadmap.md`](docs/govuk-frontend-roadmap.md).

Upgrade only via [`docs/upgrading-govuk-frontend.md`](docs/upgrading-govuk-frontend.md). Do not invent dark mode, AI patterns, or unofficial chrome.
