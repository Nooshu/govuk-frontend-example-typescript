import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  asContactBy,
  asLicenceLength,
  clean,
  normalisePostcode,
  safeFilename,
  validateAdditionalDetails,
  validateAddress,
  validateContactPreference,
  validateCookieChoice,
  validateDateOfBirth,
  validateEmail,
  validateEvidence,
  validateLicenceLength,
  validateName,
  validatePassword,
  validateRegions,
  validateStartMonth,
} from './validate.js';

const now = new Date(Date.UTC(2026, 8, 26));

describe('validation', () => {
  it('validates names, email, and contact preference', () => {
    assert.equal(validateName(' Ada ', ' Lovelace ').length, 0);
    assert.equal(validateName(' ', ' ').length, 2);
    assert.equal(validateName('A'.repeat(101), 'B'.repeat(101)).length, 2);
    assert.equal(validateEmail('ada@example.com').length, 0);
    assert.match(validateEmail('not-an-email')[0]?.text ?? '', /correct format/);

    assert.equal(validateContactPreference('email', '').length, 0);
    assert.equal(validateContactPreference('email', '01632 960 001').length, 0);
    assert.equal(validateContactPreference('email', '12').length, 1);
    assert.equal(validateContactPreference('telephone', '').length, 1);
    assert.equal(validateContactPreference('telephone', '12').length, 1);
    assert.equal(validateContactPreference('telephone', '01632 960 001').length, 0);
    assert.equal(validateContactPreference('fax', '01632 960 001').length, 1);
    assert.equal(validateContactPreference('fax', '12').length, 2);
    assert.equal(asContactBy('email'), 'email');
    assert.equal(asContactBy('telephone'), 'telephone');
    assert.equal(asContactBy('fax'), '');
  });

  it('validates date of birth against a fixed today', () => {
    assert.equal(validateDateOfBirth('31', '3', '1980', now).length, 0);
    assert.equal(validateDateOfBirth('26', '9', '2013', now).length, 0);
    assert.equal(validateDateOfBirth('25', '9', '2013', now).length, 0);
    assert.match(validateDateOfBirth('', '9', '2013', now)[0]?.text ?? '', /day, month and year/);
    assert.match(validateDateOfBirth('ab', '9', '2013', now)[0]?.text ?? '', /real date/);
    assert.match(validateDateOfBirth('31', '2', '2000', now)[0]?.text ?? '', /real date/);
    assert.match(validateDateOfBirth('27', '9', '2026', now)[0]?.text ?? '', /past/);
    assert.match(validateDateOfBirth('27', '9', '2013', now)[0]?.text ?? '', /13 or over/);
    assert.match(validateDateOfBirth('1', '10', '2013', now)[0]?.text ?? '', /13 or over/);
  });

  it('validates where, when, and how long', () => {
    assert.equal(validateRegions(['wales', 'midlands']).length, 0);
    assert.equal(validateRegions(['not-sure']).length, 0);
    assert.match(validateRegions([])[0]?.text ?? '', /where you will fish/);
    assert.match(validateRegions(['not-sure', 'wales'])[0]?.text ?? '', /not decided/);
    assert.match(validateRegions(['nope'])[0]?.text ?? '', /where you will fish/);
    assert.equal(validateLicenceLength('12-month').length, 0);
    assert.equal(validateLicenceLength('nope').length, 1);
    assert.equal(asLicenceLength('1-day'), '1-day');
    assert.equal(asLicenceLength('8-day'), '8-day');
    assert.equal(asLicenceLength('12-month'), '12-month');
    assert.equal(asLicenceLength('nope'), '');
    assert.equal(validateStartMonth('2026-09', now).length, 0);
    assert.equal(validateStartMonth('1999-01', now).length, 1);
  });

  it('validates address, evidence, details, password, and cookies', () => {
    assert.equal(validateAddress('1 Road', 'London', 'sw1a 1aa').length, 0);
    assert.equal(validateAddress('', '', 'bad').length, 3);
    assert.equal(validateAddress('A'.repeat(101), 'London', 'SW1A 1AA').length, 1);
    assert.equal(normalisePostcode('sw1a1aa'), 'SW1A 1AA');
    assert.equal(normalisePostcode('a1'), '');
    assert.equal(clean('  ada  '), 'ada');

    assert.equal(validateEvidence('').length, 0);
    assert.equal(validateEvidence('concession.pdf').length, 0);
    assert.equal(validateEvidence('photo.JPEG').length, 0);
    assert.equal(validateEvidence('notes.txt').length, 1);

    assert.equal(validateAdditionalDetails('a'.repeat(200)).length, 0);
    assert.equal(validateAdditionalDetails('a'.repeat(201)).length, 1);
    assert.equal(validatePassword('longenough', 'longenough').length, 0);
    assert.equal(validatePassword('short', 'short').length, 1);
    assert.equal(validatePassword('longenough', 'different').length, 1);
    assert.equal(validateCookieChoice('yes').length, 0);
    assert.equal(validateCookieChoice('no').length, 0);
    assert.equal(validateCookieChoice('').length, 1);
  });

  it('keeps only a safe file name', () => {
    assert.equal(safeFilename(''), undefined);
    assert.equal(safeFilename('.'), undefined);
    assert.equal(safeFilename('..'), undefined);
    assert.equal(safeFilename('folder/concession.pdf'), 'concession.pdf');
    assert.equal(safeFilename('folder\\concession.pdf'), 'concession.pdf');
    assert.equal(safeFilename('../secret.pdf'), 'secret.pdf');
    assert.equal(safeFilename('bad<name>.pdf'), undefined);
    assert.equal(safeFilename(`${'a'.repeat(121)}.pdf`), undefined);
    assert.equal(safeFilename('my file.pdf'), 'my file.pdf');
  });
});
