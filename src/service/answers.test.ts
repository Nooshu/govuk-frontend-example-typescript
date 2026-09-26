import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createApplication, type Application } from './model.js';
import { summaryRows, taskSections } from './answers.js';

const now = new Date(Date.UTC(2026, 8, 26));

function filled(): Application {
  return {
    ...createApplication(),
    firstName: 'Ada',
    lastName: 'Lovelace',
    day: '31',
    month: '3',
    year: '1980',
    email: 'ada@example.com',
    contactBy: 'email',
    telephone: '',
    regions: ['not-sure'],
    licenceLength: '12-month',
    startMonth: '2026-09',
    addressLine1: '1 Road',
    addressLine2: '',
    town: 'London',
    postcode: 'SW1A 1AA',
    evidenceFilename: 'concession.pdf',
    additionalDetails: 'Bank fishing',
    passwordCreated: true,
    completed: [
      'name',
      'date-of-birth',
      'email',
      'contact-preference',
      'where-you-will-fish',
      'licence-length',
      'start-month',
      'address',
      'evidence',
      'additional-details',
      'create-a-password',
    ],
  };
}

describe('answers and tasks', () => {
  it('summarises empty and completed applications', () => {
    const empty = summaryRows(createApplication(), now);
    assert.equal(empty[0]?.value.text, 'Not provided');
    assert.equal(empty[1]?.value.text, 'Not provided');
    assert.match(empty[0]?.actions.items[0]?.href ?? '', /return=check-answers/);

    const rows = summaryRows(filled(), now);
    assert.equal(rows[0]?.value.text, 'Ada Lovelace');
    assert.match(rows[1]?.value.text ?? '', /1980/);
    assert.equal(rows[5]?.value.text, 'Not decided yet');
    assert.equal(rows[6]?.value.text, '12 months');
    assert.match(rows[8]?.value.text ?? '', /1 Road, London, SW1A 1AA/);
    assert.equal(rows[11]?.value.text, 'Set');

    const regions = summaryRows(
      { ...filled(), regions: ['wales', 'midlands'], day: '31', month: '2', year: '2000' },
      now,
    );
    assert.match(regions[5]?.value.text ?? '', /Wales, Midlands/);
    assert.equal(regions[1]?.value.text, 'Not provided');
  });

  it('shows whether the final task can start', () => {
    const blocked = taskSections(createApplication());
    const blockedApply = blocked[3]?.items[0] as {
      href?: string;
      status: { tag?: { text: string } };
    };
    assert.equal(blockedApply.href, undefined);
    assert.equal(blockedApply.status.tag?.text, 'Cannot start yet');
    const nameTask = blocked[0]?.items[0] as { status: { tag?: { text: string }; text?: string } };
    assert.equal(nameTask.status.tag?.text, 'Not started');

    const readyApplication = filled();
    const ready = taskSections(readyApplication);
    const readyApply = ready[3]?.items[0] as { href?: string; status: { tag?: { text: string } } };
    assert.equal(readyApply.href, '/check-answers');
    assert.equal(readyApply.status.tag?.text, 'Not started');
    const done = ready[0]?.items[0] as { status: { text?: string } };
    assert.equal(done.status.text, 'Completed');

    const submitted = taskSections({ ...readyApplication, submitted: true });
    const submittedApply = submitted[3]?.items[0] as { status: { text?: string } };
    assert.equal(submittedApply.status.text, 'Completed');
  });
});
