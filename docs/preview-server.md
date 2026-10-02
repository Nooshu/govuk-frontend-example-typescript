# Preview server

Local server for human parity checks and pattern demos.

## Status

```sh
npm start
npm run test:fixtures
```

`npm start` builds styles and serves the example, including `/components`. `npm run test:fixtures` compares `renderComponent` with every official fixture. See [tech-stack.md](tech-stack.md).

## Expectations

- The service start page links to `/components` when demos are enabled.
- `/components` is the component preview homepage: every component as **links only** — no embedded live demos.
- `/components/:name` loads official fixtures and renders the selected one with `renderComponent` (the same path as the parity suite). The page leads with **Current version: …**, then a success banner **only when** that HTML equals the fixture `html`, then a **Component preview** frame (dotted border), then a **Versions (Fixtures)** list that marks the selected entry with a Current tag. A mismatch shows the failure banner instead of the success banner.
- A raw-fixture surface (`/components/:name/fixture?fixture=`) returns an HTML **fragment** for automation.
- Preview and fixture surfaces stay available unless `DEMOS_ENABLED` is `false`, `0`, or `no`. `NODE_ENV=production` does not hide them.
- Preview responses use the same [`baseline/`](../baseline/) headers as production. On local HTTP, pass `secureTransport: false` so HSTS is not sent.
- Syntax highlighting (if any) loads on Previews only — never on the global layout.
- Optional health / readiness endpoints follow the stack’s normal conventions; missing optional infra should not block Frontend-only preview.

## After code changes

Rebuild or reload as required by the language’s tooling; hard-refresh the browser. Confirm focus states, header/footer, and a failing-form example during visual QA after Frontend upgrades ([upgrading-govuk-frontend.md](upgrading-govuk-frontend.md)).
