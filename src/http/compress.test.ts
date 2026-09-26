import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';

import { compressBody, isCompressible } from './compress.js';

describe('compression', () => {
  it('prefers Brotli and falls back to gzip', () => {
    assert.equal(isCompressible('text/html; charset=utf-8'), true);
    assert.equal(isCompressible('application/javascript'), true);
    assert.equal(isCompressible('application/json'), true);
    assert.equal(isCompressible('image/svg+xml'), true);
    assert.equal(isCompressible('font/woff2'), false);

    const plain = Buffer.from('hello');
    assert.equal(compressBody(plain, null, 'text/plain').encoding, undefined);
    assert.equal(compressBody(plain, 'identity', 'text/plain').encoding, undefined);
    assert.equal(compressBody(plain, 'gzip, , identity', 'text/plain').encoding, 'gzip');
    assert.equal(compressBody(Buffer.alloc(0), 'br', 'text/plain').encoding, undefined);
    assert.equal(compressBody(plain, 'br, gzip', 'font/woff2').encoding, undefined);

    const brotli = compressBody(plain, 'gzip;q=1.0, br;q=0.9', 'text/html');
    assert.equal(brotli.encoding, 'br');
    assert.equal(brotliDecompressSync(brotli.body).toString('utf8'), 'hello');

    const gzip = compressBody(plain, 'gzip, deflate', 'text/html');
    assert.equal(gzip.encoding, 'gzip');
    assert.equal(gunzipSync(gzip.body).toString('utf8'), 'hello');
  });
});
