import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createApplication } from './model.js';
import {
  saveAddress,
  saveContact,
  saveDetails,
  saveEmail,
  saveEvidence,
  saveLicence,
  saveMonth,
  saveName,
  savePassword,
  saveRegions,
  saveDate,
} from './save.js';

describe('saving answers', () => {
  it('stores trimmed answers and completion', () => {
    let application = createApplication();
    application = saveName(application, ' Ada ', ' Lovelace ', true);
    application = saveName(application, ' Ada ', ' Lovelace ', true);
    assert.equal(application.firstName, 'Ada');
    assert.deepEqual(application.completed, ['name']);

    application = saveName(application, '', 'Lovelace', false);
    assert.equal(application.completed.includes('name'), false);

    application = saveDate(application, '31', '3', '1980', true);
    application = saveEmail(application, ' ada@example.com ', true);
    application = saveContact(application, 'email', '  ', true);
    application = saveContact(application, 'fax', '1', false);
    assert.equal(application.contactBy, '');
    application = saveRegions(application, ['wales', 'nope'], true);
    assert.deepEqual(application.regions, ['wales']);
    application = saveLicence(application, 'nope', false);
    assert.equal(application.licenceLength, '');
    application = saveLicence(application, '8-day', true);
    application = saveMonth(application, '2026-09', true);
    application = saveAddress(
      application,
      { line1: ' 1 Road ', line2: ' ', town: ' London ', postcode: 'sw1a1aa' },
      true,
    );
    assert.equal(application.postcode, 'SW1A 1AA');
    application = saveAddress(
      application,
      { line1: '1 Road', line2: '', town: 'London', postcode: 'bad' },
      false,
    );
    assert.equal(application.postcode, 'bad');
    application = saveDetails(application, 'Bank fishing', true);
    application = savePassword(application, true);
    assert.equal(application.passwordCreated, true);
    application = savePassword(application, false);
    assert.equal(application.passwordCreated, false);
  });

  it('keeps the previous evidence file unless a new valid file is uploaded', () => {
    let application = saveEvidence(createApplication(), undefined, true);
    assert.equal(application.evidenceFilename, '');
    application = saveEvidence(application, 'concession.pdf', true);
    application = saveEvidence(application, 'notes.txt', false);
    assert.equal(application.evidenceFilename, 'concession.pdf');
    application = saveEvidence(application, undefined, false);
    assert.equal(application.evidenceFilename, 'concession.pdf');
    application = saveEvidence(application, 'next.png', true);
    assert.equal(application.evidenceFilename, 'next.png');
  });
});
