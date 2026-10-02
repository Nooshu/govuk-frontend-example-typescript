import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FRONTEND_VERSION, demosEnabledFromEnv, resolvePort } from './config.js';

describe('config', () => {
  it('pins GOV.UK Frontend 6.5.1', () => {
    assert.equal(FRONTEND_VERSION, '6.5.1');
  });

  it('keeps demos on unless DEMOS_ENABLED turns them off', () => {
    assert.equal(demosEnabledFromEnv({ NODE_ENV: 'production' }), true);
    assert.equal(demosEnabledFromEnv({ NODE_ENV: 'development' }), true);
    assert.equal(demosEnabledFromEnv({}), true);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: 'true', NODE_ENV: 'production' }), true);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: '1', NODE_ENV: 'production' }), true);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: 'yes', NODE_ENV: 'production' }), true);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: ' TRUE ' }), true);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: 'false', NODE_ENV: 'development' }), false);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: '0' }), false);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: 'no' }), false);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: 'maybe', NODE_ENV: 'production' }), true);
    assert.equal(demosEnabledFromEnv({ DEMOS_ENABLED: '  ' }), true);
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
