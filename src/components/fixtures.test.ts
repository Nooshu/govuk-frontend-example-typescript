import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearFixtureCache,
  getFixture,
  listComponentNames,
  loadComponentFixtures,
  parseFixturesDocument,
} from './fixtures.js';

describe('fixtures', () => {
  it('lists installed components and caches their fixtures', () => {
    const names = listComponentNames();
    assert.ok(names.includes('button'));
    assert.ok(names.includes('date-input'));
    assert.deepEqual(names, [...names].sort());

    clearFixtureCache();
    const first = loadComponentFixtures('button');
    const second = loadComponentFixtures('button');
    assert.equal(first, second);
    assert.equal(
      getFixture('button', first.fixtures[0]?.name ?? '')?.html,
      first.fixtures[0]?.html,
    );
    assert.equal(getFixture('button', 'not-a-fixture'), undefined);
    assert.throws(() => loadComponentFixtures('../button'), /Unknown/);
    clearFixtureCache();
    assert.notEqual(loadComponentFixtures('button'), first);
  });

  it('rejects malformed fixture documents', () => {
    assert.throws(() => parseFixturesDocument('button', null), /Invalid fixtures/);
    assert.throws(() => parseFixturesDocument('button', []), /Invalid fixtures/);
    assert.throws(() => parseFixturesDocument('button', { fixtures: 'no' }), /Invalid fixtures/);
    assert.throws(() => parseFixturesDocument('button', { fixtures: [null] }), /Invalid fixture/);
    assert.throws(
      () => parseFixturesDocument('button', { fixtures: [{ name: 'a' }] }),
      /Invalid fixture/,
    );
    assert.throws(
      () =>
        parseFixturesDocument('button', { fixtures: [{ name: 'a', html: '<p>', options: [] }] }),
      /Invalid fixture options/,
    );

    const parsed = parseFixturesDocument('button', {
      fixtures: [
        { name: 'plain', html: '<p>Hi</p>' },
        { name: 'hidden', html: '<p>No</p>', hidden: true, description: 'Shown in the suite only' },
        {
          name: 'noted',
          html: '<p>Yes</p>',
          hidden: false,
          description: 12,
          options: { text: 'Yes' },
        },
      ],
    });
    assert.equal(parsed.fixtures[0]?.options && Object.keys(parsed.fixtures[0].options).length, 0);
    assert.equal(parsed.fixtures[0]?.hidden, false);
    assert.equal(parsed.fixtures[0]?.description, '');
    assert.equal(parsed.fixtures[1]?.hidden, true);
    assert.equal(parsed.fixtures[1]?.description, 'Shown in the suite only');
    assert.equal(parsed.fixtures[2]?.description, '');
    assert.equal(parsed.fixtures[2]?.options.text, 'Yes');
  });

  it('ignores files and directories that are not component names', () => {
    const root = mkdtempSync(join(tmpdir(), 'govuk-fixtures-'));
    writeFileSync(join(root, 'readme.txt'), 'not a component');
    mkdirSync(join(root, 'Not-A-Name'));
    mkdirSync(join(root, 'button'));
    writeFileSync(join(root, 'button', 'fixtures.json'), JSON.stringify({ fixtures: [] }));
    assert.deepEqual(listComponentNames(root), ['button']);
    assert.deepEqual(loadComponentFixtures('button', root).fixtures, []);
  });
});
