import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { gunzipSync } from 'node:zlib';

import { createNonce, isCompressible, maybeGzip, securityHeaders } from './security.js';

describe('security headers', () => {
  it('creates a nonce and a locked-down policy', () => {
    const nonce = createNonce();
    assert.equal(Buffer.from(nonce, 'base64').length, 16);
    const headers = securityHeaders(nonce);
    assert.ok((headers['content-security-policy'] ?? '').includes(`nonce-${nonce}`));
    assert.match(headers['content-security-policy'] ?? '', /frame-ancestors 'none'/);
    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.equal(headers['x-frame-options'], 'DENY');
  });

  it('gzips compressible responses when the client accepts gzip', () => {
    assert.equal(isCompressible('text/html; charset=utf-8'), true);
    assert.equal(isCompressible('application/javascript'), true);
    assert.equal(isCompressible('application/json'), true);
    assert.equal(isCompressible('image/svg+xml'), true);
    assert.equal(isCompressible('font/woff2'), false);

    const plain = Buffer.from('hello');
    assert.equal(maybeGzip(plain, null, 'text/plain').encoding, undefined);
    assert.equal(maybeGzip(plain, 'identity', 'text/plain').encoding, undefined);
    assert.equal(maybeGzip(Buffer.alloc(0), 'gzip', 'text/plain').encoding, undefined);
    assert.equal(maybeGzip(plain, 'gzip', 'font/woff2').encoding, undefined);

    const compressed = maybeGzip(plain, 'gzip, deflate', 'text/html');
    assert.equal(compressed.encoding, 'gzip');
    assert.equal(gunzipSync(compressed.body).toString('utf8'), 'hello');
  });
});
