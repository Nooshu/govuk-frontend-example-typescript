import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { componentsRoot } from '../config.js';
import { isComponentName } from './names.js';

export type MacroParams = Record<string, unknown>;

export type Fixture = {
  name: string;
  options: MacroParams;
  html: string;
  hidden: boolean;
  description: string;
};

export type ComponentFixtures = {
  component: string;
  fixtures: Fixture[];
};

const cache = new Map<string, ComponentFixtures>();

export function listComponentNames(root = componentsRoot): string[] {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isComponentName(entry.name))
    .map((entry) => entry.name)
    .sort();
}

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

export function getFixture(
  componentName: string,
  fixtureName: string,
  root = componentsRoot,
): Fixture | undefined {
  return loadComponentFixtures(componentName, root).fixtures.find(
    (fixture) => fixture.name === fixtureName,
  );
}

export function clearFixtureCache(): void {
  cache.clear();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
