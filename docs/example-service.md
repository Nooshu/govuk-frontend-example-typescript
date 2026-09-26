# Example service

**Apply for a rod fishing licence** is the reference GOV.UK service in this repository. It is an example. It does not take payment, send email, or issue a licence.

Pages are TypeScript on Node. Component HTML comes from **GOV.UK Frontend Nunjucks macros**. The pin is **6.5.1**. See [tech-stack.md](tech-stack.md).

## Run it

```sh
npm install
npm start
```

Opens at <http://127.0.0.1:3000>. Set `PORT` to use another port.

`NODE_ENV=production` hides the component catalogue and the extra example pages. The licence journey stays available.

## Pages

| Path                                 | What it shows                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `/` and `/cy`                        | Start page. Welsh is the start page and chrome only; the rest of the journey is in English |
| `/task-list`                         | Task list, then the questions, check your answers, and confirmation                        |
| `/fees`, `/help`, `/guidance`        | Fees table, help accordion, and guidance tabs                                              |
| `/updates`, `/cookies`               | Service updates with pagination, and cookie settings                                       |
| `/accessibility`, `/about`           | Accessibility statement and what this example is                                           |
| `/components`                        | Every component in this Frontend release. **Links only** — no embedded demos               |
| `/components/:name`                  | One fixture, with a banner that says whether the macro HTML matches the fixture            |
| `/components/:name?fixture=`         | A named fixture                                                                            |
| `/components/:name/fixture?fixture=` | The fixture HTML fragment only. For tests and debugging                                    |
| `/examples/exit-this-page`           | Exit this page. The button leaves this example and opens the BBC weather forecast          |

Question pages use one `h1`, `novalidate`, an error summary, and field errors. Answers are kept when validation fails. A page uses a back link or breadcrumbs, not both.

## Tests

```sh
npm test
```

This runs the Node test runner and fails if application code is below **100%** function, branch, statement, or line coverage. `src/main.ts` is the process entry and is excluded.

Component tests render **every** official fixture shipped with the pinned `govuk-frontend` release, including hidden fixtures. The comparison is the fixture `html` string. The renderer trims only the outer whitespace of its own output so that output can equal the fixture. Tests do not edit fixture HTML and do not normalise it before comparing.

The service tests walk the licence journey, including validation, retained answers, check your answers, confirmation, cookies, Welsh, file upload, and the catalogue.

## Limits

- Sessions are stored in memory and end when the process stops.
- The password is checked and then discarded. It is not stored or shown again.
- A cookie choice is stored. This example does not set analytics cookies.
- An upload stores the file name only, and only for PDF, PNG, or JPG.
- Using this repo does not make a service assessment-ready. See [service-assessment-readiness.md](service-assessment-readiness.md).
