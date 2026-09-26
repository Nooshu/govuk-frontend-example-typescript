import type { Fixture } from './fixtures.js';

/**
 * Choose the fixture to preview.
 *
 * @param fixtures - Fixtures for one component.
 * @param requested - Requested fixture name, or `null` to use the default.
 * @returns The named fixture, otherwise the first fixture that is not hidden, otherwise the first fixture.
 */
export function selectFixture(
  fixtures: readonly Fixture[],
  requested: string | null,
): Fixture | undefined {
  if (requested) return fixtures.find((fixture) => fixture.name === requested);
  return fixtures.find((fixture) => !fixture.hidden) ?? fixtures[0];
}

/**
 * Notification banner params for a fixture preview.
 *
 * @param matches - Whether the macro HTML equals the fixture `html`.
 * @returns Params for the notification banner macro.
 */
export function parityBanner(matches: boolean): Record<string, unknown> {
  if (matches) {
    return {
      type: 'success',
      titleText: 'HTML matches the fixture',
      text: 'The macro output is the same as the official fixture HTML.',
    };
  }
  return {
    titleText: 'HTML does not match the fixture',
    text: 'The macro output is different from the official fixture HTML.',
  };
}
