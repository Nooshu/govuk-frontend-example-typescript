import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  asLicenceLength,
  clean,
  validateCookieChoice,
  validateCountry,
  validateDateOfBirth,
  validateEmail,
  validateLicenceLength,
  validateName,
} from './validate.js';

const now = new Date(Date.UTC(2026, 8, 26));

describe('validation', () => {
  it('validates full name and email', () => {
    assert.equal(validateName(' Ada Lovelace ').length, 0);
    assert.equal(validateName(' ').length, 1);
    assert.equal(validateName('A').length, 1);
    assert.equal(validateName('A'.repeat(101)).length, 1);
    assert.equal(validateEmail('ada@example.com').length, 0);
    assert.match(validateEmail('not-an-email')[0]?.text ?? '', /correct format/);
  });

  it('validates date of birth against a fixed today', () => {
    assert.equal(validateDateOfBirth('31', '3', '1980', now).length, 0);
    assert.equal(validateDateOfBirth('26', '9', '2013', now).length, 0);
    assert.match(validateDateOfBirth('', '9', '2013', now)[0]?.text ?? '', /date of birth/);
    assert.match(validateDateOfBirth('ab', '9', '2013', now)[0]?.text ?? '', /real date/);
    assert.match(validateDateOfBirth('31', '2', '2000', now)[0]?.text ?? '', /real date/);
    assert.match(validateDateOfBirth('27', '9', '2026', now)[0]?.text ?? '', /past/);
    assert.match(validateDateOfBirth('27', '9', '2013', now)[0]?.text ?? '', /at least 13/);
    assert.match(validateDateOfBirth('1', '10', '2013', now)[0]?.text ?? '', /at least 13/);
  });

  it('validates country and licence length', () => {
    assert.equal(validateCountry('England').length, 0);
    assert.equal(validateCountry('Wales').length, 0);
    assert.equal(validateCountry('Scotland').length, 0);
    assert.match(validateCountry('')[0]?.text ?? '', /where you will fish/);
    assert.match(validateCountry('France')[0]?.text ?? '', /where you will fish/);
    assert.equal(validateLicenceLength('12-months').length, 0);
    assert.equal(validateLicenceLength('nope').length, 1);
    assert.equal(asLicenceLength('1-day'), '1-day');
    assert.equal(asLicenceLength('8-days'), '8-days');
    assert.equal(asLicenceLength('12-months'), '12-months');
    assert.equal(asLicenceLength('12-month'), '');
    assert.equal(clean('  ada  '), 'ada');
  });

  it('validates cookie choices', () => {
    assert.equal(validateCookieChoice('yes').length, 0);
    assert.equal(validateCookieChoice('no').length, 0);
    assert.equal(validateCookieChoice('').length, 1);
  });
});
