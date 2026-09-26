const COMPONENT_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isComponentName(name: string): boolean {
  return COMPONENT_NAME.test(name);
}

/** `date-input` → `govukDateInput`, matching `macro.njk`. */
export function macroNameFor(componentName: string): string {
  const pascal = componentName
    .split('-')
    .map((part) => {
      const first = part.charAt(0).toUpperCase();
      return `${first}${part.slice(1)}`;
    })
    .join('');
  return `govuk${pascal}`;
}

export function titleFromKebab(componentName: string): string {
  const words = componentName.split('-').map((part) => {
    const first = part.charAt(0).toUpperCase();
    return `${first}${part.slice(1)}`;
  });
  return words.join(' ');
}
