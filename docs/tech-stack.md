# Tech stack

**Status: TypeScript (Node)** — this is the TypeScript specialised line of [govuk-frontend-example](https://github.com/Nooshu/govuk-frontend-example).

Sync shared docs/dotfiles from the language-agnostic template: [syncing-from-template.md](syncing-from-template.md).

## Two layers

| Layer                          | Stack                                                                                               | Notes                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **GOV.UK Frontend (upstream)** | **Node** package (`govuk-frontend`), **Nunjucks** macros (`template.njk`), official `fixtures.json` | Fixed by GDS. Always name Node/Nunjucks for install, fixtures, macros, encoding, verification.       |
| **This line (wrapper)**        | **TypeScript** on **Node** (≥22), ESM (`"type": "module"`)                                          | Server-side HTML from Frontend **macros** (prefer Nunjucks). **No** React/Vue/Angular/Svelte for UI. |

## TypeScript conventions

Follow current TypeScript / Node ESM best practices:

- `strict` and related flags in `tsconfig.json` (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`)
- ESM only (aligned with user preference for JavaScript ESM)
- Prefer calling **Nunjucks macros** from `govuk-frontend` for component HTML; thin TypeScript wrappers around options → HTML only when needed — still fixture-parity
- Tests: Node’s built-in test runner via `tsx` (`npm test`)
- Coverage gate when the library grows: **100%** functions, branches, statements (see [testing-components.md](testing-components.md))

## Consistency tooling

```sh
npm install
npm run verify:docs    # Prettier + markdownlint
npm run typecheck
npm test
npm run verify         # docs + typecheck + tests
npm run sync:template  # pull shared paths from language-agnostic template
```

See [CONTRIBUTING.md](../CONTRIBUTING.md).

## Version pin

| Item                              | Value                                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Implementation language           | TypeScript 5.x on Node ≥22                                                                                                 |
| Templating / component approach   | Prefer Nunjucks macros from `govuk-frontend`; TypeScript for app/library logic                                             |
| `govuk-frontend` (Node)           | _TBD — set on first install; check [latest release](https://github.com/alphagov/govuk-frontend/releases/latest)_           |
| Nunjucks fixture verification     | _TBD — Node scripts under tests/_                                                                                          |
| Page template reference           | https://design-system.service.gov.uk/styles/page-template/                                                                 |
| Fixture testing guide             | https://frontend.design-system.service.gov.uk/testing-your-html/                                                           |
| Upgrade / test / preview commands | `npm run sync:template`, `npm run verify`; Frontend upgrade per [upgrading-govuk-frontend.md](upgrading-govuk-frontend.md) |

## Hard constraints (always)

Same as the language-agnostic template: one Frontend pin, macros over pasted HTML, fixture parity, no custom CSS restyling Frontend, no SPA UI frameworks, 100% coverage for application code, review https://github.com/alphagov/govuk-frontend/releases/latest before upgrades.

See [`AGENTS.md`](../AGENTS.md), [guidance-sources.md](guidance-sources.md), [creating-components.md](creating-components.md).
