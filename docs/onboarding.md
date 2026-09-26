# Onboarding

Human-oriented map of this repository. Coding agents should treat [`AGENTS.md`](../AGENTS.md) as the dense entry point; humans should also read [`CONTRIBUTING.md`](../CONTRIBUTING.md). How docs are split for both audiences: [documentation-structure.md](documentation-structure.md).

## What this repo is

A **base template** for **GDS-compliant** frontends on **TypeScript / Node**: **GOV.UK Frontend** is the only UI library; **no frontend frameworks** for UI. Exact **HTML parity** against official Frontend fixtures. See [project-purpose.md](project-purpose.md). Sync shared docs from the agnostic template: [syncing-from-template.md](syncing-from-template.md).

**Stack:** TypeScript — [tech-stack.md](tech-stack.md). Prefer **Nunjucks macros** from `govuk-frontend`; keep Node scripts for fixtures and verification.

**Official guidance:** search the URLs in [guidance-sources.md](guidance-sources.md).

**Priorities:** frontend web performance → frontend security → reduced maintenance → accessibility → inclusive design ([priorities.md](priorities.md)).

**HTML:** prefer **Nunjucks macros**; fixtures for extensive **100% parity** tests. Before Frontend upgrades, always read https://github.com/alphagov/govuk-frontend/releases/latest.

## Priorities

See [priorities.md](priorities.md). Short version: frontend web performance → frontend security → reduced maintenance → accessibility → inclusive design.

## Components vs patterns

| Kind          | What it is                                                               | How we build it                                  | Fixture parity?                                                         |
| ------------- | ------------------------------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------- |
| **Component** | Design System building block (button, text input, …)                     | Library wrapper that renders exact Frontend HTML | **Yes** — official `fixtures.json`                                      |
| **Pattern**   | Guidance for a journey or page composition (addresses, check answers, …) | Compose shipped components into pages            | **No** — follow Design System guidance; no invented pattern HTML suites |

## Repo map

```text
AGENTS.md                 # Slim agent playbook
docs/                     # All documentation (this folder)
src/                      # TypeScript application (ESM)
  main.ts                 # npm start
  app.ts                  # Routes and the Node HTTP server
  components/             # Nunjucks macro renderer, fixtures, catalogue
  views/                  # Page templates (layout, service, demos)
  service/                # Rod licence journey
  http/                   # Request body, cookies, assets, security headers
  pages/                  # Page document around the Frontend template
  session/                # In-memory session
```

Detail: [example-service.md](example-service.md) and [tech-stack.md](tech-stack.md).

## Run modes

| Mode    | Command          | Purpose                                                                    |
| ------- | ---------------- | -------------------------------------------------------------------------- |
| Preview | `npm start`      | Example service, component catalogue, and fixture previews                 |
| Test    | `npm test`       | Fixture parity and service tests. Fails below 100% coverage                |
| Verify  | `npm run verify` | Docs, typecheck, and the full test suite                                   |
| Upgrade | see the playbook | Frontend bump — [upgrading-govuk-frontend.md](upgrading-govuk-frontend.md) |

## Testing mindset

1. **Parity checks** compare library output to fixture `html` with ordinal string equality.
2. **Never** edit fixture `html` to make tests pass — fix the renderer.
3. **Never** normalise HTML in tests.
4. **Nunjucks suite** (Node) catches **stale fixtures**; library tests catch **renderer drift**.

Details: [testing-components.md](testing-components.md).

## Troubleshooting

| Symptom                        | Likely cause                                                |
| ------------------------------ | ----------------------------------------------------------- |
| Parity fails on whitespace     | Renderer ≠ Nunjucks `template.njk` / `{%-` stripping        |
| Encoding differs (`'` vs `'`)  | Used framework HTML encoder instead of Nunjucks `escape`    |
| Attribute order differs        | Built attributes in code property order, not template order |
| Preview/fixture 404 in tests   | Test host not enabling Dev/Testing routes                   |
| Logo unreadable / wrong header | Frontend 5 header classes with Frontend 6+ CSS              |
| Editing fixtures “fixes” tests | Wrong fix — update renderer                                 |

More pitfalls: [creating-components.md](creating-components.md).

## Consistency tooling

```sh
npm install
npm start
npm test
npm run verify:docs   # Prettier + markdownlint
npm run verify
```

See [CONTRIBUTING.md](../CONTRIBUTING.md). Dotfiles: `.editorconfig`, `.prettierrc.json`, `.markdownlint-cli2.jsonc`, `.nvmrc`, `.vscode/`, `.cursor/rules/`, `.github/`.

## Next reads

1. [documentation-structure.md](documentation-structure.md)
2. [tech-stack.md](tech-stack.md)
3. [page-shell.md](page-shell.md) and [layout-chrome.md](layout-chrome.md)
4. [govuk-components.md](govuk-components.md)
5. [service-assessment-readiness.md](service-assessment-readiness.md)
6. [upgrading-govuk-frontend.md](upgrading-govuk-frontend.md)
