import type { ContactBy, LicenceLength } from './model.js';

/** Regions the applicant can fish in. */
export const REGIONS = [
  { value: 'north-west', text: 'North West' },
  { value: 'north-east', text: 'North East' },
  { value: 'midlands', text: 'Midlands' },
  { value: 'south-west', text: 'South West' },
  { value: 'south-east', text: 'South East' },
  { value: 'wales', text: 'Wales' },
] as const;

/** Checkbox value for an applicant who is not sure where they will fish. */
export const NOT_SURE = 'not-sure';

/** Licence lengths and the example fee shown for each. */
export const LICENCE_LENGTHS: { value: LicenceLength; text: string; fee: string }[] = [
  { value: '1-day', text: '1 day', fee: '£7.10' },
  { value: '8-day', text: '8 days', fee: '£14.20' },
  { value: '12-month', text: '12 months', fee: '£36.80' },
];

/** Contact methods on the contact-preference question. */
export const CONTACT_OPTIONS: { value: ContactBy; text: string }[] = [
  { value: 'email', text: 'Email' },
  { value: 'telephone', text: 'Telephone' },
];

/**
 * The next 12 months the licence can start, from `now`.
 *
 * @param now - Clock used to choose the first month. Dates are UTC.
 * @returns Select options with a `YYYY-MM` value and an English month label.
 */
export function startMonths(now: Date): { value: string; text: string }[] {
  const months: { value: string; text: string }[] = [];
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  for (let index = 0; index < 12; index += 1) {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    const value = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const text = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
    months.push({ value, text });
  }
  return months;
}

/**
 * Label for a selected option value.
 *
 * @param options - Options that have `value` and `text`.
 * @param value - Selected value.
 * @returns The matching label, or `value` when it is not in the list.
 */
export function labelFor(
  options: readonly { value: string; text: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.text ?? value;
}
