# Deploying on Render.com

Host this TypeScript example on [Render](https://render.com) as a public demo. It is a Node HTTP process, so use a **Web Service**, not Static Sites.

Authoritative Render docs: [Language support](https://render.com/docs/language-support), [Blueprints](https://render.com/docs/blueprint-spec), [Deploy a Node app](https://render.com/docs/deploy-node-express-app).

The live demo is [govuk-frontend-example-typescript.onrender.com](https://govuk-frontend-example-typescript.onrender.com/).

## What the repo includes

| File                            | Role                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| [`render.yaml`](../render.yaml) | Blueprint: free web service, build/start, `/health` check           |
| `src/main.ts`                   | Listens on `PORT` (Render injects this)                             |
| `GET /health`                   | Plain `ok` for Render health checks                                 |
| `DEMOS_ENABLED`                 | Keeps `/components` and the homepage **Developer previews** link on |

`tsx` and Sass are dev dependencies. The Blueprint build runs `npm ci --include=dev` so a production `NODE_ENV` does not omit them, then compiles CSS. The start command is `npx tsx src/main.ts`.

## Catalogue on the public demo

The start page shows **Developer previews** with a link to `/components`. The footer shows **Component catalogue** and **Example pages**. `/components` lists every component in the pinned Frontend release; each name opens one fixture.

Demos stay on unless `DEMOS_ENABLED` is `false`, `0`, or `no`. Render sets `NODE_ENV=production` for Node services. That does not hide the catalogue. The Blueprint still sets `DEMOS_ENABLED=true` so the choice is explicit.

An existing manual Web Service does not pick up a new `render.yaml` env var by itself. Redeploy this code (demos default to on), or set `DEMOS_ENABLED=true` in the service **Environment** tab and redeploy.

## Blueprint

1. Push `main`, including `render.yaml`.
2. In the [Render Dashboard](https://dashboard.render.com/), choose **New +** → **Blueprint**.
3. Select this repository and apply `render.yaml`.
4. When the service is **Live**, open the `.onrender.com` URL.

After deploy:

- [ ] `/health` returns `ok`
- [ ] `/` shows GOV.UK styling, the demo warning, and **Developer previews**
- [ ] `/components` lists components, and one component page shows a fixture
- [ ] View source shows `noindex, nofollow`; `/robots.txt` disallows `/`

## Manual Web Service

| Field           | Value                                          |
| --------------- | ---------------------------------------------- |
| Language        | Node                                           |
| Branch          | `main`                                         |
| Build Command   | `npm ci --include=dev && npm run build:styles` |
| Start Command   | `npx tsx src/main.ts`                          |
| Health Check    | `/health`                                      |
| `NODE_VERSION`  | `22`                                           |
| `DEMOS_ENABLED` | `true`                                         |

Leave `PORT` unset. Render injects it. Leave `NODE_ENV` unset; Render sets `production`.

## Local parity

```sh
npm ci
npm run build:styles
PORT=3000 npx tsx src/main.ts
```

Hide the catalogue:

```sh
DEMOS_ENABLED=false PORT=3000 npx tsx src/main.ts
```

## Troubleshooting

| Symptom                                              | Likely fix                                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| No **Developer previews** link, `/components` is 404 | `DEMOS_ENABLED` is `false`, `0`, or `no`. Set it to `true` or remove it, then redeploy.            |
| HTML without GOV.UK CSS                              | The build must run `npm run build:styles` so `dist/stylesheets/application.css` exists at runtime. |
| Build cannot find `tsx` or Sass                      | Use `npm ci --include=dev`. `NODE_ENV=production` would otherwise omit dev dependencies.           |
| Health check failing                                 | Path must be exactly `/health`.                                                                    |

## Related

- [example-service.md](example-service.md) — what the demo contains
- [tech-stack.md](tech-stack.md) — TypeScript / Node and Nunjucks
- [frontend-security.md](frontend-security.md) — headers and cookies behind a reverse proxy
