import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SERVICE_NAME } from './config.js';
import { escapeHtml, pageTitle, safeLocalPath } from './html.js';

describe('html', () => {
  it('escapes text the way Nunjucks does', () => {
    assert.equal(escapeHtml(`&<>"'`), '&amp;&lt;&gt;&quot;&#39;');
  });

  it('builds a document title', () => {
    assert.equal(pageTitle(SERVICE_NAME, SERVICE_NAME, false), `${SERVICE_NAME} – GOV.UK`);
    assert.equal(pageTitle('Help', SERVICE_NAME, false), `Help – ${SERVICE_NAME} – GOV.UK`);
    assert.equal(
      pageTitle('Your name', SERVICE_NAME, true),
      `Error: Your name – ${SERVICE_NAME} – GOV.UK`,
    );
  });

  it('allows only same-origin paths', () => {
    assert.equal(
      safeLocalPath('/task-list?return=check-answers'),
      '/task-list?return=check-answers',
    );
    assert.equal(safeLocalPath('https://example.com'), '/');
    assert.equal(safeLocalPath('//example.com'), '/');
    assert.equal(safeLocalPath('/\\evil'), '/');
    assert.equal(safeLocalPath('name'), '/');
    assert.equal(safeLocalPath('/ok\n'), '/');
    assert.equal(safeLocalPath('/ok\r'), '/');
  });
});
