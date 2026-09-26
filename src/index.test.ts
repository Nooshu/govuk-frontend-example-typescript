import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { greet } from './index.js';

describe('greet', () => {
  it('returns a ready message', () => {
    assert.equal(greet('GDS'), 'GOV.UK Frontend TypeScript example ready for GDS');
  });
});
