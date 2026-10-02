import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parityBanner } from '../components/preview.js';
import { createSession } from '../session/store.js';
import { renderPage } from './document.js';

describe('page document', () => {
  it('refuses a page that has both a back link and breadcrumbs', () => {
    assert.throws(
      () =>
        renderPage(
          {
            template: 'pages/help.njk',
            status: 200,
            heading: 'Help',
            backLink: { href: '/', text: 'Back' },
            breadcrumbs: { items: [{ text: 'Help' }] },
            context: { accordion: { items: [] } },
          },
          createSession(),
          new URL('http://example.test/help'),
          true,
        ),
      /both a back link and breadcrumbs/,
    );
  });

  it('includes the demo banner and noindex,nofollow on every page', () => {
    const html = renderPage(
      {
        template: 'pages/about.njk',
        status: 200,
        heading: 'About this example',
        context: { frontendVersion: '6.5.1' },
      },
      createSession(),
      new URL('http://example.test/about'),
      true,
    );
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.match(html, /This is a live demo\. It is not a real government service\./);
    assert.match(html, /govuk-notification-banner app-notification-banner--demo/);
    assert.match(
      html,
      /id="main-content"[^>]*>\s*<div class="govuk-notification-banner app-notification-banner--demo"/,
    );
    assert.match(html, /href="\/" class="govuk-header__homepage-link"/);
    assert.doesNotMatch(html, /href="\/\/gov\.uk" class="govuk-header__homepage-link"/);
  });

  it('shows the fixture match banner only when the rendered HTML matches', () => {
    const session = createSession();
    const url = new URL('http://example.test/components/back-link');
    const context = {
      componentName: 'back-link',
      componentTitle: 'Back link',
      designSystemUrl: 'https://design-system.service.gov.uk/components/back-link/',
      frontendVersion: '6.5.1',
      description: '',
      fixtureName: 'default',
      rendered: '<a href="#" class="govuk-back-link">Back</a>',
      parity: parityBanner(true),
      mismatch: parityBanner(false),
      fixtures: [
        { name: 'default', href: 'default', current: true },
        { name: 'inverse', href: 'inverse', current: false },
      ],
    };
    const matched = renderPage(
      {
        template: 'pages/component.njk',
        status: 200,
        heading: 'Back link',
        backLink: { href: '/components', text: 'Back' },
        context: { ...context, matches: true },
      },
      session,
      url,
      true,
    );
    assert.match(matched, /HTML matches the fixture/);
    assert.doesNotMatch(matched, /HTML does not match the fixture/);
    assert.match(matched, /app-component-preview__frame/);
    assert.match(matched, /Versions \(Fixtures\)/);
    assert.match(matched, /govuk-tag/);

    const missed = renderPage(
      {
        template: 'pages/component.njk',
        status: 200,
        heading: 'Back link',
        backLink: { href: '/components', text: 'Back' },
        context: { ...context, matches: false },
      },
      session,
      url,
      true,
    );
    assert.doesNotMatch(missed, /HTML matches the fixture/);
    assert.match(missed, /HTML does not match the fixture/);
  });
});
