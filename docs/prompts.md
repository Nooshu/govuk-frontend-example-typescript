# Prompts that generated this template

These are the prompts sent to the agent, in order, to create this TypeScript example.
The first session built the language-agnostic template and then created this repository from it.
The later prompts, in this repository, added the example service and this log.
Agent replies are not included. The wording below is unchanged.

## 1. Create the agent playbook from the GOV.UK Frontend brief

- **When:** Friday, Jul 31, 2026, 9:40 AM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Ignore the [language] in this request I want you to create an Agents.md file based off this prompt. The language will be defined at a later date:
I want you to build me an example GOV.UK Frontend implementation in [language], that natively recreates all the patterns and components in the [language] 2026 best practice templating language. Make sure to use GOV.UK Frontend test fixtures to maintain 100% parity with the HTML, now and into the future. The priority for this example should be:

Accessibility
GDS Compliance
Web Performance
Maximise inclusivity
Usability for the user
Ongoing maintenance
Documentation

There should be a solid, simple, and documented update plan for GOV.UK Frontend. All documents should be stored in the /docs folder, and the AGENTS.md file should be kept slim and succinct and reference other documents in the repository.

The rest of the file can be restructured off this:
<!-- ============================================================
  GOV.UK Design System — Copilot Instructions
  ============================================================
  Service: GOV.UK Design System
  Owner:   Government Digital Service (GDS)
  Crown:   ♛ GOV.UK
  ============================================================
  This file defines design tokens and conventions for consistent
  UI generation aligned with GOV.UK Frontend patterns.
  ============================================================ -->

♛ GOV.UK

---

**GOV.UK Design System**

---

<strong>LIVE</strong> — This design system is used across government services. [Help us improve it — give feedback](https://design-system.service.gov.uk/community/feedback/).

---

# GOV.UK Service

## Overview  
A purposeful, accessible design system for government digital services. The aesthetic prioritises clarity and usability — high contrast typography and generous spacing. Designed for citizens who need to complete essential tasks efficiently.

**Human onboarding:** new developers should read [`docs/onboarding.md`](docs/onboarding.md) (repo map, run modes, components vs patterns, testing, troubleshooting). This `AGENTS.md` file remains the dense playbook for coding agents and detailed UI rules.

## Tech Stack
Use .NET Razor Pages (`.cshtml`). Use `govuk-` CSS classes from GOV.UK Frontend for all styling. Do not write custom CSS.

## Shared helpers (do not reinvent)

| Helper | Path | Use |
| --- | --- | --- |
| `GovUkHtml.Escape` / `AppendAttributes` | `src/Api/Components/GovUk/GovUkHtml.cs` | Nunjucks-style encoding + attributes in every renderer |
| `GovUkFixtureLoader.Load` | `src/Api/Components/GovUk/GovUkFixtureLoader.cs` | Cached `fixtures.json` for Previews/Fixtures pages |
| `AppChrome` | `src/Api/Layout/AppChrome.cs` | Static skip link / header / footer models for `_Layout.cshtml` |
| `PatternChrome.BackToPatterns` | `src/Api/Layout/PatternChrome.cs` | Shared back link on pattern demos |
| `AppServiceNavigation.ForPath` | `src/Api/Layout/AppServiceNavigation.cs` | Components / Patterns service nav |

Human architecture notes: [`docs/layout-chrome.md`](docs/layout-chrome.md), [`docs/testing-components.md`](docs/testing-components.md).

## Service assessment readiness (agent playbook)

Use this whenever building or reviewing pages, components, or patterns so work in this repository stays aligned with a **GOV.UK Service Standard** assessment — especially points **4** (simple to use), **5** (everyone can use the service), **11** (tools), **13** (common components and patterns), and **14** (reliable).

Full checklist and source links: [`docs/service-assessment-readiness.md`](docs/service-assessment-readiness.md).

**Using the Design System or this repo does not automatically make a service accessible or assessment-ready.** Still need user research (including disabled users), an accessibility audit, an accessibility statement by public beta, assisted digital planning, and operational evidence. See the [Design System accessibility overview](https://design-system.service.gov.uk/accessibility/) and [Making your service accessible](https://www.gov.uk/service-manual/helping-people-to-use-your-service/making-your-service-accessible-an-introduction).

### Authoritative references (check when unsure)

| Need | Where |
| --- | --- |
| Service Standard (14 points) | https://www.gov.uk/service-manual/service-standard |
| Service Standard (local summary) | [`docs/service-standard.md`](docs/service-standard.md) |
| Service Manual (full guidance) | https://www.gov.uk/service-manual |
| Technology Code of Practice | https://www.gov.uk/guidance/the-technology-code-of-practice |
| Technology Code of Practice (local) | [`docs/technology-code-of-practice.md`](docs/technology-code-of-practice.md) |
| Styles / components / patterns | https://design-system.service.gov.uk/ |
| Frontend install, JS, fixtures, browsers | https://frontend.design-system.service.gov.uk/ |
| Page shell | https://design-system.service.gov.uk/styles/page-template/ |
| Labels/legends as headings | https://design-system.service.gov.uk/get-started/labels-legends-headings/ |
| Focus states | https://design-system.service.gov.uk/get-started/focus-states/ |
| Exact HTML parity | https://frontend.design-system.service.gov.uk/testing-your-html/ |
| Browser grades / no-JS | https://frontend.design-system.service.gov.uk/browser-support/ |
| Production include Frontend | https://design-system.service.gov.uk/get-started/production/ |
| Frontend roadmap / upcoming components | https://design-system.service.gov.uk/community/roadmap/ |
| Frontend roadmap (local summary) | [`docs/govuk-frontend-roadmap.md`](docs/govuk-frontend-roadmap.md) |
| Design System cycle board | https://github.com/orgs/alphagov/projects/53 |
| Frontend release notes | https://github.com/alphagov/govuk-frontend/releases |

### Watching upstream (do not invent)

Before adding a component that is not yet in this repo, check the [roadmap](https://design-system.service.gov.uk/community/roadmap/), [upcoming components](https://design-system.service.gov.uk/community/upcoming-components-patterns/), and [releases](https://github.com/alphagov/govuk-frontend/releases). Local summary: [`docs/govuk-frontend-roadmap.md`](docs/govuk-frontend-roadmap.md).

- **In progress upstream (as of July 2026):** Feedback link, Language switcher, experimental publishing — wait for a Frontend release + official fixtures.
- **Next priority upstream:** Autocomplete (replacement for Accessible autocomplete).
- **Already covered here:** Frontend **6.4.0** (including interruption Panel, Generic header from 6.3.0).
- **Do not** hand-build unofficial GOV.UK chrome for dark mode, AI patterns, or unreleased components. Upgrade with `make upgrade-frontend`, then follow the new-component playbook.

### Non-negotiables for assessment-shaped UI

1. **Reuse common components and patterns** ([point 13](https://www.gov.uk/service-manual/service-standard/point-13-use-common-standards-components-patterns)) — `GovUk*` ViewComponents and `/Patterns/*`; never invent one-off `govuk-*` chrome or step-nav CSS.
2. **Look and behave like GOV.UK** ([point 4](https://www.gov.uk/service-manual/service-standard/point-4-make-the-service-simple-to-use)) — page template, Frontend **6.4.0** CSS/JS, sentence case, one primary action, one thing per page where possible.
3. **WCAG 2.2 AA baseline** ([point 5](https://www.gov.uk/service-manual/service-standard/point-5-make-sure-everyone-can-use-the-service)) — skip link, one `h1`, visible focus (never override yellow focus), keyboard-only paths, Error summary + field errors, `novalidate`.
4. **Progressive enhancement** — keep the body class snippet (`js-enabled` / `govuk-frontend-supported`); run `initAll()`; core tasks must work without Frontend JS ([browser support](https://frontend.design-system.service.gov.uk/browser-support/)).
5. **Exact Frontend HTML for components** — fixture parity ([testing your HTML](https://frontend.design-system.service.gov.uk/testing-your-html/)); sanitise any `Html` options.
6. **Reliable downtime UX** ([point 14](https://www.gov.uk/service-manual/service-standard)) — use Page not found / Problem with the service / Service unavailable patterns; cookies page + cookie banner by public beta.
7. **No custom CSS** that restyles Frontend; extend via component options, not new stylesheets.

### Quick page review (agents)

Before finishing a page change:

- [ ] Layout shell / `BeforeContent` / single `h1` / title
- [ ] ViewComponents only for GOV.UK UI blocks
- [ ] Back link **or** breadcrumbs — not both
- [ ] Forms: `novalidate`, errors via Error summary + messages, values retained
- [ ] Focus styles untouched; no `outline: none` hacks
- [ ] Trusted/`sanitised` HTML only; prefer `Text`
- [ ] Pattern guidance linked; out-of-scope widgets called out with inset text

### Outside this repo (still needed for assessment)

User research evidence, assisted digital, privacy/security, performance KPIs, open source policy, published accessibility statement, and an accessibility audit before public beta — see [`docs/service-assessment-readiness.md`](docs/service-assessment-readiness.md).

## Header / layout chrome

Every page MUST use the layout shell in `Pages/Shared/_Layout.cshtml`. That layout invokes ViewComponents with **`AppChrome`** models — do not invent custom header/skip-link/footer HTML on pages.

**Required structure (already in layout):**
- Outer `<header class="govuk-template__header">` wrapping masthead + service navigation
- Masthead via **`GovUkHeader`** (`AppChrome.Header`, including `data-module="govuk-header"`)
- Service name via **`GovUkServiceNavigation`** (`AppServiceNavigation.ForPath`) under the masthead — not inside the blue header
- Skip link via **`GovUkSkipLink`** (`AppChrome.SkipLink` → `#content`)
- Footer via **`GovUkFooter`** (`AppChrome.Footer`)
- Pattern demos: **`PatternChrome.BackToPatterns`** in `@section BeforeContent`

**Do:**
- Match Frontend 6.4 markup already in `_Layout.cshtml` / Header fixtures
- Keep the logotype SVG complete (path data must be present)
- Put the service name in service navigation

**Do not:**
- Hand-write skip link / header / footer `govuk-*` chrome on pages
- Use Frontend 5 header classes (`govuk-header__link--homepage`, `govuk-header__service-name` inside the blue bar)
- Add a black rectangle/banner or custom dark header in place of the brand blue masthead
- Put the service name inside the blue `govuk-header` block

## Colours  
| Category          | Token                 | Hex       | Notes                                 |  
| ----------------- | --------------------- | --------- | ------------------------------------- |  
| **Text**          | text                | #0b0c0c | Primary body text                     |  
|                   | secondary-text      | #484949 | Secondary text                        |  
|                   | inverse-text        | #ffffff | Use for text on dark backgrounds      |  
| **Link**          | link                | #1a65a6 | Default link colour                   |  
|                   | link-hover          | #0f385c | Hover state                           |  
|                   | link-visited        | #54319f | Visited links                         |  
|                   | link-active         | #0b0c0c | Active link state                     |  
| **Border**        | border              | #cecece | Standard borders                      |  
|                   | input-border        | #0b0c0c | Input field borders                   |  
| **Background**    | template-background | #f4f8fb | Match the html element background     |  
|                   | body-background     | #ffffff | Match the body element background     |  
| **Focus State**   | focus               | #ffdd00 | Use only to indicate keyboard focus   |  
|                   | focus-text          | #0b0c0c | Text colour on focused elements       |  
| **Error State**   | error               | #ca3535 | Error messages and error indicators   |  
| **Success State** | success             | #0f7a52 | Success messages and indicators       |  
| **Hover State**   | hover               | #cecece | Input hover states                    |  
| **Brand**         | brand               | #1d70b8 | Primary brand colour                  |  
| **Surface**       | surface-background  | #f4f8fb | Surface backgrounds                   |  
|                   | surface-text        | #0b0c0c | Text on surface backgrounds           |  
|                   | surface-border      | #8eb8dc | Surface borders                       |

## Typography  
**Display Font**: GDS Transport — loaded from GOV.UK Frontend assets  
**Body Font**: GDS Transport — consistent font family throughout  
**Code Font**: monospace — system default for code blocks and technical content

All text uses GDS Transport at regular (400) and bold (700) weights only. The custom typeface was designed specifically for digital government services, optimised for screen reading and accessibility. Large text uses tight letter spacing for efficiency. Body text prioritises maximum legibility at various sizes.

Type scale: Display 48px, Headline 36px, Section heading 24px, Subhead 19px, Body 19px, Small 16px, Caption 14px.

## Elevation  
Minimal shadow usage. Cards and panels use 1px borders only. Focus states use thick yellow borders (4px) rather than shadows for maximum visibility. Error summaries and important banners gain subtle shadows (0 2px 4px rgba(0,0,0,0.1)). Modals use backdrop with no shadow. The header remains flat with a 1px bottom border. All elevation serves accessibility and task completion.

## Components  
**Header**: Via `AppChrome` + `GovUkHeader` ViewComponent — blue brand masthead with white GOV.UK logotype SVG (`fill="currentcolor"`, include `<title>GOV.UK</title>`). Homepage link uses `govuk-header__homepage-link`. Service name belongs in `govuk-service-navigation` under the masthead (`AppServiceNavigation`), inside `<header class="govuk-template__header">`. Do not put the service name inside the blue header (Frontend 6+).  
**Start Button**: Green button with class `govuk-button govuk-button--start`. Contains visible text "Start now" followed by an inline arrow SVG: `<svg class="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" focusable="false" aria-hidden="true"><path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"/></svg>`  
**Buttons**: Primary uses GOV.UK green (#00703C) fill with white text, no radius, bold weight. Secondary uses transparent bg with 2px dark blue border. Warning uses red (#d4351c) bg with white text. All buttons are 40px minimum height for touch accessibility. Hover darkens background colour. Focus adds 4px yellow border offset.  
**Cards**: White background, 1px mid-grey border (#B1B4B6), no radius, 20px padding. Service cards show status with coloured left stripe (5px). No hover effects — interaction happens through contained buttons only.  
**Inputs**: 1px black border (#0b0c0c), white background, no radius, 8px padding. Font size 19px minimum for mobile accessibility. Focus: thick black border (4px) with yellow outline. Error: red border with error message below. Labels are 19px bold above input.  
**Radios/Checkboxes**: 24px touch targets, high contrast borders. Selected state uses thick borders and fills. Focus adds yellow outline. Always paired with clear labels.  
**Error Summary**: Red left border (5px), light red background tint, bold heading, bulleted list of linked errors. Positioned at page top for screen readers.  
**Info Notice**: Uses `role="note"` with `aria-label="Information"` for informational callouts within page content.  
**Phase Banner**: Coloured tag (alpha/beta/live) with explanatory text, positioned below header, spans full width.  
**Breadcrumbs**: Use the `GovUkBreadcrumbs` ViewComponent (`govuk-breadcrumbs`). Place before `main` via `BeforeContent`. Never combine with a back link. See **Breadcrumbs (agent usage)**.  
**Footer**: Grey background. Must include OGL licence text: "All content is available under the Open Government Licence v3.0, except where otherwise stated" with link to nationalarchives.gov.uk. Crown copyright link on the right. Uses class `govuk-footer`.
**GOV.UK ViewComponents**: Implement Design System components as Razor ViewComponents under `src/Api/Components/GovUk/`. Follow **Creating a new GOV.UK component (agent playbook)** for fixtures, renderer, preview, homepage nav, and exact HTML parity. Accordion, back link, breadcrumbs, button, character count, checkboxes, cookie banner, date input, details, error message, error summary, exit this page, fieldset, file upload, generic header, GOV.UK footer, GOV.UK header, inset text, notification banner, pagination, panel, password input, phase banner, radios, select, service navigation, skip link, summary list, table, tabs, tag, task list, text input, textarea, and warning text are the reference implementations.
**GOV.UK patterns**: Design System *patterns* (e.g. Addresses, Confirmation pages) are **composed Razor Pages**, not new ViewComponents. Follow **Creating a new GOV.UK pattern (agent playbook)**. For Design System **Pages** patterns, also follow **Creating Pages patterns** — always use shipped ViewComponents and the [page template](https://design-system.service.gov.uk/styles/page-template/) accessibility rules. Do not invent pattern HTML or add fixture-parity suites for patterns.

## Upgrading GOV.UK Frontend (agent playbook)

When the user asks to upgrade `govuk-frontend` to a new release, follow this playbook. Full detail: [`docs/upgrading-govuk-frontend.md`](docs/upgrading-govuk-frontend.md).

### What you can automate

1. **Mechanical sync + verify (Make)** — `make upgrade-frontend VERSION=X.Y.Z` (runs the Node script, then `test-fixtures` and `test`). Dry-run with `DRY_RUN=1`. Skip tests with `SKIP_TESTS=1` only if you will verify separately.
2. **Renderer fixes** — if `make test` failed, update `*Renderer.cs` / `*OptionsMapper.cs` / models until fixture HTML matches **exactly**.
3. **Layout** — apply page-template changes from release notes to `_Layout.cshtml` when required.
4. **Docs sweep** — `rg` for the old version string; update leftovers.

### Hard rules

- **Never** edit fixture `html` to make tests pass.
- **Never** add HTML normalisation or loosen string equality in parity tests.
- **Never** invent custom CSS.
- Do **not** commit unless the user asks.
- Summarise upstream [release notes](https://github.com/alphagov/govuk-frontend/releases/latest) before changing files; flag major-version risk.
- After the script, if `make test-fixtures` fails, fix fixture copies / mapping (Text input = upstream `input`) — do not rewrite Nunjucks scripts to hide diffs.
- When adding a **new** component after an upgrade, also add it to `COMPONENTS` in `scripts/upgrade-govuk-frontend.mjs`.

### Stop conditions

Report done only when `make test-fixtures` and `make test` are green, and list what still needs human visual QA (`make preview`).

## Creating a new GOV.UK component (agent playbook)

Use this section whenever implementing a **new** Design System **component** as a Razor ViewComponent (details, checkboxes, error summary, inset text, and so on). Copy an existing sibling — do not invent a different architecture.

If the user asked for a Design System **pattern** (under `/patterns/` on the Design System site, e.g. Addresses, Names, Check answers), use **Creating a new GOV.UK pattern (agent playbook)** instead — do not create a new ViewComponent folder or fixtures.

**Which sibling to copy**

| If the component is… | Start from |
| --- | --- |
| Single element / simple attributes | `BackLink` or `Button` |
| List of items | `Breadcrumbs` or `Accordion` |
| Form control that **composes** other macros (label, hint, error, textarea, …) | `CharacterCount` (and read every nested `template.njk` it imports) |

Official fixture testing guidance: https://frontend.design-system.service.gov.uk/testing-your-html/#using-the-html-test-files

Human-readable docs (also keep in sync when you add a component):
- `docs/govuk-components.md` — architecture overview
- `docs/testing-components.md` — how to run parity / fixture tests
- `docs/upgrading-govuk-frontend.md` — bump Frontend version and refresh fixtures (**includes AI automation guidance**)
- `docs/preview-server.md` — `make preview`
- `docs/govuk-*.md` — per-component deep dives

### Goals (non-negotiable)

1. **GOV.UK Frontend is the source of truth** — use official CSS/JS already in `wwwroot/`, and official `fixtures.json` from the matching `govuk-frontend` version (currently **6.4.0**).
2. **C# options mirror Nunjucks macros** — property names and shapes align with `macro-options.json` / fixture `options` (`text`/`html` pairs, `classes`, `attributes`, and so on).
3. **Exact HTML parity** — renderer output must equal each fixture’s `html` field **byte-for-byte** (ordinal string equality). No HTML normalisation, no “close enough”.
4. **Never hand-write component markup in pages** — pages always invoke the ViewComponent.
5. **Do not write custom CSS** — only `govuk-*` classes from Frontend.
6. **Register on the home page** — every shipped component gets a `ComponentNavItem` in `Index.cshtml.cs` so `/` lists its preview (nav only — no live demos on Index).

### Reference implementation

| Piece | Example path (copy this pattern) |
| --- | --- |
| Component folder | `src/Api/Components/GovUk/Button/` (or `CharacterCount/` for form composites) |
| Models | `GovUkButtonModels.cs` |
| ViewComponent | `GovUkButtonViewComponent.cs` |
| Exact HTML renderer | `GovUkButtonRenderer.cs` |
| Fixture → model mapper | `GovUkButtonOptionsMapper.cs` |
| Official fixtures | `fixtures.json` |
| Preview page | `src/Api/Pages/Previews/Button.cshtml(.cs)` |
| Raw fixture endpoint | `src/Api/Pages/Fixtures/Button.cshtml(.cs)` |
| Shared HTML source block | `Pages/Shared/_HtmlSource.cshtml` (highlighted `<pre><code class="language-html">`) |
| Structural tests | `tests/Api.Tests/ButtonComponentTests.cs` |
| Parity tests | `tests/Api.Tests/ButtonFixtureParityTests.cs` |
| Nunjucks check | `tests/govuk-fixtures/render-button-fixtures.mjs` |

### Target folder layout for component `Name`

```text
src/Api/Components/GovUk/<Name>/
  GovUk<Name>Models.cs
  GovUk<Name>ViewComponent.cs          # class name → invoke as "GovUk<Name>"
  GovUk<Name>Renderer.cs               # builds exact HTML string
  GovUk<Name>OptionsMapper.cs          # fixtures.json options → view model
  fixtures.json                        # from govuk-frontend (do not invent html)

src/Api/Pages/Previews/<Name>.cshtml(.cs)   # Dev/Testing only
src/Api/Pages/Fixtures/<Name>.cshtml(.cs)   # raw HTML fragment; Dev/Testing only

tests/Api.Tests/<Name>ComponentTests.cs
tests/Api.Tests/<Name>FixtureParityTests.cs
tests/govuk-fixtures/<kebab-name>.fixtures.json   # same fixtures, for Nunjucks
tests/govuk-fixtures/render-<kebab-name>-fixtures.mjs
```

Namespace: `Api.Components.GovUk.<Name>`. Add `@using` in `Pages/_ViewImports.cshtml`.

### Recommended work order (fastest path to green)

1. **Copy fixtures** into the component folder and `tests/govuk-fixtures/`.
2. **Dump every fixture’s `html` + `options`** (script or inspect) and open `template.njk` (+ any macros it imports). Note attribute order and `{%-` / `-%}` whitespace stripping.
3. **Models + mapper + renderer** together — do not write free-form Razor for the component body.
4. **Clone** Fixtures/Previews pages, tests, and Nunjucks script from the closest sibling; wire `Api.csproj`, `Api.Tests.csproj`, `_ViewImports`, `package.json` scripts.
5. **Homepage nav** + Index smoke assert for `/Previews/<Name>`.
6. Run `make test` → fix renderer/mapper only → then `make test-fixtures` → docs / agent-usage section.
7. Visual check with `make preview` (preview pages must render **only the selected** fixture — see `Pages/Previews/Button.cshtml.cs`).

Do **not** embed live demos on the home page. Do **not** invent fixture HTML.

### Step-by-step checklist

#### 1. Obtain official fixtures

1. Confirm Design System docs for the component (when to use / when not to use).
2. From `govuk-frontend@6.4.0` (same version as CSS/JS in `wwwroot`), copy:
   - `dist/govuk/components/<kebab-name>/fixtures.json`
   - Also skim `template.njk` and `macro-options.json` in that folder.
3. Place as `src/Api/Components/GovUk/<Name>/fixtures.json`.
4. Also copy to `tests/govuk-fixtures/<kebab-name>.fixtures.json` for the Nunjucks suite.
5. **Never edit fixture `html` to make tests pass.** If Razor diverges, fix the C# renderer/mapper. Refresh fixtures only when upgrading `govuk-frontend`.

Each fixture entry typically has: `name`, `hidden`, `options`, `html`.

#### 2. Define C# models (Nunjucks-aligned)

- Root view model mirrors macro options (`Id`, `Classes`, `Attributes`, component-specific props).
- Reuse a `GovUkTextOrHtml`-style type for every `text`/`html` option pair:
  - Prefer `Text` for plain copy (encoded).
  - Use `Html` only for **trusted** markup; if both set, `Html` wins.
  - Sanitise untrusted input before setting `Html`.
- Map JSON names carefully (`headingLevel` → `HeadingLevel`, `isStartButton` → `IsStartButton`, and so on).
- Handle fixture edge cases explicitly:
  - Falsy array entries / missing optional objects (accordion).
  - **Tri-state booleans** as `bool?` when Nunjucks distinguishes *unset* from `false` (e.g. button `preventDoubleClick`, character-count `spellcheck`).
  - Nested objects (`label`, `hint`, `errorMessage`, `formGroup`, i18n plural maps).

#### 3. Implement the renderer (not a free-form Razor view for the body)

Prefer a dedicated `GovUk<Name>Renderer.Render(model)` that returns a `string`, invoked from the ViewComponent via `HtmlContentViewComponentResult` / `HtmlString`.

Why: Nunjucks fixtures require exact whitespace, attribute order, and encoding. Razor views are easy to drift.

**Read `template.njk` as the contract.** Attribute order and newlines follow the template (including `{%-` stripping), not C# formatting taste. Compare against fixture `html` while coding.

**Encoding — never use `HtmlEncoder.Default` for parity.** It emits `&#x27;` for `'` and `&#xA;` for newlines; fixtures follow Nunjucks `escape`, which uses `&#39;` and leaves newlines as real line breaks (critical for textarea values).

Always use shared **`GovUkHtml.Escape`** and **`GovUkHtml.AppendAttributes`** (`src/Api/Components/GovUk/GovUkHtml.cs`). Do not copy private escape/attribute helpers into new renderers. `Escape` is single-pass (returns the original string when nothing needs encoding).

| Character | Entity |
| --- | --- |
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#39;` |
| Newlines | leave as `\n` |

If an older component encodes text nodes with only `& < >` and leaves `'`, that is only valid when its fixtures do the same — always verify against the component’s own `html` field.

**Composed macros:** If `template.njk` calls other components (e.g. character-count → textarea → label/hint/error), implement the **composed output** in this renderer (inline helpers OK). Do not block shipping on separate ViewComponents for every nested piece unless those pieces already exist and are reused. When nested components ship later, refactor toward shared helpers carefully without breaking parity.

**Other renderer rules**

- Match indentation/newlines from fixture `html`.
- Preserve **attribute and i18n map key order** (JSON object order → `Dictionary` insertion order).
- Optional attributes (`govukAttributes` with `optional: true`): omit when value is falsy (`null` / empty / missing).
- Hard-code exact SVG / static fragments from the template when present (e.g. button start icon).

#### 4. Implement the ViewComponent

```csharp
public sealed class GovUk<Name>ViewComponent : ViewComponent
{
    public IViewComponentResult Invoke(GovUk<Name>ViewModel model)
        => new HtmlContentViewComponentResult(new HtmlString(GovUk<Name>Renderer.Render(model)));
}
```

Pages call:

```cshtml
@await Component.InvokeAsync("GovUk<Name>", Model.MyComponent)
```

#### 5. Implement the options mapper

`GovUk<Name>OptionsMapper.FromFixtureOptions(JsonElement options)` must turn fixture `options` into the view model without losing edge cases:

- Nested text/html objects and attribute dictionaries.
- **Numbers as strings** when fixtures use JSON numbers (`maxlength: 10`, `rows: 8`, `threshold: 75`) — store/render as `"10"`.
- Attribute values that are numbers/bools → stringify like Nunjucks (`123` → `"123"`).
- `bool?` for tri-state options; do not coerce missing → `false` when templates treat them differently.
- Falsy `errorMessage` / missing nested objects → omit (no empty wrappers).

#### 6. Wire `fixtures.json` into the build

App fixtures are copied via the existing glob in `src/Api/Api.csproj` (`Components\GovUk\**\fixtures.json`) — usually no per-component entry.

In `tests/Api.Tests/Api.Tests.csproj`, **link the app fixtures file** (not a third copy under `tests/`):

```xml
<None Include="..\..\src\Api\Components\GovUk\<Name>\fixtures.json" Link="fixtures\<kebab-name>.fixtures.json">
  <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
</None>
```

Keep `tests/govuk-fixtures/<kebab-name>.fixtures.json` byte-identical for the Nunjucks suite (`FixtureSyncTests` enforces this).

#### 7. Add Fixtures endpoint (raw HTML for tests)

`Pages/Fixtures/<Name>.cshtml` — only `@page` + `@model` (no layout body).  
`OnGet` uses **`GovUkFixtureLoader.Load("<Name>")`**, maps options, returns `Content(Renderer.Render(...), "text/html")`.

Guard: only when `IsDevelopment()` or `IsEnvironment("Testing")`; otherwise `NotFound()`.

Route shape: `/Fixtures/<Name>?name=<fixture-name>`.

#### 8. Add Previews page (human parity browser)

Clone `Pages/Previews/BackLink` (or Button):

- Load fixtures via **`GovUkFixtureLoader.Load("<Name>")`**.
- List fixture **names** for navigation; **map + render only the selected** fixture (`render: false` for nav items — do not render every fixture on each GET).
- Show exact parity banner via `_PreviewParityBanner`.
- Navigation back link via `GovUkBackLink` with `Href = "/"` and label “Back to home” (never use fixture hrefs like `/home` for chrome).
- Use `<partial name="_HtmlSource" model="..." />` for rendered + official HTML.
- **Highlight.js:** `@section Head` (CSS) + `@section Scripts` (`/js/site.js`) on Previews only — never add highlight assets to global `_Layout.cshtml`.
- Guard: Development / Testing only. Route: `/Previews/<Name>?name=...`.

#### 9. Add .NET tests

1. **Structural / smoke**: Index must list `/Previews/<Name>` and must **not** embed the component demo; preview page shows parity success for `default`.
2. **Parity theory** (mirror `ButtonFixtureParityTests`):
   - One case per fixture `name`.
   - Call `GovUk<Name>OptionsMapper.FromFixtureOptions` + `GovUk<Name>Renderer.Render` and compare to fixture `html` with `string.Equals(..., Ordinal)` (**in-process — no HTTP**). Cache fixtures with `Lazy<JsonDocument>`.
3. **HTTP smoke** (mirror `ButtonComponentTests`): Index lists preview; `/Fixtures/<Name>?name=default` returns fragment; preview shows parity banner. Mark with **`[Collection("ApiTests")]`** (shared `ICollectionFixture` / `ApiWebApplicationFactory` — **never** `IClassFixture` for these hosts).
4. Ensure `ApiWebApplicationFactory` sets environment **`Testing`** so fixture/preview routes are enabled.

Run: `make test` (local SDK if available, else Docker via `make test-docker`). Prefer `make verify` before PRs. Fix renderer/mapper until all theory cases pass before polishing docs.

### Test host & verify (do not regress)

- HTTP integration tests: `[Collection("ApiTests")]` or `[Collection("ProductionApiTests")]` only.
- Parity theories: in-process mapper + renderer; no HTTP for the ~669 fixture cases.
- `make test` → local `dotnet` when on PATH, else `make test-docker`.
- `make test-fixtures` → skips `npm install` when `node_modules` is up to date; Nunjucks runner is parallel (`FIXTURE_TEST_CONCURRENCY`, default 8).
- `make verify` = `config-check` + `test-fixtures` + `test` (Windows: `pwsh scripts/verify.ps1` — always runs `npm install`).
- CI: `.github/workflows/ci.yml` (fixtures, config-check, .NET test jobs).

#### 10. Add Nunjucks fixture verification

Extend `tests/govuk-fixtures`:

1. Depend on `govuk-frontend@6.4.0` (already present).
2. Copy `render-button-fixtures.mjs` → `render-<kebab-name>-fixtures.mjs`; point at the new fixtures file and macro import.
3. Trim only a trailing newline from Nunjucks if needed; do not otherwise normalise.
4. Wire `npm test` / `test:<kebab-name>` / `render` in `package.json`, and mention the component in `tests/govuk-fixtures/README.md`.

Purpose: catch **stale fixtures** when Frontend macros change. .NET tests catch **Razor drift** from fixtures.

#### 11. Homepage navigation (required)

Every validated component **must** appear on the home page under **GOV.UK components**.

1. Open `src/Api/Pages/Index.cshtml.cs`.
2. Append a `ComponentNavItem` to the `Components` list (do not leave this for a follow-up):

```csharp
new(
    "<Display name>",                                    // e.g. "Details"
    "<One-sentence description from Design System.>",
    "/Previews/<Name>",                                  // must match the preview route
    "https://design-system.service.gov.uk/components/<kebab-name>/")
```

3. Keep the list in Design System order (or alphabetical — stay consistent with neighbours).
4. Do **not** embed live component demos on Index — examples belong on `/Previews/<Name>` only.
5. Extend Index smoke tests for the new preview href (see `AccordionComponentTests`).

`Index.cshtml` already loops `Model.Components` — you normally only edit the C# list.

#### 12. Demo + docs

1. Add an **“(agent usage)”** section below this playbook for the new component (when to use, model table, minimal example, do/don’t) — same style as Button / Character count.
2. Update `docs/govuk-components.md`, add `docs/govuk-<kebab-name>.md`, and link from `docs/README.md`, root `README.md`, `docs/preview-server.md`, `docs/testing-components.md`, and `docs/upgrading-govuk-frontend.md` URL tables where siblings are listed.
3. Mention the home-page nav entry and preview URL in the component’s docs.

#### 13. Verify visually

```sh
make preview
# open http://localhost:8080/ — confirm the new component is listed
# open http://localhost:8080/Previews/<Name>
```

Preview is API-only (no SQL/Redis). Use `/healthz` for liveness; `/healthz/deps` may 503 without SQL/Redis — expected. Use the Previews URL for components.

After code changes: rebuild (`make preview` already `--build`). Hard-refresh the browser.

### Page shell constraints (Frontend 6.4)

When touching `_Layout.cshtml` or generating chrome:

- GOV.UK masthead is a **blue** header with white logotype (`fill="currentcolor"`).
- Homepage link class is `govuk-header__homepage-link` (not the old `govuk-header__link--homepage`).
- **Service name does not live in the header** — use `govuk-service-navigation` under the masthead, inside `<header class="govuk-template__header">`.
- Copy markup from `govuk-frontend` templates/fixtures for the version in `wwwroot`, not from outdated examples.

### Common pitfalls

| Symptom | Likely cause |
| --- | --- |
| Parity fails only on whitespace | Renderer indentation ≠ Nunjucks; `{%-` strips spaces/newlines — follow `template.njk` |
| Apostrophes become `&#x27;` or newlines become `&#xA;` | Used `HtmlEncoder.Default`; use `GovUkHtml.Escape` (`&#39;`, keep `\n`) |
| Attribute order differs | Built attributes in C# property order instead of template order |
| Number options missing / wrong | Fixture JSON numbers not mapped to strings (`maxlength`, `rows`, …) |
| `data-prevent-double-click="false"` missing (or present wrongly) | Used `bool` instead of `bool?` — unset vs `false` |
| i18n `data-i18n.*` order wrong | Plural map key order not preserved from JSON |
| Composed form control parity fails on label/hint/error | Ignored nested macros; implement composed HTML (see Character count) |
| IDs off by one vs fixtures | Falsy/skipped items in `items` arrays; preserve original positions |
| Fixture route returns full HTML page | Fixtures `.cshtml` must not render a layout body; return `Content(...)` from the page model |
| Preview/fixture 404 in tests | Factory not using `Testing` environment |
| Preview “back” goes to `/home` | Used fixture href for chrome — navigation back link must be `Href = "/"` |
| Logo blue-on-blue / unreadable header | Wrong Frontend 5 header classes with Frontend 6 CSS |
| Editing fixture `html` “fixes” tests | Wrong fix — update renderer instead |

### Do / don’t (all components)

**Do**

- Start from official fixtures, `template.njk`, and the closest sibling component
- Keep one folder per component under `Components/GovUk/`
- Register the component on the home page `Components` list in `Index.cshtml.cs`
- Prove parity with `make test` and `/Previews/<Name>` before calling the work done
- Extend options/renderer for new behaviour
- Clone preview chrome (`_HtmlSource`, home back link) rather than reinventing it

**Don’t**

- Hand-paste `govuk-*` component HTML into Razor pages
- Ship a component without a home-page nav entry and preview link
- Embed demos on Index
- Add custom CSS / inline styles for Design System appearance
- Use `HtmlEncoder.Default` when matching fixtures (use `GovUkHtml` instead)
- Allocate a new skip link / header / footer / patterns back-link model per request when `AppChrome` / `PatternChrome` already exist
- Load highlight.js from global `_Layout.cshtml` (Previews only)
- Use `IClassFixture` for `ApiWebApplicationFactory` / `ProductionWebApplicationFactory`
- Normalise HTML in tests to hide differences
- Invent fixture HTML by hand
- Nest incompatible components (follow each component’s Design System “when not to use”)

## Per-component agent usage

Detailed usage guides for each component live in `docs/`. Consult the relevant doc before adding or editing a component on a page.

| Component | Doc | Preview |
| --- | --- | --- |
| Accordion | [`docs/govuk-accordion.md`](docs/govuk-accordion.md) | `/Previews/Accordion` |
| Back link | [`docs/govuk-back-link.md`](docs/govuk-back-link.md) | `/Previews/BackLink` |
| Breadcrumbs | [`docs/govuk-breadcrumbs.md`](docs/govuk-breadcrumbs.md) | `/Previews/Breadcrumbs` |
| Button | [`docs/govuk-button.md`](docs/govuk-button.md) | `/Previews/Button` |
| Character count | [`docs/govuk-character-count.md`](docs/govuk-character-count.md) | `/Previews/CharacterCount` |
| Checkboxes | [`docs/govuk-checkboxes.md`](docs/govuk-checkboxes.md) | `/Previews/Checkboxes` |
| Cookie banner | [`docs/govuk-cookie-banner.md`](docs/govuk-cookie-banner.md) | `/Previews/CookieBanner` |
| Date input | [`docs/govuk-date-input.md`](docs/govuk-date-input.md) | `/Previews/DateInput` |
| Details | [`docs/govuk-details.md`](docs/govuk-details.md) | `/Previews/Details` |
| Error message | [`docs/govuk-error-message.md`](docs/govuk-error-message.md) | `/Previews/ErrorMessage` |
| Error summary | [`docs/govuk-error-summary.md`](docs/govuk-error-summary.md) | `/Previews/ErrorSummary` |
| Exit this page | [`docs/govuk-exit-this-page.md`](docs/govuk-exit-this-page.md) | `/Previews/ExitThisPage` |
| Fieldset | [`docs/govuk-fieldset.md`](docs/govuk-fieldset.md) | `/Previews/Fieldset` |
| File upload | [`docs/govuk-file-upload.md`](docs/govuk-file-upload.md) | `/Previews/FileUpload` |
| Generic header | [`docs/govuk-generic-header.md`](docs/govuk-generic-header.md) | `/Previews/GenericHeader` |
| GOV.UK footer | [`docs/govuk-footer.md`](docs/govuk-footer.md) | `/Previews/Footer` |
| GOV.UK header | [`docs/govuk-header.md`](docs/govuk-header.md) | `/Previews/Header` |
| Inset text | [`docs/govuk-inset-text.md`](docs/govuk-inset-text.md) | `/Previews/InsetText` |
| Notification banner | [`docs/govuk-notification-banner.md`](docs/govuk-notification-banner.md) | `/Previews/NotificationBanner` |
| Pagination | [`docs/govuk-pagination.md`](docs/govuk-pagination.md) | `/Previews/Pagination` |
| Panel | [`docs/govuk-panel.md`](docs/govuk-panel.md) | `/Previews/Panel` |
| Password input | [`docs/govuk-password-input.md`](docs/govuk-password-input.md) | `/Previews/PasswordInput` |
| Phase banner | [`docs/govuk-phase-banner.md`](docs/govuk-phase-banner.md) | `/Previews/PhaseBanner` |
| Radios | [`docs/govuk-radios.md`](docs/govuk-radios.md) | `/Previews/Radios` |
| Select | [`docs/govuk-select.md`](docs/govuk-select.md) | `/Previews/Select` |
| Service navigation | [`docs/govuk-service-navigation.md`](docs/govuk-service-navigation.md) | `/Previews/ServiceNavigation` |
| Patterns | [`docs/govuk-components.md`](docs/govuk-components.md) | `/Patterns` |
| Skip link | [`docs/govuk-skip-link.md`](docs/govuk-skip-link.md) | `/Previews/SkipLink` |
| Summary list | [`docs/govuk-summary-list.md`](docs/govuk-summary-list.md) | `/Previews/SummaryList` |
| Table | [`docs/govuk-table.md`](docs/govuk-table.md) | `/Previews/Table` |
| Tabs | [`docs/govuk-tabs.md`](docs/govuk-tabs.md) | `/Previews/Tabs` |
| Tag | [`docs/govuk-tag.md`](docs/govuk-tag.md) | `/Previews/Tag` |
| Task list | [`docs/govuk-task-list.md`](docs/govuk-task-list.md) | `/Previews/TaskList` |
| Text input | [`docs/govuk-text-input.md`](docs/govuk-text-input.md) | `/Previews/TextInput` |
| Textarea | [`docs/govuk-textarea.md`](docs/govuk-textarea.md) | `/Previews/Textarea` |
| Warning text | [`docs/govuk-warning-text.md`](docs/govuk-warning-text.md) | `/Previews/WarningText` |

## Spacing  
Base unit: 4px  
Scale: 5, 10, 15, 20, 25, 30, 40, 50, 60px (GOV.UK standard spacing)  
Component padding: small 10x15, medium 15x20, large 20x30  
Section spacing: 30px mobile, 40px tablet, 50px desktop  
Container max width: 960px with 15px horizontal padding mobile, 30px desktop  
Form element spacing: 20px between form groups, 30px before submit buttons

## Border Radius  
0px: All components use sharp corners for consistency and accessibility  
No rounded elements except where technically required by browsers
## Layout Patterns  
**Two-thirds column**: Main content in 66% width column for optimal reading line length  
**Full width**: Forms, tables, and simple content can span full container width    
**Grid**: 12-column responsive grid with consistent gutters  
**Sidebar**: One-third column for secondary navigation or supplementary content  
**Centered**: Single column layouts centered within max-width container

## Footer
Every page must use the `govuk-footer` component containing:
- OGL licence text: "All content is available under the Open Government Licence v3.0, except where otherwise stated"
- Crown copyright link to nationalarchives.gov.uk
- `govuk-footer__meta` wrapper with `govuk-footer__meta-item--grow`

## Accessibility Requirements  
## Page Structure  
Every page must stay consistent with the [GOV.UK page template](https://design-system.service.gov.uk/styles/page-template/) and related styles ([Layout](https://design-system.service.gov.uk/styles/layout/), [Typography](https://design-system.service.gov.uk/styles/typography/), [Colour](https://design-system.service.gov.uk/styles/colour/)). When unsure, check those pages before inventing markup.

**Prefer this app’s `_Layout.cshtml`** for the shell (`AppChrome` + ViewComponents). Do **not** paste a second full HTML document or hand-write chrome that already exists as ViewComponents. See [`docs/layout-chrome.md`](docs/layout-chrome.md).

**Always use shipped ViewComponents** for GOV.UK UI (skip link, header, footer, phase banner, breadcrumbs, back link, panel, form controls, and so on) via `@await Component.InvokeAsync(...)`. Never invent `govuk-*` HTML for those blocks. For Design System **Pages** patterns, also follow **Creating Pages patterns**.

Conceptual skeleton (layout already supplies most of this):

```html
<html class="govuk-template" lang="en">
<body class="govuk-template__body">
  <script>document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '');</script>
  <!-- AppChrome.SkipLink → GovUkSkipLink → #content -->
  <!-- AppChrome.Header → GovUkHeader + AppServiceNavigation -->
  <div class="govuk-width-container">
    <!-- BeforeContent: GovUkPhaseBanner / GovUkBreadcrumbs / GovUkBackLink (never breadcrumbs + back link together) -->
    <main id="content" class="govuk-main-wrapper">
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          <!-- One h1; page content via ViewComponents -->
        </div>
      </div>
    </main>
  </div>
  <!-- AppChrome.Footer → GovUkFooter -->
</body>
</html>
```

Required elements in order:
1. JS detection script immediately after body open (`js-enabled` / `govuk-frontend-supported`)
2. Skip link as first focusable element (ViewComponent; target matches `main` id)
3. GOV.UK header via ViewComponent (full SVG logotype) — plus service navigation when the pattern needs it
4. Width container wrapping main content
5. Main element with `id="content"` (or match skip-link `Href`)
6. Grid row with appropriate column width
7. Footer via ViewComponent (OGL licence and Crown copyright)

## Accessibility Requirements  
**WCAG 2.2 AA**: Minimum standard for all components and patterns ([Making your service accessible](https://www.gov.uk/service-manual/helping-people-to-use-your-service/making-your-service-accessible-an-introduction))  
**Design System ≠ accessible by default**: Additional research, testing and an accessibility statement are still required ([Design System accessibility](https://design-system.service.gov.uk/accessibility/))  
**Keyboard navigation**: All interactive elements accessible via keyboard only; verify skip link and tab order  
**Focus indicators**: 4px yellow outlines on all interactive elements — never override Frontend focus styles ([focus states](https://design-system.service.gov.uk/get-started/focus-states/))  
**Colour contrast**: 4.5:1 minimum for normal text, 3:1 for large text  
**Touch targets**: 40px minimum for all interactive elements  
**Screen readers**: Proper heading hierarchy (one `h1`), ARIA only via components, semantic HTML  
**Landmarks**: Skip link → header → before-content → `main` → footer  
**Progressive enhancement**: Core journey usable without JavaScript; Frontend JS via `type="module"` + `initAll()`  
**Plain English**: Content written at reading age 9 level where possible  
**Page template**: Follow https://design-system.service.gov.uk/styles/page-template/ when creating or changing any page shell  
**Service assessment**: Follow **Service assessment readiness (agent playbook)** and [`docs/service-assessment-readiness.md`](docs/service-assessment-readiness.md)

## Content Rules  
**Sentence case**: All headings, labels, and button text — never title case  
**Active voice**: Direct, clear instructions — "Apply for your licence" not "A licence can be applied for"  
**Front-loaded content**: Most important words first in headings and labels  
**Button text**: Action-specific — "Save and continue", "Submit application", "Delete account"  
**Error messages**: Clear, actionable — "Enter your email address" not "Email is required"  
**Hint text**: Helpful examples and context without duplicating label text

## Form Patterns  
Every form must include:  
**Clear page title**: H1 that describes the specific task  
**Fieldset legends**: Group related inputs with clear legends  
**Label-input pairs**: Every input has an associated label, never placeholders as labels  
**Hint text**: Where users need help understanding what to enter  
**Error handling**: Server-side validation with linked error summary  
**Single primary action**: One green "Continue" or "Submit" button per page  
**Progress indication**: Clear sense of position in multi-page journeys

## Do's and Don'ts  
Do use GOV.UK Frontend components exactly as documented, via shipped ViewComponents — no hand-written `govuk-*` chrome  
Do follow the [page template](https://design-system.service.gov.uk/styles/page-template/) and check associated styles/component pages when unsure  
Do test every page with keyboard-only navigation from start to finish  
Do write error messages that tell users exactly what to do next  
Do use the two-thirds column layout for content-heavy pages  
Do keep form pages to one thing per page where possible  
Don't add custom styling where GOV.UK patterns already exist  
Don't use colour alone to convey information, always pair with text or icons  
Don't create new form validation patterns, use established GOV.UK error handling  
Don't hide important actions or information, everything must be explicit  
Don't use placeholder text instead of proper labels or hints  
Don't paste Design System HTML into pages instead of invoking ViewComponents  
Don't combine breadcrumbs and a back link on the same page  
Don't add decorative elements, every interface element must serve user needs  
Don't use more than one primary action button per page  
Do use the `GovUkHeader` ViewComponent with the full GOV.UK logotype — never omit the SVG path data  
Don't use a plain black bar, black rectangle, or custom dark element as a header  
Don't use dots, squares, or placeholder Unicode characters instead of the crown / logotype SVG
````

## 2. Defaults

- **When:** Friday, Jul 31, 2026, 9:40 AM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
defaults
````

## 3. Keep the Frontend upgrade section technology agnostic

- **When:** Friday, Jul 31, 2026, 8:43 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Note that the 1. Mechanical sync section is only for .NET / Razor builds other languages will have a totally different way to upgrade GOV.UK, so this section depends on the language being used, so has yet to be decided, but you could write a generalised technology agnostic version of the section
````

## 4. Keep the other documents technology agnostic

- **When:** Friday, Jul 31, 2026, 8:45 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Could you also make sure other written documents are technology agnostic and focus on whatever choosen languages best practices
````

## 5. Mention Node and Nunjucks where Frontend requires them

- **When:** Friday, Jul 31, 2026, 9:01 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Feel free to mention languages directly related to GOV.UK Frontend like Node / Nunjucks where needed since that is what it uses by default
````

## 6. Record the base-template purpose and official guidance URLs

- **When:** Saturday, Sep 26, 2026, 8:26 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Is it worth adding additional context to this project somewhere, that this will be a base template for creating "GDS compliant" frontends using stantardised backend technologies like TypeScript, Go, Python etc, no frontend frameworks will be used as GOV.UK Frontend (latest version) will be the frontend component library of choice. The guidance that should be following in these projects should all be gathered from searching across the following URLs:
https://www.gov.uk/guidance/the-technology-code-of-practice 
https://www.gov.uk/service-manual/helping-people-to-use-your-service/assisted-digital-support-introduction 
https://www.gov.uk/service-manual/service-standard 
https://www.gov.uk/service-manual 
https://design-system.service.gov.uk/ 
https://frontend.design-system.service.gov.uk/ 
Feel free to store all this information i whatever standard format / skill you feel is appropriate. Also update the @AGENTS.md to set a 100% line test coverage across functions, branches, and statements
````

## 7. Use macros, fixture parity, and the release notes before upgrades

- **When:** Saturday, Sep 26, 2026, 8:35 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Also add that all HTML could come from GOV.UK Frontend macros and test fixtures should be setup to enable extensive 100% parity testing of the HTML output coming from whatever backend is used to generate the frontend code, where possible use nunjucks as a template language rather than simply copy / pasting the HTML from each release.

Also make sure that when it comes to updating GOV.UK Frontend make sure to always review the release documentation on this page: https://github.com/alphagov/govuk-frontend/releases/latest 

Lastly, the top priorities for these projects, are frontend web performance, frontend security, reduced maintainence, accessibility, and inclusive design.
````

## 8. Structure the documentation for agents and humans, and add dotfiles

- **When:** Saturday, Sep 26, 2026, 8:40 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Could you make sure that all this documentation is structured for both AI agents and human developers, also add in any standard dotfiles that yo can at the moment to make overall maintainence and consistance across the codebase as high as possible.
````

## 9. Split the work into commits and push to main

- **When:** Saturday, Sep 26, 2026, 8:45 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
split all this new code down into structured commits with comprehensive commit messages and a history that makes sense before pushing to main
````

## 10. Add an MIT licence and SECURITY.md

- **When:** Saturday, Sep 26, 2026, 8:49 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Could we now add a base MIT licence and security.md file
````

## 11. Create this TypeScript repository from the template

- **When:** Saturday, Sep 26, 2026, 8:55 PM (UTC+1)
- **Session:** Language-agnostic template session, which then created this TypeScript repository

````text
Could we now create the typescript version of this repo by duplicating it and calling it govuk-frontend-example-typescript and push it to my github account. If theres a clever way to allow the typescript version to pull in changes from the original template please include that too.
````

## 12. Build the end-to-end TypeScript service

- **When:** Saturday, Sep 26, 2026, 9:07 PM (UTC+1)
- **Session:** This TypeScript repository

````text
Could you now create a full end-to end GOV.UK service that links multiple complete pages built using TypeScript and all GOV.UK Frontend component macros, across all pages. This should act as a best-practice reference for setting up a base GOV.UK Design System / GOV.UK Frontend in TypeScript. component macros should he tested using the test fixtures supplied with each release of GOV.UK Frontend and comprehensive testing for the whole service should added. Lastly use npm test to run all tests and npm start to run the example pages and component demos
````

## 13. Log these prompts

- **When:** Saturday, Sep 26, 2026, 9:45 PM (UTC+1)
- **Session:** This TypeScript repository

````text
Could you also add a document to the repo that logs all the prompts that I have given the agent in order to generate this example template (inclusive of this one)
````
