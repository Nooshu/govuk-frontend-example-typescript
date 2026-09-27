import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
    assert.match(html, /govuk-notification-banner/);
  });
});
