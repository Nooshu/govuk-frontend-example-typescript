import { randomBytes } from 'node:crypto';
import { gzipSync } from 'node:zlib';

/**
 * Create a per-request CSP nonce.
 *
 * @returns 16 random bytes, base64-encoded.
 */
export function createNonce(): string {
  return randomBytes(16).toString('base64');
}

/**
 * Security headers for an HTML or text response.
 *
 * @param nonce - CSP nonce for scripts on this response.
 * @returns Header names and values. The policy allows Frontend assets from this origin only.
 */
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

/**
 * Whether a response body is worth gzip-compressing.
 *
 * @param contentType - Response `Content-Type`.
 * @returns `true` for text, JSON, JavaScript, and SVG.
 */
export function isCompressible(contentType: string): boolean {
  return /^(text\/|application\/(javascript|json)|image\/svg\+xml)/.test(contentType);
}

/**
 * Gzip a response body when the client accepts it and the type is compressible.
 *
 * @param body - Response body.
 * @param acceptEncoding - Request `Accept-Encoding` header, or `null`.
 * @param contentType - Response `Content-Type`.
 * @returns The original body, or a gzip body with `encoding` set to `gzip`.
 */
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
