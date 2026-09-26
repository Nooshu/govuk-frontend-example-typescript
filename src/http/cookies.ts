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

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
