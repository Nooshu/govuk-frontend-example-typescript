import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { catalogueNames, describeComponent, listCatalogue } from './catalogue.js';
import { listComponentNames } from './fixtures.js';

describe('component catalogue', () => {
  it('documents every component shipped in this Frontend release', () => {
    const installed = listComponentNames();
    assert.deepEqual([...catalogueNames()].sort(), installed);
    const catalogue = listCatalogue();
    assert.equal(catalogue.length, installed.length);
    for (const item of catalogue) {
      assert.ok(item.title.length > 0);
      assert.ok(item.description.length > 0);
      assert.match(item.designSystemUrl, /^https:\/\/design-system\.service\.gov\.uk\//);
      for (const link of item.usedOn) {
        assert.match(link.href, /^\//);
        assert.ok(link.text.length > 0);
      }
    }
  });

  it('falls back for a name that is not in the catalogue', () => {
    const info = describeComponent('not-a-real-component');
    assert.equal(info.title, 'Not A Real Component');
    assert.equal(info.usedOn.length, 0);
    assert.match(info.designSystemUrl, /not-a-real-component/);
  });
});
