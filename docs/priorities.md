# Priorities

Ordered priorities for projects from this template. When trade-offs conflict, prefer the higher item.

## 1. Frontend web performance

- Ship only the GOV.UK Frontend CSS/JS the page needs; no competing UI frameworks or heavy client bundles.
- Prefer progressive enhancement and server-rendered HTML over client-side UI frameworks.
- Prefer **Nunjucks macros** (or thin wrappers that call them) so you are not maintaining pasted HTML that bloats reviews and drifts between releases.
- Keep preview/debug assets off production layouts; measure asset size and init cost on Frontend upgrades.

## 2. Frontend security

- Treat any `html` component options as untrusted until sanitised; prefer `text`.
- Do not inject arbitrary markup or bypass Frontend encoding (match Nunjucks `escape` for parity).
- Keep Frontend JS on progressive enhancement; avoid expanding the client attack surface with extra SPA frameworks.
- Stay current on Frontend releases — always review https://github.com/alphagov/govuk-frontend/releases/latest before upgrading ([upgrading-govuk-frontend.md](upgrading-govuk-frontend.md)).

## 3. Reduced maintenance

- One pinned `govuk-frontend` version; CSS/JS/fixtures stay in lockstep.
- Generate HTML from **Frontend macros** where possible — not by copy-pasting HTML from each release into templates.
- Extensive **fixture parity** tests catch drift early so upgrades are mechanical, not archaeological.
- Watch roadmap/releases before inventing components ([govuk-frontend-roadmap.md](govuk-frontend-roadmap.md)).
- Use the chosen language’s idiomatic tooling ([tech-stack.md](tech-stack.md)); automate sync; humans for visual QA.

## 4. Accessibility

- WCAG 2.2 AA baseline for every component and pattern.
- Keyboard-only paths, visible focus (never override Frontend yellow focus), one `h1`, skip link, landmarks.
- Error summary + field errors; labels/legends as headings where appropriate.
- Progressive enhancement so core journeys work without JavaScript.
- Design System usage alone is not enough — see [accessibility.md](accessibility.md) and [service-assessment-readiness.md](service-assessment-readiness.md).

## 5. Inclusive design

- High contrast, generous spacing, touch targets ≥ 40px via Frontend components.
- Plain English (reading age ~9 where possible); [content-and-forms.md](content-and-forms.md).
- Do not rely on colour alone; pair with text or icons from components.
- Plan for [assisted digital](https://www.gov.uk/service-manual/helping-people-to-use-your-service/assisted-digital-support-introduction) outside the UI layer — document gaps rather than assuming the template solves them.

## Supporting practices (not ranked above)

- GDS compliance via Service Standard / TCoP / Design System ([guidance-sources.md](guidance-sources.md)).
- Usability: one thing per page, back link **or** breadcrumbs, clear content.
- Documentation under `/docs`; slim [`AGENTS.md`](../AGENTS.md).
- **100%** code coverage (functions, branches, statements) plus **100%** HTML fixture parity where fixtures exist.
