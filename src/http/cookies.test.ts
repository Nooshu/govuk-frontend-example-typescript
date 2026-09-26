import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseCookieHeader } from './cookies.js';

describe('cookies', () => {
  it('parses a cookie header', () => {
    assert.equal(parseCookieHeader(null).size, 0);
    assert.equal(parseCookieHeader('').size, 0);
    const cookies = parseCookieHeader(
      'rod_session=abc%20def; bare; =nope; broken=%E0%A4; plain=ok',
    );
    assert.equal(cookies.get('rod_session'), 'abc def');
    assert.equal(cookies.has('bare'), false);
    assert.equal(cookies.has(''), false);
    assert.equal(cookies.get('broken'), '%E0%A4');
    assert.equal(cookies.get('plain'), 'ok');
  });
});
