import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Fixture } from './fixtures.js';
import { parityBanner, selectFixture } from './preview.js';

function fixture(name: string, hidden = false): Fixture {
  return { name, options: {}, html: '', hidden, description: '' };
}

describe('preview selection', () => {
  it('selects the requested fixture, otherwise the first visible one', () => {
    const fixtures = [fixture('hidden', true), fixture('visible')];
    assert.equal(selectFixture(fixtures, 'hidden')?.name, 'hidden');
    assert.equal(selectFixture(fixtures, 'missing'), undefined);
    assert.equal(selectFixture(fixtures, null)?.name, 'visible');
    assert.equal(selectFixture(fixtures, '')?.name, 'visible');
    assert.equal(selectFixture([fixture('only', true)], null)?.name, 'only');
    assert.equal(selectFixture([], null), undefined);
  });

  it('describes a parity match and a mismatch', () => {
    assert.equal(parityBanner(true).type, 'success');
    assert.equal(parityBanner(false).type, undefined);
    assert.match(String(parityBanner(false).titleText), /does not match/);
  });
});
