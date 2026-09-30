import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { COUNTRIES, labelFor, LICENCE_LENGTHS } from './options.js';

describe('service options', () => {
  it('lists countries and licence lengths', () => {
    assert.equal(COUNTRIES.length, 3);
    assert.equal(LICENCE_LENGTHS.length, 3);
    assert.equal(labelFor(LICENCE_LENGTHS, '12-months'), '12 months');
    assert.equal(labelFor(COUNTRIES, 'England'), 'England');
    assert.equal(labelFor(COUNTRIES, 'missing'), 'missing');
  });
});
