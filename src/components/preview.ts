import type { Fixture } from './fixtures.js';

export function selectFixture(
  fixtures: readonly Fixture[],
  requested: string | null,
): Fixture | undefined {
  if (requested) return fixtures.find((fixture) => fixture.name === requested);
  return fixtures.find((fixture) => !fixture.hidden) ?? fixtures[0];
}

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
