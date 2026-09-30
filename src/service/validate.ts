import type { LicenceLength } from './model.js';
import { COUNTRIES, LICENCE_LENGTHS } from './options.js';

/** One field error for the error summary and the field. */
export type FieldError = {
  field: string;
  href: string;
  text: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate the full name.
 *
 * @param fullName - Name as posted.
 * @returns Field errors. An empty list means the answer can be saved.
 */
export function validateName(fullName: string): FieldError[] {
  const name = clean(fullName);
  if (name.length < 2) {
    return [{ field: 'full-name', href: '#full-name', text: 'Enter your full name' }];
  }
  if (name.length > 100) {
    return [
      {
        field: 'full-name',
        href: '#full-name',
        text: 'Full name must be 100 characters or fewer',
      },
    ];
  }
  return [];
}

/**
 * Validate the date of birth. The applicant must be 13 or older on `now`.
 *
 * @param day - Day as posted.
 * @param month - Month as posted.
 * @param year - Year as posted.
 * @param now - Clock used for the age check. The comparison is UTC.
 * @returns Field errors.
 */
export function validateDateOfBirth(
  day: string,
  month: string,
  year: string,
  now: Date,
): FieldError[] {
  const error = (text: string): FieldError[] => [
    { field: 'date-of-birth', href: '#date-of-birth-day', text },
  ];
  if (!clean(day) || !clean(month) || !clean(year)) {
    return error('Enter your date of birth');
  }
  if (
    !/^\d{1,2}$/.test(clean(day)) ||
    !/^\d{1,2}$/.test(clean(month)) ||
    !/^\d{4}$/.test(clean(year))
  ) {
    return error('Enter a real date of birth');
  }
  const dayNumber = Number(clean(day));
  const monthNumber = Number(clean(month));
  const yearNumber = Number(clean(year));
  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));
  const real =
    date.getUTCFullYear() === yearNumber &&
    date.getUTCMonth() === monthNumber - 1 &&
    date.getUTCDate() === dayNumber;
  if (!real) return error('Enter a real date of birth');
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (date.getTime() > today.getTime()) return error('Date of birth must be in the past');
  if (ageOn(date, today) < 13) return error('You must be at least 13 to use this example');
  return [];
}

/**
 * Validate the email address.
 *
 * @param email - Address as posted.
 * @returns Field errors.
 */
export function validateEmail(email: string): FieldError[] {
  if (!EMAIL.test(clean(email))) {
    return [
      {
        field: 'email',
        href: '#email',
        text: 'Enter an email address in the correct format, like name@example.com',
      },
    ];
  }
  return [];
}

/**
 * Validate where the applicant will fish.
 *
 * @param country - Selected country.
 * @returns Field errors.
 */
export function validateCountry(country: string): FieldError[] {
  if (!COUNTRIES.some((option) => option.value === country)) {
    return [{ field: 'country', href: '#country', text: 'Select where you will fish' }];
  }
  return [];
}

/**
 * Validate the licence length.
 *
 * @param value - Posted licence length.
 * @returns Field errors.
 */
export function validateLicenceLength(value: string): FieldError[] {
  if (!LICENCE_LENGTHS.some((option) => option.value === value)) {
    return [
      {
        field: 'licence-length',
        href: '#licence-length',
        text: 'Select how long you need the licence for',
      },
    ];
  }
  return [];
}

/**
 * Validate the cookie settings answer.
 *
 * @param value - `yes` or `no`.
 * @returns Field errors.
 */
export function validateCookieChoice(value: string): FieldError[] {
  if (value !== 'yes' && value !== 'no') {
    return [
      {
        field: 'analytics',
        href: '#analytics',
        text: 'Select yes if you want to accept analytics cookies',
      },
    ];
  }
  return [];
}

/**
 * Trim surrounding whitespace.
 *
 * @param value - Raw field value.
 * @returns The trimmed value.
 */
export function clean(value: string): string {
  return value.trim();
}

/**
 * Narrow a posted licence length.
 *
 * @param value - Posted value.
 * @returns The licence length, or an empty string when it is not one of the options.
 */
export function asLicenceLength(value: string): LicenceLength | '' {
  return value === '1-day' || value === '8-days' || value === '12-months' ? value : '';
}

function ageOn(dob: Date, today: Date): number {
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - dob.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getUTCDate() < dob.getUTCDate())) age -= 1;
  return age;
}
