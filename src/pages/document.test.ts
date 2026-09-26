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
          'nonce',
          true,
        ),
      /both a back link and breadcrumbs/,
    );
  });
});
