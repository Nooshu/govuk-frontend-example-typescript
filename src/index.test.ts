import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FRONTEND_VERSION, createApp, demosEnabledFromEnv, resolvePort } from './index.js';

describe('public entry', () => {
  it('exports the pinned Frontend release and the app', () => {
    assert.equal(FRONTEND_VERSION, '6.5.1');
    assert.equal(typeof demosEnabledFromEnv, 'function');
    assert.equal(typeof resolvePort, 'function');
    assert.equal(typeof createApp, 'function');
  });
});
