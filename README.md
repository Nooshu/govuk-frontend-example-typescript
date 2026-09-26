# GOV.UK Frontend example

**Base template** for **GDS-compliant** government frontends: standardised backends (TypeScript, Go, Python, …) + **[GOV.UK Frontend](https://frontend.design-system.service.gov.uk/)** macros (**prefer Nunjucks**) — **no** React/Vue/Angular/Svelte for UI. Official fixtures enable **100% HTML parity** testing of backend output.

**Implementation language: TBD** — see [`docs/tech-stack.md`](docs/tech-stack.md).

## Priorities

Frontend web performance → frontend security → reduced maintenance → accessibility → inclusive design.

## Who should read what

| You are…            | Start here                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Human developer** | [`docs/onboarding.md`](docs/onboarding.md) → [`CONTRIBUTING.md`](CONTRIBUTING.md) → [`docs/`](docs/README.md)                                                  |
| **AI coding agent** | [`AGENTS.md`](AGENTS.md) → [`.cursor/skills/gds-compliant-frontend/`](.cursor/skills/gds-compliant-frontend/SKILL.md) → playbooks in [`docs/`](docs/README.md) |

How docs are split for both audiences: [`docs/documentation-structure.md`](docs/documentation-structure.md).

## Quick local checks (docs / Node tooling)

```sh
npm install
npm run verify:docs
```

## Licence note

GOV.UK Design System and Frontend are maintained by GDS. Crown copyright / OGL apply to GOV.UK content patterns as documented on GOV.UK.
