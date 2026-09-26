import { createRequire } from 'node:module';
import type { Template } from 'nunjucks';

import { govukDist } from '../config.js';
import { listComponentNames, type MacroParams } from './fixtures.js';
import { isComponentName, macroNameFor } from './names.js';

const require = createRequire(import.meta.url);
const nunjucks = require('nunjucks') as typeof import('nunjucks');

const known = new Set(listComponentNames());

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(govukDist), {
  autoescape: true,
  trimBlocks: true,
  lstripBlocks: true,
});

const compiled = new Map<string, Template>();

/**
 * Whether this Frontend package ships a component with this name.
 *
 * @param componentName - Kebab-case component name.
 * @returns `true` when a matching component directory exists.
 */
export function isKnownComponent(componentName: string): boolean {
  return known.has(componentName);
}

/**
 * Render a GOV.UK Frontend component by calling its Nunjucks macro.
 *
 * The result matches official `fixtures.json` HTML. Only the renderer's own outer whitespace is trimmed.
 *
 * @param componentName - Kebab-case component name.
 * @param params - Macro options. Defaults to an empty object.
 * @returns The macro HTML.
 * @throws Error when the component is not in this Frontend package.
 */
export function renderComponent(componentName: string, params: MacroParams = {}): string {
  if (!isComponentName(componentName) || !known.has(componentName)) {
    throw new Error(`Unknown GOV.UK Frontend component: ${componentName}`);
  }
  let template = compiled.get(componentName);
  if (!template) {
    const macroName = macroNameFor(componentName);
    const source = `{%- from "govuk/components/${componentName}/macro.njk" import ${macroName} -%}{{- ${macroName}(params) -}}`;
    template = nunjucks.compile(source, env);
    compiled.set(componentName, template);
  }
  return template.render({ params }).trim();
}
