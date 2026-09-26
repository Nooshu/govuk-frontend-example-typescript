const COMPONENT_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Whether `name` is a kebab-case GOV.UK Frontend component directory.
 *
 * @param name - Candidate component name.
 * @returns `true` when the name matches Frontend's directory pattern.
 */
export function isComponentName(name: string): boolean {
  return COMPONENT_NAME.test(name);
}

/**
 * Nunjucks macro name for a component, matching `macro.njk`.
 *
 * @param componentName - Kebab-case component name, such as `date-input`.
 * @returns The macro name, such as `govukDateInput`.
 */
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

/**
 * Turn a kebab-case component name into a title.
 *
 * @param componentName - Kebab-case name.
 * @returns Words with an initial capital, separated by spaces.
 */
export function titleFromKebab(componentName: string): string {
  const words = componentName.split('-').map((part) => {
    const first = part.charAt(0).toUpperCase();
    return `${first}${part.slice(1)}`;
  });
  return words.join(' ');
}
