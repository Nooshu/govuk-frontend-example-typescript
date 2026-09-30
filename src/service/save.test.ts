import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createApplication } from './model.js';
import { saveCountry, saveDate, saveEmail, saveLicence, saveName } from './save.js';

describe('saving answers', () => {
  it('stores trimmed answers and completion', () => {
    let application = createApplication();
    application = saveLicence(application, '12-months', true);
    application = saveLicence(application, '12-months', true);
    assert.equal(application.licenceLength, '12-months');
    assert.deepEqual(application.completed, ['licence-length']);

    application = saveLicence(application, 'nope', false);
    assert.equal(application.licenceLength, '');
    assert.equal(application.completed.includes('licence-length'), false);

    application = saveName(application, ' Ada Lovelace ', true);
    assert.equal(application.fullName, 'Ada Lovelace');
    application = saveName(application, '', false);
    assert.equal(application.completed.includes('name'), false);

    application = saveDate(application, '31', '3', '1980', true);
    application = saveCountry(application, 'England', true);
    application = saveEmail(application, ' ada@example.com ', true);
    assert.equal(application.email, 'ada@example.com');
    assert.equal(application.country, 'England');
  });
});
