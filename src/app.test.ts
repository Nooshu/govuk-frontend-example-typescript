import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createApp, type App, type AppOptions } from './app.js';
import { listComponentNames, loadComponentFixtures } from './components/fixtures.js';
import { selectFixture } from './components/preview.js';
import { renderComponent } from './components/render.js';
import { demosEnabledFromEnv, FRONTEND_VERSION, MAX_BODY_BYTES } from './config.js';
import { createMemoryStore, type Session, type SessionStore } from './session/store.js';
import type { renderPage } from './pages/document.js';

const NOW = new Date(Date.UTC(2026, 8, 26));

type Page = { status: number; text: string; location: string | null; response: Response };

function h1Count(html: string): number {
  return html.match(/<h1\b/g)?.length ?? 0;
}

function createClient(overrides: AppOptions = {}): {
  app: App;
  store: SessionStore;
  send(
    path: string,
    options?: {
      method?: string;
      body?: string | Buffer;
      headers?: Record<string, string>;
      https?: boolean;
    },
  ): Promise<Page>;
  session(): Session;
} {
  const store = overrides.store ?? createMemoryStore();
  const app = createApp({
    demosEnabled: overrides.demosEnabled ?? true,
    now: overrides.now ?? (() => NOW),
    store,
    ...(overrides.logger ? { logger: overrides.logger } : {}),
    ...(overrides.render ? { render: overrides.render } : {}),
    ...(overrides.readBody ? { readBody: overrides.readBody } : {}),
  });
  let cookie = '';

  return {
    app,
    store,
    async send(path, options = {}) {
      const headers = new Headers(options.headers);
      if (cookie) headers.set('cookie', cookie);
      const request: RequestInit = { method: options.method ?? 'GET', headers };
      if (options.body !== undefined) request.body = options.body;
      const protocol = options.https ? 'https' : 'http';
      const response = await app.handle(new Request(`${protocol}://example.test${path}`, request));
      const setCookie = response.headers.get('set-cookie');
      const pair = setCookie?.split(';')[0];
      if (pair) cookie = pair;
      return {
        status: response.status,
        text: await response.text(),
        location: response.headers.get('location'),
        response,
      };
    },
    session() {
      const id = cookie.split('=')[1] ?? '';
      const session = store.get(id);
      assert.ok(session);
      return session;
    },
  };
}

function tokenFrom(html: string): string {
  const token = /name="csrf" value="([^"]+)"/.exec(html)?.[1];
  assert.ok(token);
  return token;
}

function form(token: string, values: Record<string, string | string[]>): string {
  const params = new URLSearchParams();
  params.set('csrf', token);
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else params.set(key, value);
  }
  return params.toString();
}

function assertShell(html: string, lang = 'en'): void {
  assert.equal(h1Count(html), 1);
  assert.match(html, new RegExp(`<html[^>]* lang="${lang}"`));
  assert.match(html, /href="#main-content"/);
  assert.match(html, /id="main-content"/);
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /govuk-notification-banner app-notification-banner--demo/);
  // Full width of the page container: demo banner is the first child of main (not inside two-thirds).
  assert.match(
    html,
    /id="main-content"[^>]*>\s*<div class="govuk-notification-banner app-notification-banner--demo"/,
  );
  assert.match(
    html,
    lang === 'cy'
      ? /Mae hon yn arddangosiad byw\. Nid yw’n wasanaeth llywodraeth go iawn\./
      : /This is a live demo\. It is not a real government service\./,
  );
  assert.match(html, /document\.body\.className \+= ' js-enabled'/);
  assert.match(html, /<script type="module" src="\/assets\/app\.[a-f0-9]+\.mjs"><\/script>/);
  assert.doesNotMatch(html, /nonce=/);
  assert.match(html, /\/assets\/application\.[a-f0-9]+\.css/);
  assert.doesNotMatch(html, /outline:\s*none/);
  const skip = html.indexOf(lang === 'cy' ? 'Neidio i&#39;r prif gynnwys' : 'Skip to main content');
  const banner = html.indexOf('Cookies on Apply for a fishing rod licence');
  assert.ok(skip >= 0);
  if (banner >= 0) assert.ok(skip < banner);
}

describe('example service', { timeout: 120_000 }, () => {
  it('walks the fishing rod licence journey', async () => {
    const client = createClient();
    const { send } = client;

    const start = await send('/');
    assert.equal(start.status, 200);
    assertShell(start.text);
    assert.match(start.text, /Help us improve this service/);
    assert.match(start.text, /Apply for a fishing rod licence/);
    assert.match(start.text, /href="\/licence-length"/);
    assert.match(start.text, /This is a demonstration – it is not a live government service/);
    assert.match(start.text, /Developer previews/);
    assert.match(start.text, /href="\/components">Preview GOV\.UK components/);
    assert.match(start.text, /TypeScript library/);
    assert.doesNotMatch(start.text, /govuk-back-link/);
    assert.doesNotMatch(start.text, /govuk-breadcrumbs/);
    const policy = start.response.headers.get('content-security-policy') ?? '';
    assert.match(policy, /sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw=/);
    assert.doesNotMatch(policy, /unsafe-inline|nonce-/);
    assert.equal(start.response.headers.get('x-frame-options'), 'DENY');
    assert.equal(start.response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(start.response.headers.get('cache-control'), 'private, no-cache');
    assert.match(start.response.headers.get('link') ?? '', /woff2/);
    const etag = start.response.headers.get('etag');
    assert.match(etag ?? '', /^".+"$/);
    const revalidated = await send('/', { headers: { 'if-none-match': etag ?? '' } });
    assert.equal(revalidated.status, 304);
    const stale = await send('/', { headers: { 'if-none-match': '"missing"' } });
    assert.equal(stale.status, 200);

    const welsh = await send('/cy');
    assertShell(welsh.text, 'cy');
    assert.match(welsh.text, /Dechrau nawr/);
    assert.match(welsh.text, /href="\/"/);
    assert.match(welsh.text, /nid gwasanaeth llywodraeth byw mohono/);
    assert.match(welsh.text, /Rhagolygon datblygwyr/);
    assert.match(welsh.text, /llyfrgell TypeScript/);

    const earlyCheck = await send('/check-answers');
    assert.equal(earlyCheck.status, 303);
    assert.equal(earlyCheck.location, '/licence-length');
    const earlyConfirmation = await send('/confirmation');
    assert.equal(earlyConfirmation.location, '/');

    const length = await send('/licence-length');
    assertShell(length.text);
    assert.equal(length.response.headers.get('cache-control'), 'no-store');
    assert.equal(length.response.headers.get('etag'), null);
    assert.match(length.text, /novalidate/);
    assert.match(length.text, /govuk-back-link/);
    assert.match(length.text, /How long do you need the licence for\?/);
    assert.match(length.text, /1 day/);
    assert.match(length.text, /8 days/);
    assert.match(length.text, /12 months/);
    assert.doesNotMatch(length.text, /£7\.10|£14\.20|£36\.80/);
    assert.doesNotMatch(length.text, /govuk-breadcrumbs/);
    assert.doesNotMatch(length.text, /Help us improve this service/);

    const invalidLength = await send('/licence-length', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(length.text), {}),
    });
    assert.equal(invalidLength.status, 303);
    assert.equal(invalidLength.location, '/licence-length');
    const lengthError = await send('/licence-length');
    assertShell(lengthError.text);
    assert.match(lengthError.text, /There is a problem/);
    assert.match(lengthError.text, /Select how long you need the licence for/);
    assert.match(lengthError.text, /<title>Error:/);
    assert.equal(client.session().errors, null);

    const validLength = await send('/licence-length', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(lengthError.text), { 'licence-length': '12-months' }),
    });
    assert.equal(validLength.location, '/name');

    const name = await send('/name');
    assert.match(name.text, /What is your full name\?/);
    const invalidName = await send('/name', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(name.text), { 'full-name': '' }),
    });
    assert.equal(invalidName.status, 303);
    assert.equal(invalidName.location, '/name');
    const nameError = await send('/name');
    assertShell(nameError.text);
    assert.match(nameError.text, /Enter your full name/);

    const validName = await send('/name', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(nameError.text), { 'full-name': ' Ada Lovelace ' }),
    });
    assert.equal(validName.location, '/date-of-birth');

    const date = await send('/date-of-birth');
    assert.match(date.text, /For example, 31 3 1980/);
    const badDate = await send('/date-of-birth', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(date.text), {
        'date-of-birth-day': '27',
        'date-of-birth-month': '9',
        'date-of-birth-year': '2013',
      }),
    });
    assert.equal(badDate.location, '/date-of-birth');
    const dateError = await send('/date-of-birth');
    assert.match(dateError.text, /at least 13/);
    assert.match(dateError.text, /value="27"/);

    await send('/date-of-birth', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(dateError.text), {
        'date-of-birth-day': '31',
        'date-of-birth-month': '3',
        'date-of-birth-year': '1980',
      }),
    });

    const country = await send('/where-you-will-fish');
    assert.match(country.text, /This example is fictional/);
    assert.match(country.text, /England/);
    assert.match(country.text, /Wales/);
    assert.match(country.text, /Scotland/);
    const badCountry = await send('/where-you-will-fish', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(country.text), {}),
    });
    assert.equal(badCountry.location, '/where-you-will-fish');
    const countryError = await send('/where-you-will-fish');
    assert.match(countryError.text, /Select where you will fish/);
    await send('/where-you-will-fish', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(countryError.text), { country: 'England' }),
    });

    const email = await send('/email');
    assert.equal(h1Count(email.text), 1);
    assert.match(email.text, /browser session only/);
    const badEmail = await send('/email', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(email.text), { email: 'not-an-email' }),
    });
    assert.equal(badEmail.location, '/email');
    const emailError = await send('/email');
    assert.match(emailError.text, /name@example.com/);
    assert.match(emailError.text, /value="not-an-email"/);
    const goodEmail = await send('/email', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(emailError.text), { email: 'ada@example.com' }),
    });
    assert.equal(goodEmail.location, '/check-answers');

    const change = await send('/name?return=check-answers');
    assert.match(change.text, /href="\/check-answers"/);
    assert.match(change.text, /name="returnTo" value="check-answers"/);
    const changed = await send('/name?return=check-answers', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(change.text), {
        'full-name': '',
        returnTo: 'check-answers',
      }),
    });
    assert.equal(changed.location, '/name?return=check-answers');
    const changedOk = await send('/name?return=check-answers', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom((await send('/name?return=check-answers')).text), {
        'full-name': 'Ada Lovelace',
        returnTo: 'check-answers',
      }),
    });
    assert.equal(changedOk.location, '/check-answers');

    const check = await send('/check-answers');
    assertShell(check.text);
    assert.match(check.text, /Ada Lovelace/);
    assert.match(check.text, /12 months/);
    assert.match(check.text, /31 3 1980/);
    assert.match(check.text, /England/);
    assert.match(check.text, /ada@example.com/);
    assert.match(check.text, /Accept and continue/);

    const submitted = await send('/check-answers', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(check.text), {}),
    });
    assert.equal(submitted.location, '/confirmation');
    const again = await send('/check-answers', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(check.text), {}),
    });
    assert.equal(again.location, '/confirmation');
    const checkAgain = await send('/check-answers');
    assert.equal(checkAgain.location, '/confirmation');

    const confirmation = await send('/confirmation');
    assertShell(confirmation.text);
    assert.match(confirmation.text, new RegExp(client.session().application.reference));
    assert.match(confirmation.text, /Your example reference number/);
    assert.match(confirmation.text, /Nobody will send you a fishing rod licence/);
    assert.match(confirmation.text, /href="\/components"/);
    assert.doesNotMatch(confirmation.text, /Help us improve this service/);

    const reset = await send('/new-application');
    assert.equal(reset.location, '/');
    const cleared = await send('/name');
    assert.doesNotMatch(cleared.text, /value="Ada Lovelace"/);
  });

  it('saves cookie choices and ignores unsafe return paths', async () => {
    const client = createClient();
    const start = await client.send('/');
    const token = tokenFrom(start.text);
    const accepted = await client.send('/cookie-choices', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(token, { cookies: 'accept', returnPath: '/fees' }),
    });
    assert.equal(accepted.location, '/fees');
    const fees = await client.send('/fees');
    assert.match(fees.text, /You have accepted analytics cookies/);
    assert.match(fees.text, /govuk-breadcrumbs/);
    assert.doesNotMatch(fees.text, /govuk-back-link/);
    const hidden = await client.send('/cookie-choices', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(fees.text), { cookies: 'hide', returnPath: '/fees' }),
    });
    assert.equal(hidden.location, '/fees');
    const quiet = await client.send('/fees');
    assert.doesNotMatch(quiet.text, /You have accepted analytics cookies/);
    assert.doesNotMatch(quiet.text, /Cookies on Apply/);

    const rejectedClient = createClient();
    const rejectedStart = await rejectedClient.send('/');
    await rejectedClient.send('/cookie-choices', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(rejectedStart.text), { cookies: 'reject', returnPath: '/' }),
    });
    const rejected = await rejectedClient.send('/');
    assert.match(rejected.text, /You have rejected analytics cookies/);

    const ignored = createClient();
    const ignoredStart = await ignored.send('/');
    await ignored.send('/cookie-choices', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(ignoredStart.text), { cookies: 'maybe', returnPath: '/' }),
    });
    const stillAsking = await ignored.send('/');
    assert.match(stillAsking.text, /Cookies on Apply/);

    const returns: [string, string][] = [
      ['/help', '/help'],
      ['https://evil.example', '/'],
      ['//evil.example', '/'],
      ['/\\\\secret', '/'],
      ['help', '/'],
      ['/help\nSet-Cookie', '/'],
      ['/help\rSet-Cookie', '/'],
    ];
    for (const [value, expected] of returns) {
      const page = await ignored.send('/');
      const result = await ignored.send('/cookie-choices', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: form(tokenFrom(page.text), { cookies: 'hide', returnPath: value }),
      });
      assert.equal(result.location, expected, value);
    }

    const cookies = await client.send('/cookies');
    const invalid = await client.send('/cookies', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(cookies.text), { analytics: '' }),
    });
    assert.equal(invalid.location, '/cookies');
    const cookieError = await client.send('/cookies');
    assert.match(cookieError.text, /There is a problem/);
    const saved = await client.send('/cookies', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom(cookieError.text), { analytics: 'no' }),
    });
    assert.equal(saved.location, '/cookies');
    const savedPage = await client.send('/cookies');
    assert.match(savedPage.text, /Your cookie settings were saved/);
    const savedAgain = await client.send('/cookies');
    assert.doesNotMatch(savedAgain.text, /Your cookie settings were saved/);
    assert.equal(client.session().cookieChoice, 'reject');
    const chosen = await client.send('/cookies', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom((await client.send('/cookies')).text), { analytics: 'yes' }),
    });
    assert.equal(chosen.location, '/cookies');
    assert.equal(client.session().cookieChoice, 'accept');
  });

  it('clears errors and notices for a different page', async () => {
    const client = createClient();
    await client.send('/');
    const session = client.session();
    session.errors = {
      path: '/name',
      items: [{ field: 'full-name', href: '#full-name', text: 'Enter your full name' }],
    };
    session.notice = { path: '/fees', text: 'Not about cookies' };
    client.store.save(session);
    const cookies = await client.send('/cookies');
    assert.doesNotMatch(cookies.text, /Enter your full name/);
    assert.doesNotMatch(cookies.text, /Not about cookies/);
    assert.equal(client.session().errors, null);
    assert.equal(client.session().notice, null);
  });

  it('serves guidance pages, assets, and http errors', async () => {
    const { send } = createClient();
    for (const path of [
      '/fees',
      '/help',
      '/guidance',
      '/accessibility',
      '/about',
      '/updates',
      '/updates?page=1',
    ]) {
      const page = await send(path);
      assert.equal(page.status, 200, path);
      assertShell(page.text);
    }
    const about = await send('/about');
    assert.match(about.text, new RegExp(FRONTEND_VERSION));
    assert.match(about.text, /href="\/components"/);
    const pageTwo = await send('/updates?page=2');
    assert.match(pageTwo.text, /no further fee changes/);
    assert.match(pageTwo.text, /rel="prev"/);
    const missingPage = await send('/updates?page=9');
    assert.equal(missingPage.status, 303);
    assert.equal(missingPage.location, '/updates');

    const slash = await send('/guidance/?from=start');
    assert.equal(slash.status, 303);
    assert.equal(slash.location, '/guidance?from=start');

    const health = await send('/health');
    assert.equal(health.status, 200);
    assert.equal(health.text, 'ok');
    assert.equal(health.response.headers.get('set-cookie'), null);

    const robots = await send('/robots.txt');
    assert.equal(robots.status, 200);
    assert.equal(robots.text, 'User-agent: *\nDisallow: /\n');
    assert.match(robots.response.headers.get('content-type') ?? '', /text\/plain/);
    assert.equal(about.response.headers.get('x-robots-tag'), 'noindex, nofollow');

    const legacyCss = await send('/assets/govuk-frontend.min.css');
    assert.equal(legacyCss.status, 404);
    const stylesheet = /href="(\/assets\/application\.[a-f0-9]+\.css)"/.exec(about.text)?.[1];
    assert.ok(stylesheet);
    const cachedCss = await send(stylesheet);
    assert.match(cachedCss.response.headers.get('content-type') ?? '', /text\/css/);
    assert.equal(cachedCss.response.headers.get('content-security-policy'), null);
    assert.equal(cachedCss.response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(
      cachedCss.response.headers.get('cache-control'),
      'public, max-age=31536000, immutable',
    );
    assert.match(cachedCss.text, /--app-stylesheet-layer:\s*govuk-overrides/);
    const modulePath = /src="(\/assets\/app\.[a-f0-9]+\.mjs)"/.exec(about.text)?.[1];
    assert.ok(modulePath);
    const moduleResponse = await send(modulePath);
    assert.match(moduleResponse.text, /initAll\(\)/);
    assert.equal(
      moduleResponse.response.headers.get('cache-control'),
      'public, max-age=31536000, immutable',
    );
    const script = await send('/assets/govuk-frontend.min.js');
    assert.match(script.response.headers.get('content-type') ?? '', /javascript/);
    const json = await send('/assets/manifest.json');
    assert.match(json.response.headers.get('content-type') ?? '', /json/);
    const missingAsset = await send('/assets/missing.css');
    assert.equal(missingAsset.status, 404);
    assert.equal(missingAsset.text, 'Not found');

    const missing = await send('/this-page-does-not-exist');
    assert.equal(missing.status, 404);
    assertShell(missing.text);
    const method = await send('/fees', { method: 'PUT' });
    assert.equal(method.status, 405);

    const secure = await send('/', { https: true });
    assert.match(secure.response.headers.get('set-cookie') ?? '', /__Host-session=/);
    assert.match(secure.response.headers.get('set-cookie') ?? '', /Secure/);
    assert.match(
      secure.response.headers.get('strict-transport-security') ?? '',
      /max-age=63072000/,
    );
    const forwarded = await send('/fees', { headers: { 'x-forwarded-proto': ' HTTPS, http' } });
    assert.match(forwarded.response.headers.get('set-cookie') ?? '', /__Host-session=/);
    assert.match(forwarded.response.headers.get('strict-transport-security') ?? '', /max-age=/);
    const plainForwarded = await send('/fees', { headers: { 'x-forwarded-proto': 'http' } });
    assert.match(plainForwarded.response.headers.get('set-cookie') ?? '', /rod_session=/);
    assert.equal(plainForwarded.response.headers.get('strict-transport-security'), null);

    const expired = await send('/name', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'csrf=wrong&full-name=Ada Lovelace',
    });
    assert.equal(expired.status, 403);
    assert.match(expired.text, /session has expired/);

    const unknownPost = await send('/not-a-step', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom((await send('/name')).text), {}),
    });
    assert.equal(unknownPost.status, 404);

    const tooBig = await send('/name', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `csrf=${'a'.repeat(MAX_BODY_BYTES)}`,
    });
    assert.equal(tooBig.status, 413);
    const wrongType = await send('/name', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'hello',
    });
    assert.equal(wrongType.status, 415);

    const unknownCookie = createClient();
    const fresh = await unknownCookie.send('/', {
      headers: { cookie: 'rod_session=missing; broken=%E0%A4' },
    });
    assert.equal(fresh.status, 200);
  });

  it('previews every component fixture and keeps demos off the service pages', async () => {
    const client = createClient();
    const catalogue = await client.send('/components');
    assertShell(catalogue.text);
    assert.match(catalogue.text, /lists links only/);
    assert.match(catalogue.text, /preview homepage/);
    assert.match(catalogue.text, /Nunjucks macros/);
    const catalogueMain = catalogue.text.slice(catalogue.text.indexOf('<main'));
    assert.doesNotMatch(catalogueMain, /class="govuk-button/);
    for (const name of listComponentNames()) {
      assert.match(catalogue.text, new RegExp(`href="/components/${name}"`));
      const loaded = loadComponentFixtures(name);
      const selected = selectFixture(loaded.fixtures, null);
      assert.ok(selected);
      const preview = await client.send(`/components/${name}`);
      assert.equal(preview.status, 200, name);
      assert.match(preview.text, /Component preview/);
      assert.match(preview.text, /app-component-preview__frame/);
      assert.match(preview.text, /Versions \(Fixtures\)/);
      assertComponentPreview(preview.text, name, selected.name, selected.options, selected.html);
      for (const fixture of loaded.fixtures) {
        assert.ok(preview.text.includes(fixtureLabel(fixture.name)), `${name} / ${fixture.name}`);
        if (fixture.name === selected.name) continue;
        const page = await client.send(
          `/components/${name}?fixture=${encodeURIComponent(fixture.name)}`,
        );
        assert.equal(page.status, 200, `${name} / ${fixture.name}`);
        assertComponentPreview(page.text, name, fixture.name, fixture.options, fixture.html);
      }
    }

    const button = loadComponentFixtures('button');
    const fixture = button.fixtures.find((item) => !item.hidden) ?? button.fixtures[0];
    assert.ok(fixture);
    const raw = await client.send(
      `/components/button/fixture?fixture=${encodeURIComponent(fixture.name)}`,
    );
    assert.equal(raw.status, 200);
    assert.equal(raw.text, fixture.html);
    assert.match(raw.response.headers.get('content-type') ?? '', /text\/html/);
    const named = await client.send(
      `/components/button?fixture=${encodeURIComponent(fixture.name)}`,
    );
    assert.match(named.text, /HTML matches the fixture/);
    const hidden = button.fixtures.find((item) => item.hidden);
    if (hidden) {
      const hiddenPreview = await client.send(
        `/components/button?fixture=${encodeURIComponent(hidden.name)}`,
      );
      assert.equal(hiddenPreview.status, 200);
    }
    assert.equal((await client.send('/components/button?fixture=missing')).status, 404);
    assert.equal((await client.send('/components/button/fixture')).status, 404);
    assert.equal((await client.send('/components/not-a-component')).status, 404);
    assert.equal(
      (await client.send('/components/not-a-component/fixture?fixture=default')).status,
      404,
    );

    const examples = await client.send('/examples');
    assertShell(examples.text);
    const exit = await client.send('/examples/exit-this-page');
    assertShell(exit.text);
    assert.match(exit.text, /bbc\.co\.uk\/weather/);
    assert.ok(
      exit.text.indexOf('govuk-exit-this-page') < exit.text.indexOf('Skip to main content'),
    );
    const problem = await client.send('/examples/problem-with-the-service');
    assert.equal(problem.status, 200);
    assert.match(problem.text, /problem with the service/);
    const unavailable = await client.send('/examples/service-unavailable');
    assert.equal(unavailable.status, 200);
    assert.match(unavailable.text, /unavailable/);

    const quiet = createClient({ demosEnabled: false });
    const home = await quiet.send('/');
    assert.equal(home.status, 200);
    assert.doesNotMatch(home.text, /Component catalogue/);
    assert.doesNotMatch(home.text, /Developer previews/);
    assert.equal((await quiet.send('/components')).status, 404);
    assert.equal((await quiet.send('/examples/exit-this-page')).status, 404);
    const about = await quiet.send('/about');
    assert.doesNotMatch(about.text, /href="\/components"/);
  });

  it('uses a fresh session after an unknown cookie and reports failures', async () => {
    const logged: unknown[] = [];
    let renders = 0;
    const render: typeof renderPage = () => {
      renders += 1;
      if (renders === 1) throw new Error('once');
      return '<p>Sorry, there is a problem with the service</p>';
    };
    const once = createClient({ logger: (error) => logged.push(error), render });
    const recovered = await once.send('/');
    assert.equal(recovered.status, 500);
    assert.match(recovered.text, /problem with the service/);
    assert.equal(logged.length, 1);

    const failed = createClient({
      logger: () => undefined,
      readBody: () => {
        throw new Error('unreadable');
      },
    });
    const broken = await failed.send('/name', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'csrf=abc',
    });
    assert.equal(broken.status, 500);
    assert.match(broken.text, /problem with the service/);

    const original = console.error;
    let defaultLogged = false;
    console.error = () => {
      defaultLogged = true;
    };
    try {
      const app = createApp({
        render: () => {
          throw new Error('logged');
        },
      });
      const response = await app.handle(new Request('http://example.test/'));
      assert.equal(response.status, 500);
      assert.match(await response.text(), /problem with the service/);
      assert.equal(defaultLogged, true);
    } finally {
      console.error = original;
    }

    const defaults = createApp();
    const health = await defaults.handle(new Request('http://example.test/health'));
    assert.equal(await health.text(), 'ok');
    const length = await defaults.handle(new Request('http://example.test/licence-length'));
    assert.equal(length.status, 200);
    const lengthHtml = await length.text();
    const posted = await defaults.handle(
      new Request('http://example.test/licence-length', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          cookie: length.headers.get('set-cookie')?.split(';')[0] ?? '',
        },
        body: form(tokenFrom(lengthHtml), { 'licence-length': 'not-a-length' }),
      }),
    );
    assert.equal(posted.status, 303);
    const components = await defaults.handle(new Request('http://example.test/components'));
    assert.equal(components.status, demosEnabledFromEnv() ? 200 : 404);

    const incomplete = createClient();
    await incomplete.send('/');
    const denied = await incomplete.send('/check-answers', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form(tokenFrom((await incomplete.send('/')).text), {}),
    });
    assert.equal(denied.location, '/licence-length');
  });
});
