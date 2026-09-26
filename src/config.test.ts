import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FRONTEND_VERSION, demosEnabledFromEnv, resolvePort } from './config.js';

describe('config', () => {
  it('pins GOV.UK Frontend 6.5.1', () => {
    assert.equal(FRONTEND_VERSION, '6.5.1');
  });

  it('enables demos unless NODE_ENV is production', () => {
    assert.equal(demosEnabledFromEnv({ NODE_ENV: 'production' }), false);
    assert.equal(demosEnabledFromEnv({ NODE_ENV: 'development' }), true);
    assert.equal(demosEnabledFromEnv({}), true);
    assert.equal(typeof demosEnabledFromEnv(), 'boolean');
  });

  it('resolves a TCP port', () => {
    assert.equal(resolvePort({}), 3000);
    assert.equal(resolvePort({ PORT: '' }), 3000);
    assert.equal(resolvePort({ PORT: '0' }), 0);
    assert.equal(resolvePort({ PORT: '65535' }), 65535);
    assert.equal(typeof resolvePort(), 'number');
    assert.throws(() => resolvePort({ PORT: 'nope' }), /Invalid PORT/);
    assert.throws(() => resolvePort({ PORT: '-1' }), /Invalid PORT/);
    assert.throws(() => resolvePort({ PORT: '65536' }), /Invalid PORT/);
    assert.throws(() => resolvePort({ PORT: '1.5' }), /Invalid PORT/);
  });
});
