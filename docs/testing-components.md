# Testing components

How we keep **100% HTML parity** with GOV.UK Frontend — now and after upgrades.

Authoritative upstream: https://frontend.design-system.service.gov.uk/testing-your-html/

**Stacks:** Prefer generating HTML via **Nunjucks macros** from `govuk-frontend`. Where the backend wraps or re-implements macros, parity tests compare that output to official fixtures. **Nunjucks fixture verification** uses **Node** and the pinned package.

## Why fixtures exist

Official `fixtures.json` files are the contract for **extensive 100% HTML parity testing** of whatever backend generates frontend markup. Set them up from day one so every shipped component can prove byte-for-byte equality against Frontend — and so upgrades catch drift automatically.

Do **not** treat copy-pasted HTML from Design System examples or release notes as the source of truth; macros + fixtures are.

## Coverage gate (100% code)

Application and library code under test must maintain **100%** coverage of:

- **functions**
- **branches**
- **statements**

Wire the language’s coverage tool so local verify and CI **fail** below 100% on all three. Do **not** normalise fixture HTML or skip parity cases to inflate coverage. Exclude only generated/vendor assets and explicit, documented exceptions (if any) in [tech-stack.md](tech-stack.md).

## Layers

| Layer                          | What it proves                                | How                                                                                                              |
| ------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Parity suite**               | Backend / library HTML matches fixture `html` | Map fixture `options` → render (macro or wrapper) → ordinal string equality — cover **all** fixtures extensively |
| **Nunjucks suite**             | Stored fixtures still match Frontend macros   | Node scripts render via `govuk-frontend` Nunjucks; compare to fixture `html`                                     |
| **HTTP smoke** (if applicable) | Preview/fixture surfaces wired                | Hit preview and raw-fixture endpoints in a Testing env                                                           |
| **Structural**                 | Nav lists components; no demos on index       | Assert homepage entries and absence of embedded demos                                                            |
| **Fixture sync**               | App fixtures ≡ Nunjucks-suite copies          | Byte-identical file check                                                                                        |

## Hard rules

1. **Never** edit fixture `html` to make tests pass.
2. **Never** normalise or pretty-print HTML before compare.
3. **Never** mix Frontend versions between CSS/JS and fixtures.
4. Prefer in-process parity for the bulk of cases (fast, no HTTP); aim to exercise **every** fixture for each shipped component.
5. After upgrade, both the **Nunjucks suite** and library parity must be green — see [upgrading-govuk-frontend.md](upgrading-govuk-frontend.md). Always read https://github.com/alphagov/govuk-frontend/releases/latest first.

## Encoding

Parity depends on **Nunjucks `escape`** (`&#39;` for `'`, real newlines in textarea values). Use the shared helper in [creating-components.md](creating-components.md) when not calling Nunjucks directly.

## Commands

Document in [tech-stack.md](tech-stack.md):

- library / parity tests (all fixtures)
- coverage report enforcing **100%** functions, branches, statements
- Nunjucks fixture verification (Node + `govuk-frontend`)
- a single “verify” gate for local + CI

## Preview as human parity browser

Previews render **one selected fixture**, show library HTML beside official `html`, and display a parity success/fail banner. Details: [preview-server.md](preview-server.md).

## Adding tests for a new component

Follow steps 8–9 in [creating-components.md](creating-components.md). Clone the closest sibling’s parity tests and Nunjucks render script; cover every fixture name.
