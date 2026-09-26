import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseCookieHeader, serializeCookie } from './cookies.js';

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

  it('serialises cookie attributes', () => {
    assert.equal(serializeCookie('a', 'b c'), 'a=b%20c; Path=/; HttpOnly; SameSite=Lax');
    assert.equal(
      serializeCookie('a', 'b', {
        httpOnly: false,
        secure: true,
        sameSite: 'Strict',
        path: '/app',
        maxAge: 10,
      }),
      'a=b; Path=/app; Max-Age=10; Secure; SameSite=Strict',
    );
    assert.match(serializeCookie('a', 'b', { httpOnly: true }), /HttpOnly/);
  });
});
