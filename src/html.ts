/**
 * Escape text the way Nunjucks `escape` does, including `&#39;` for apostrophes.
 *
 * @param value - Plain text.
 * @returns Text safe to place in HTML.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Build the document `<title>`.
 *
 * @param heading - Page `h1`.
 * @param serviceName - Service name for this language.
 * @param hasErrors - When true, prefix the title with `Error: `.
 * @returns The title text, without duplicating the service name when it is the heading.
 */
export function pageTitle(heading: string, serviceName: string, hasErrors: boolean): string {
  const prefix = hasErrors ? 'Error: ' : '';
  if (heading === serviceName) return `${prefix}${serviceName} – GOV.UK`;
  return `${prefix}${heading} – ${serviceName} – GOV.UK`;
}

/**
 * Allow only a same-origin path.
 *
 * @param value - Candidate return path.
 * @returns `value` when it is a local path, otherwise `/`.
 */
export function safeLocalPath(value: string): string {
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('://') ||
    value.includes('\\')
  ) {
    return '/';
  }
  if (value.includes('\r') || value.includes('\n')) return '/';
  return value;
}
