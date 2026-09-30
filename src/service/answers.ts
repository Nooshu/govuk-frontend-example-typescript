import type { Application } from './model.js';
import { labelFor, LICENCE_LENGTHS } from './options.js';

/** One row of the check-your-answers summary. */
export type SummaryRow = {
  key: { text: string };
  value: { text: string };
  actions: { items: { href: string; text: string; visuallyHiddenText: string }[] };
};

/**
 * Check-your-answers rows, including change links back to each question.
 *
 * @param application - Current answers.
 * @returns Summary list rows in journey order.
 */
export function summaryRows(application: Application): SummaryRow[] {
  return [
    row(
      'Licence length',
      labelFor(LICENCE_LENGTHS, application.licenceLength),
      '/licence-length',
      'licence length',
    ),
    row('Name', application.fullName, '/name', 'name'),
    row('Date of birth', formatDob(application), '/date-of-birth', 'date of birth'),
    row('Where you will fish', application.country, '/where-you-will-fish', 'where you will fish'),
    row('Email address', application.email, '/email', 'email address'),
  ];
}

function row(key: string, value: string, href: string, hidden: string): SummaryRow {
  return {
    key: { text: key },
    value: { text: value.trim() ? value : 'Not provided' },
    actions: {
      items: [{ href: `${href}?return=check-answers`, text: 'Change', visuallyHiddenText: hidden }],
    },
  };
}

function formatDob(application: Application): string {
  const day = application.day.trim();
  const month = application.month.trim();
  const year = application.year.trim();
  if (!day || !month || !year) return '';
  return `${day} ${month} ${year}`;
}
