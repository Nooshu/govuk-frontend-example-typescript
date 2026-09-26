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

export function isKnownComponent(componentName: string): boolean {
  return known.has(componentName);
}

/**
 * Render a GOV.UK Frontend component by calling its Nunjucks macro.
 * The result matches official `fixtures.json` HTML (outer whitespace trimmed).
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
