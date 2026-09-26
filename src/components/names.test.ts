import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isComponentName, macroNameFor, titleFromKebab } from './names.js';

describe('component names', () => {
  it('accepts kebab-case component names', () => {
    assert.equal(isComponentName('button'), true);
    assert.equal(isComponentName('date-input'), true);
    assert.equal(isComponentName('a1'), true);
    assert.equal(isComponentName(''), false);
    assert.equal(isComponentName('Button'), false);
    assert.equal(isComponentName('date_input'), false);
    assert.equal(isComponentName('-button'), false);
  });

  it('matches Nunjucks macro names', () => {
    assert.equal(macroNameFor('button'), 'govukButton');
    assert.equal(macroNameFor('date-input'), 'govukDateInput');
    assert.equal(macroNameFor('input'), 'govukInput');
    assert.equal(titleFromKebab('service-navigation'), 'Service Navigation');
    assert.equal(titleFromKebab('hint'), 'Hint');
  });
});
