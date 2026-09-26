/** Nunjucks `escape` entities, including `&#39;` for apostrophes. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function pageTitle(heading: string, serviceName: string, hasErrors: boolean): string {
  const prefix = hasErrors ? 'Error: ' : '';
  if (heading === serviceName) return `${prefix}${serviceName} – GOV.UK`;
  return `${prefix}${heading} – ${serviceName} – GOV.UK`;
}

/** Allow only same-origin paths. Anything else becomes the service start page. */
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
