import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { componentsRoot } from '../config.js';
import { listComponentNames, loadComponentFixtures } from './fixtures.js';
import { macroNameFor } from './names.js';
import { isKnownComponent, renderComponent } from './render.js';

describe('Nunjucks macro rendering', { timeout: 120_000 }, () => {
  it('uses the macro name declared in each macro.njk', () => {
    for (const name of listComponentNames()) {
      const source = readFileSync(join(componentsRoot, name, 'macro.njk'), 'utf8');
      assert.match(source, new RegExp(`macro ${macroNameFor(name)}\\(`));
    }
  });

  it('matches every official fixture, including hidden ones', () => {
    let count = 0;
    for (const name of listComponentNames()) {
      for (const fixture of loadComponentFixtures(name).fixtures) {
        assert.equal(
          renderComponent(name, fixture.options),
          fixture.html,
          `${name} / ${fixture.name}`,
        );
        count += 1;
      }
    }
    assert.ok(count > 700);
    assert.match(renderComponent('button'), /govuk-button/);
    assert.equal(isKnownComponent('button'), true);
    assert.equal(isKnownComponent('not-a-component'), false);
    assert.throws(() => renderComponent('not-a-component'), /Unknown GOV.UK Frontend component/);
    assert.throws(() => renderComponent('Button'), /Unknown GOV.UK Frontend component/);
  });
});
