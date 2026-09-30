import type { LicenceLength } from './model.js';

/** Countries the applicant can fish in. */
export const COUNTRIES = [
  { value: 'England', text: 'England' },
  { value: 'Wales', text: 'Wales' },
  { value: 'Scotland', text: 'Scotland' },
] as const;

/** Licence lengths shown on the question (no fees). */
export const LICENCE_LENGTHS: { value: LicenceLength; text: string }[] = [
  { value: '1-day', text: '1 day' },
  { value: '8-days', text: '8 days' },
  { value: '12-months', text: '12 months' },
];

/** Fees shown on the separate fees demo page. */
export const LICENCE_FEES: { text: string; fee: string }[] = [
  { text: '1 day', fee: '£7.10' },
  { text: '8 days', fee: '£14.20' },
  { text: '12 months', fee: '£36.80' },
];

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
