import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createApplication } from './model.js';
import {
  addressFields,
  confirmationPanel,
  contactFields,
  cookieFields,
  dateField,
  detailsField,
  emailField,
  errorSummary,
  evidenceField,
  feesTable,
  guidanceTabs,
  helpAccordion,
  licenceFields,
  monthField,
  nameFields,
  passwordFields,
  regionFields,
} from './forms.js';
import type { FieldError } from './validate.js';

const now = new Date(Date.UTC(2026, 8, 26));
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
      nameFields(application, []).firstName &&
        'errorMessage' in (nameFields(application, []).firstName as object),
      false,
    );
    const named = nameFields({ ...application, firstName: 'Ada' }, [error('first-name')]);
    assert.equal(
      (named.firstName as { errorMessage?: { text: string } }).errorMessage?.text,
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

    const emailContact = contactFields({ ...application, contactBy: 'email' }, []);
    const phoneContact = contactFields(
      { ...application, contactBy: 'telephone', telephone: '01632 960 001' },
      [error('contact-by'), error('telephone')],
    );
    const emptyContact = contactFields(application, []);
    assert.equal(
      (emailContact.radios as { items: { checked?: boolean }[] }).items[0]?.checked,
      true,
    );
    assert.equal(
      (phoneContact.radios as { items: { checked?: boolean }[] }).items[1]?.checked,
      true,
    );
    assert.equal(
      (emptyContact.radios as { items: { checked?: boolean }[] }).items[0]?.checked,
      false,
    );
    assert.ok((phoneContact.radios as { errorMessage?: unknown }).errorMessage);

    const regions = regionFields({ ...application, regions: ['wales', 'not-sure'] }, [
      error('regions'),
    ]);
    assert.ok((regions.checkboxes as { errorMessage?: unknown }).errorMessage);
    assert.equal(
      regionFields(application, []).checkboxes &&
        'errorMessage' in (regionFields(application, []).checkboxes as object),
      false,
    );

    const licence = licenceFields({ ...application, licenceLength: '8-day' }, [
      error('licence-length'),
    ]);
    assert.ok((licence.radios as { errorMessage?: unknown }).errorMessage);
    assert.equal(
      (licenceFields(application, []).radios as { items: { checked?: boolean }[] }).items[1]
        ?.checked,
      false,
    );

    const month = monthField(
      { ...application, startMonth: '2026-09' },
      [error('start-month')],
      now,
    );
    assert.ok((month.select as { errorMessage?: unknown }).errorMessage);
    const emptyMonth = monthField(application, [], now).select as {
      items: { selected?: boolean }[];
    };
    assert.equal(emptyMonth.items[0]?.selected, true);

    assert.ok(
      addressFields(application, [error('address-line-1'), error('town'), error('postcode')]).line1,
    );
    assert.equal(
      evidenceField({ ...application, evidenceFilename: 'a.pdf' }, [error('evidence')]).currentFile,
      'a.pdf',
    );
    assert.ok(
      (
        detailsField(application, [error('additional-details')]).details as {
          errorMessage?: unknown;
        }
      ).errorMessage,
    );
    assert.ok(
      (passwordFields([error('password')]).password as { errorMessage?: unknown }).errorMessage,
    );
    assert.ok(
      (passwordFields([error('password-confirm')]).confirm as { errorMessage?: unknown })
        .errorMessage,
    );
    assert.equal(
      (passwordFields([]).password as { errorMessage?: unknown }).errorMessage,
      undefined,
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
  });
});
