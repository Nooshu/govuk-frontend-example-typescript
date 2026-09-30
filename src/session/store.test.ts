import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMemoryStore, createSession, referenceFor } from './store.js';

describe('sessions', () => {
  it('stores sessions in memory and builds a reference', () => {
    const session = createSession();
    assert.equal(session.cookieChoice, null);
    assert.equal(session.application.submitted, false);
    assert.match(referenceFor(session.id), /^FR\d{8}$/);

    const store = createMemoryStore();
    assert.equal(store.get('missing'), undefined);
    const created = store.create();
    created.application.fullName = 'Ada Lovelace';
    store.save(created);
    assert.equal(store.get(created.id)?.application.fullName, 'Ada Lovelace');
  });
});
