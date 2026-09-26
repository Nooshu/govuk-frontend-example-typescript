import { brotliCompressSync, gzipSync } from 'node:zlib';

/**
 * Whether a response body is worth compressing.
 *
 * @param contentType - Response `Content-Type`.
 * @returns `true` for text, JSON, JavaScript, and SVG.
 */
export function isCompressible(contentType: string): boolean {
  return /^(text\/|application\/(javascript|json)|image\/svg\+xml)/.test(contentType);
}

/**
 * Compress a response body. Brotli (`br`) is the standard. Gzip is the fallback
 * when the client does not advertise `br`.
 *
 * @param body - Response body.
 * @param acceptEncoding - Request `Accept-Encoding` header, or `null`.
 * @param contentType - Response `Content-Type`.
 * @returns The original body, or a compressed body with `encoding` set.
 */
export function compressBody(
  body: Buffer,
  acceptEncoding: string | null,
  contentType: string,
): { body: Buffer; encoding?: 'br' | 'gzip' } {
  if (!isCompressible(contentType) || body.length === 0) return { body };
  const accepted = encodings(acceptEncoding);
  if (accepted.has('br')) return { body: brotliCompressSync(body), encoding: 'br' };
  if (accepted.has('gzip')) return { body: gzipSync(body), encoding: 'gzip' };
  return { body };
}

function encodings(header: string | null): Set<string> {
  const found = new Set<string>();
  if (!header) return found;
  for (const part of header.split(',')) {
    const token = part.split(';')[0]!.trim().toLowerCase();
    if (token) found.add(token);
  }
  return found;
}
