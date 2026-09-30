import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createApplication, type Application } from './model.js';
import { summaryRows } from './answers.js';

function filled(): Application {
  return {
    ...createApplication(),
    licenceLength: '12-months',
    fullName: 'Ada Lovelace',
    day: '31',
    month: '3',
    year: '1980',
    country: 'England',
    email: 'ada@example.com',
    completed: ['licence-length', 'name', 'date-of-birth', 'where-you-will-fish', 'email'],
  };
}

describe('answers', () => {
  it('summarises empty and completed applications', () => {
    const empty = summaryRows(createApplication());
    assert.equal(empty[0]?.value.text, 'Not provided');
    assert.equal(empty[1]?.value.text, 'Not provided');
    assert.match(empty[0]?.actions.items[0]?.href ?? '', /return=check-answers/);

    const rows = summaryRows(filled());
    assert.equal(rows[0]?.value.text, '12 months');
    assert.equal(rows[1]?.value.text, 'Ada Lovelace');
    assert.equal(rows[2]?.value.text, '31 3 1980');
    assert.equal(rows[3]?.value.text, 'England');
    assert.equal(rows[4]?.value.text, 'ada@example.com');
  });
});
