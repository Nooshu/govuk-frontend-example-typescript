# Example service

**Apply for a fishing rod licence** is the reference GOV.UK service in this repository. It is an example. It does not take payment, send email, or issue a licence.

Every page shows an **Important** notification banner: “This is a live demo. It is not a real government service.” (Welsh on `/cy`). The banner sits full width inside the page width container (not in the two-thirds column used by journey content). It uses Frontend’s notification banner macro with an `app-notification-banner--demo` class so [`govuk-overrides.scss`](../styles/govuk-overrides.scss) can paint yellow chrome for this demo notice only (default Important stays blue). Pages are excluded from search engines via `noindex, nofollow` in the document head, an `X-Robots-Tag` response header, and `/robots.txt` (`Disallow: /`).

Pages are TypeScript on Node. Component HTML comes from **GOV.UK Frontend Nunjucks macros**. The pin is **6.5.1**. See [tech-stack.md](tech-stack.md).

## Run it

```sh
npm install
npm start
```

Opens at <http://127.0.0.1:3000>. Set `PORT` to use another port.

The start page includes **Developer previews**, a link to `/components`. The footer includes **Component catalogue** and **Example pages**. Those routes list every component in the pinned Frontend release.

Demos stay on unless `DEMOS_ENABLED` is `false`, `0`, or `no`. `true`, `1`, and `yes` force them on. An unset or unknown value leaves them on, including when `NODE_ENV` is `production`. Render sets `NODE_ENV=production` for Node services; that must not hide the public catalogue. See [deploying-on-render.md](deploying-on-render.md).

## Start to confirmation

The journey is one service, from the start page through to confirmation.

1. Start at `/` (English) or `/cy` (Welsh start page only). Choose **Start now**.
2. Answer the questions in order: licence length, full name, date of birth, where you will fish, and email.
3. Check your answers at `/check-answers`. Change links return to a question and then come back.
4. Accept and continue. The confirmation page at `/confirmation` shows an example reference.

Invalid answers stay on the same question, with an error summary and the values you entered. You cannot open confirmation until the questions are complete.

## Pages

| Path                                 | What it shows                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/` and `/cy`                        | Start page, including Developer previews when demos are on. Welsh is the start page and chrome only; the rest of the journey is in English |
| `/licence-length` through `/email`   | Question pages, then check your answers and confirmation                                                                                   |
| `/fees`, `/help`, `/guidance`        | Fees table, help accordion, and guidance tabs                                                                                              |
| `/updates`, `/cookies`               | Service updates with pagination, and cookie settings                                                                                       |
| `/accessibility`, `/about`           | Accessibility statement and what this example is                                                                                           |
| `/components`                        | Preview homepage. Every component in this Frontend release as **links only** — no embedded demos                                           |
| `/components/:name`                  | One fixture in a preview frame, plus every fixture version. The success banner appears only when that HTML equals the fixture              |
| `/components/:name?fixture=`         | A named fixture version on that component page                                                                                             |
| `/components/:name/fixture?fixture=` | The fixture HTML fragment only. For tests and debugging                                                                                    |
| `/examples/exit-this-page`           | Exit this page. The button leaves this example and opens the BBC weather forecast                                                          |

Question pages use one `h1`, `novalidate`, an error summary, and field errors. Answers are kept when validation fails. A page uses a back link or breadcrumbs, not both.

## Responses

Pages and assets use the shared [baseline](frontend-security.md). Public HTML that sets the session cookie is `private, no-cache`, with a strong `ETag`. Question, check your answers, confirmation, and cookie settings pages are `no-store`. The compiled Sass stylesheet (`application.css`), Frontend script, and the external `initAll()` module are fingerprinted and cached as immutable. The `js-enabled` snippet is the one line hashed in `baseline/policy.json`.

The server compresses with Brotli when the browser sends `Accept-Encoding: br`. Gzip is only used when the browser does not advertise `br`. Local `npm start` is HTTP, so the session cookie is not `Secure` and responses do not send HSTS.

## Tests

```sh
npm run test:fixtures
npm test
```

`npm run test:fixtures` compares TypeScript `renderComponent` output with **every** official fixture in the pinned `govuk-frontend` release, including hidden fixtures. The comparison is the fixture `html` string. The renderer trims only the outer whitespace of its own output so that output can equal the fixture. Tests do not edit fixture HTML and do not normalise it before comparing.

`npm test` runs that parity suite as well, plus the shared baseline suite at **100%** line, branch, and function coverage. The application suite fails if code is below **100%** function, branch, statement, or line coverage. `src/main.ts` is the process entry and is excluded. The service tests also open every component page for every fixture version and check that the “HTML matches the fixture” banner is present only when the rendered HTML equals the fixture.

The service tests walk the licence journey, including validation, retained answers, check your answers, confirmation, cookies, Welsh, and the catalogue.

## Limits

- Sessions are stored in memory and end when the process stops.
- A cookie choice is stored. This example does not set analytics cookies.
- Using this repo does not make a service assessment-ready. See [service-assessment-readiness.md](service-assessment-readiness.md).
