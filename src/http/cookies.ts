/** Options for a `Set-Cookie` header. Omitted fields use safe defaults. */
export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Lax' | 'Strict' | 'None';
  path?: string;
  maxAge?: number;
};

/**
 * Parse a `Cookie` request header.
 *
 * @param header - Raw header, or `null` when the request has none.
 * @returns Cookie names and decoded values. Invalid encodings are kept as written.
 */
export function parseCookieHeader(header: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name) cookies.set(name, decodeCookieValue(value));
  }
  return cookies;
}

/**
 * Serialise one `Set-Cookie` header.
 *
 * @param name - Cookie name.
 * @param value - Cookie value. It is percent-encoded.
 * @param options - Path, lifetime, and flags. `HttpOnly` and `SameSite=Lax` are the defaults.
 * @returns The header value, without the `Set-Cookie:` prefix.
 */
export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path ?? '/'}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly !== false) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  parts.push(`SameSite=${options.sameSite ?? 'Lax'}`);
  return parts.join('; ');
}

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
