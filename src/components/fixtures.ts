import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { componentsRoot } from '../config.js';
import { isComponentName } from './names.js';

/**
 * Options object passed to a GOV.UK Frontend Nunjucks macro.
 */
export type MacroParams = Record<string, unknown>;

/**
 * One official fixture from a component's `fixtures.json`.
 */
export type Fixture = {
  name: string;
  options: MacroParams;
  html: string;
  hidden: boolean;
  description: string;
};

/**
 * Parsed fixtures for one component.
 */
export type ComponentFixtures = {
  component: string;
  fixtures: Fixture[];
};

const cache = new Map<string, ComponentFixtures>();

/**
 * List component directory names that match {@link isComponentName}.
 *
 * @param root - Components directory. Defaults to the installed Frontend package.
 * @returns Sorted component names.
 */
export function listComponentNames(root = componentsRoot): string[] {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isComponentName(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/**
 * Parse a `fixtures.json` document.
 *
 * @param componentName - Component the document belongs to.
 * @param raw - Parsed JSON.
 * @returns The fixtures, including hidden ones.
 * @throws Error when the document or a fixture is not the expected shape.
 */
export function parseFixturesDocument(componentName: string, raw: unknown): ComponentFixtures {
  if (!isRecord(raw) || !Array.isArray(raw.fixtures)) {
    throw new Error(`Invalid fixtures for ${componentName}`);
  }
  const fixtures: Fixture[] = raw.fixtures.map((entry, index) => {
    if (!isRecord(entry) || typeof entry.name !== 'string' || typeof entry.html !== 'string') {
      throw new Error(`Invalid fixture ${componentName}#${index}`);
    }
    const options = entry.options === undefined ? {} : entry.options;
    if (!isRecord(options))
      throw new Error(`Invalid fixture options for ${componentName}/${entry.name}`);
    return {
      name: entry.name,
      options,
      html: entry.html,
      hidden: entry.hidden === true,
      description: typeof entry.description === 'string' ? entry.description : '',
    };
  });
  return { component: componentName, fixtures };
}

/**
 * Load and cache `fixtures.json` for one component.
 *
 * @param componentName - Kebab-case component name.
 * @param root - Components directory. Defaults to the installed Frontend package.
 * @returns The parsed fixtures.
 * @throws Error when the name is unknown or the file cannot be parsed.
 */
export function loadComponentFixtures(
  componentName: string,
  root = componentsRoot,
): ComponentFixtures {
  const cached = cache.get(`${root}:${componentName}`);
  if (cached) return cached;
  if (!isComponentName(componentName)) {
    throw new Error(`Unknown GOV.UK Frontend component: ${componentName}`);
  }
  const raw: unknown = JSON.parse(readFileSync(join(root, componentName, 'fixtures.json'), 'utf8'));
  const parsed = parseFixturesDocument(componentName, raw);
  cache.set(`${root}:${componentName}`, parsed);
  return parsed;
}

/**
 * Find one fixture by name.
 *
 * @param componentName - Kebab-case component name.
 * @param fixtureName - Fixture `name` from `fixtures.json`.
 * @param root - Components directory. Defaults to the installed Frontend package.
 * @returns The fixture, or `undefined` when that name is not present.
 */
export function getFixture(
  componentName: string,
  fixtureName: string,
  root = componentsRoot,
): Fixture | undefined {
  return loadComponentFixtures(componentName, root).fixtures.find(
    (fixture) => fixture.name === fixtureName,
  );
}

/** Drop cached fixture documents. Used by tests that point at a temporary directory. */
export function clearFixtureCache(): void {
  cache.clear();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
