import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createApplication } from './model.js';
import {
  confirmationPanel,
  cookieFields,
  countryFields,
  dateField,
  emailField,
  errorSummary,
  feesTable,
  guidanceTabs,
  helpAccordion,
  licenceFields,
  nameField,
} from './forms.js';
import type { FieldError } from './validate.js';

const error = (field: string): FieldError => ({ field, href: `#${field}`, text: 'Fix this' });

describe('form fields', () => {
  it('adds an error summary only when there are errors', () => {
    assert.equal(errorSummary([]), undefined);
    const summary = errorSummary([error('email')]);
    assert.ok(summary);
    assert.equal(summary.titleText, 'There is a problem');
  });

  it('builds question fields with and without errors', () => {
    const application = createApplication();
    assert.equal(
      nameField(application, []).fullName &&
        'errorMessage' in (nameField(application, []).fullName as object),
      false,
    );
    const named = nameField({ ...application, fullName: 'Ada Lovelace' }, [error('full-name')]);
    assert.equal(
      (named.fullName as { errorMessage?: { text: string } }).errorMessage?.text,
      'Fix this',
    );

    assert.equal(
      (emailField(application, []).email as { label: { isPageHeading: boolean } }).label
        .isPageHeading,
      true,
    );
    assert.ok(
      (emailField(application, [error('email')]).email as { errorMessage?: unknown }).errorMessage,
    );

    assert.equal(
      (dateField(application, []).dateOfBirth as { errorMessage?: unknown }).errorMessage,
      undefined,
    );
    assert.ok(
      (dateField(application, [error('date-of-birth')]).dateOfBirth as { errorMessage?: unknown })
        .errorMessage,
    );

    const country = countryFields({ ...application, country: 'Wales' }, [error('country')]);
    assert.ok((country.radios as { errorMessage?: unknown }).errorMessage);
    assert.equal(
      (countryFields(application, []).radios as { items: { checked?: boolean }[] }).items[0]
        ?.checked,
      false,
    );

    const licence = licenceFields({ ...application, licenceLength: '8-days' }, [
      error('licence-length'),
    ]);
    assert.ok((licence.radios as { errorMessage?: unknown }).errorMessage);
    assert.equal(
      (licenceFields(application, []).radios as { items: { checked?: boolean }[] }).items[1]
        ?.checked,
      false,
    );

    assert.equal(
      (cookieFields(null, []).radios as { items: { checked?: boolean }[] }).items[0]?.checked,
      false,
    );
    assert.equal(
      (cookieFields('accept', []).radios as { items: { checked?: boolean }[] }).items[0]?.checked,
      true,
    );
    assert.equal(
      (cookieFields('reject', [error('analytics')]).radios as { items: { checked?: boolean }[] })
        .items[1]?.checked,
      true,
    );
  });

  it('builds the shared content components', () => {
    assert.equal((feesTable().rows as unknown[]).length, 3);
    assert.equal((helpAccordion().items as unknown[]).length, 3);
    assert.equal((guidanceTabs().items as unknown[]).length, 3);
    assert.match(String(confirmationPanel(`<script>'"`).html), /&lt;script&gt;&#39;&quot;/);
    assert.match(String(confirmationPanel('FR1').html), /Your example reference number/);
  });
});
