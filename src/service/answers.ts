import type { Application } from './model.js';
import { requiredStepsComplete, type StepId } from './model.js';
import {
  CONTACT_OPTIONS,
  labelFor,
  LICENCE_LENGTHS,
  NOT_SURE,
  REGIONS,
  startMonths,
} from './options.js';

export type SummaryRow = {
  key: { text: string };
  value: { text: string };
  actions: { items: { href: string; text: string; visuallyHiddenText: string }[] };
};

export function summaryRows(application: Application, now: Date): SummaryRow[] {
  return [
    row('Name', joinName(application), '/name', 'name'),
    row('Date of birth', formatDob(application), '/date-of-birth', 'date of birth'),
    row('Email address', application.email, '/email', 'email address'),
    row(
      'Contact preference',
      labelFor(CONTACT_OPTIONS, application.contactBy),
      '/contact-preference',
      'contact preference',
    ),
    row('Telephone number', application.telephone, '/contact-preference', 'telephone number'),
    row(
      'Where you will fish',
      formatRegions(application.regions),
      '/where-you-will-fish',
      'where you will fish',
    ),
    row(
      'Licence length',
      labelFor(LICENCE_LENGTHS, application.licenceLength),
      '/licence-length',
      'licence length',
    ),
    row(
      'Start month',
      labelFor(startMonths(now), application.startMonth),
      '/start-month',
      'start month',
    ),
    row('Address', formatAddress(application), '/address', 'address'),
    row('Evidence', application.evidenceFilename, '/evidence', 'evidence'),
    row(
      'Additional details',
      application.additionalDetails,
      '/additional-details',
      'additional details',
    ),
    row('Password', application.passwordCreated ? 'Set' : '', '/create-a-password', 'password'),
  ];
}

export type TaskSection = {
  heading: string;
  idPrefix: string;
  items: Record<string, unknown>[];
};

export function taskSections(application: Application): TaskSection[] {
  const ready = requiredStepsComplete(application);
  return [
    {
      heading: 'Personal details',
      idPrefix: 'personal-details',
      items: [
        task(application, 'name', 'Your name'),
        task(application, 'date-of-birth', 'Date of birth'),
        task(application, 'email', 'Email address'),
        task(application, 'contact-preference', 'Contact preference'),
      ],
    },
    {
      heading: 'Your licence',
      idPrefix: 'your-licence',
      items: [
        task(application, 'where-you-will-fish', 'Where you will fish'),
        task(application, 'licence-length', 'Licence length'),
        task(application, 'start-month', 'Start month'),
      ],
    },
    {
      heading: 'More about you',
      idPrefix: 'more-about-you',
      items: [
        task(application, 'address', 'Your address'),
        task(application, 'evidence', 'Concession evidence'),
        task(application, 'additional-details', 'Additional details'),
        task(application, 'create-a-password', 'Password'),
      ],
    },
    {
      heading: 'Apply',
      idPrefix: 'apply',
      items: [
        {
          title: { text: 'Check your answers and submit' },
          ...(ready ? { href: '/check-answers' } : {}),
          status: ready
            ? application.submitted
              ? { text: 'Completed' }
              : { tag: { text: 'Not started', classes: 'govuk-tag--grey' } }
            : { tag: { text: 'Cannot start yet', classes: 'govuk-tag--grey' } },
        },
      ],
    },
  ];
}

function task(application: Application, id: StepId, text: string): Record<string, unknown> {
  const done = application.completed.includes(id);
  return {
    title: { text },
    href: `/${id}`,
    status: done
      ? { text: 'Completed' }
      : { tag: { text: 'Not started', classes: 'govuk-tag--grey' } },
  };
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

function joinName(application: Application): string {
  return `${application.firstName} ${application.lastName}`.trim();
}

function formatDob(application: Application): string {
  const day = Number(application.day);
  const month = Number(application.month);
  const year = Number(application.year);
  if (!day || !month || !year) return '';
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCDate() !== day || date.getUTCMonth() !== month - 1) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatRegions(regions: readonly string[]): string {
  if (regions.includes(NOT_SURE)) return 'Not decided yet';
  return regions.map((region) => labelFor(REGIONS, region)).join(', ');
}

function formatAddress(application: Application): string {
  return [
    application.addressLine1,
    application.addressLine2,
    application.town,
    application.postcode,
  ]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(', ');
}
