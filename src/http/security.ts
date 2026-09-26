import { randomBytes } from 'node:crypto';
import { gzipSync } from 'node:zlib';

export function createNonce(): string {
  return randomBytes(16).toString('base64');
}

export function securityHeaders(nonce: string): Record<string, string> {
  return {
    'content-security-policy': [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      "style-src 'self'",
      "img-src 'self'",
      "font-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
    ].join('; '),
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  };
}

export function isCompressible(contentType: string): boolean {
  return /^(text\/|application\/(javascript|json)|image\/svg\+xml)/.test(contentType);
}

export function maybeGzip(
  body: Buffer,
  acceptEncoding: string | null,
  contentType: string,
): { body: Buffer; encoding?: 'gzip' } {
  if (!isCompressible(contentType) || body.length === 0 || !acceptEncoding?.includes('gzip')) {
    return { body };
  }
  return { body: gzipSync(body), encoding: 'gzip' };
}
