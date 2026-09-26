import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { labelFor, startMonths } from './options.js';

describe('service options', () => {
  it('lists the next 12 months and looks up labels', () => {
    const months = startMonths(new Date(Date.UTC(2026, 11, 15)));
    assert.equal(months.length, 12);
    assert.equal(months[0]?.value, '2026-12');
    assert.equal(months[11]?.value, '2027-11');
    assert.equal(labelFor(months, '2026-12'), months[0]?.text);
    assert.equal(labelFor(months, 'missing'), 'missing');
  });
});
