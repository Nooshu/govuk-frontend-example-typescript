import type { ContactBy, LicenceLength } from './model.js';
import { LICENCE_LENGTHS, NOT_SURE, REGIONS, startMonths } from './options.js';

export type FieldError = {
  field: string;
  href: string;
  text: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+() -]{8,20}$/;
const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/;
const EVIDENCE = /\.(pdf|png|jpe?g)$/i;

export function validateName(firstName: string, lastName: string): FieldError[] {
  const errors: FieldError[] = [];
  if (!clean(firstName)) {
    errors.push({ field: 'first-name', href: '#first-name', text: 'Enter your first name' });
  } else if (clean(firstName).length > 100) {
    errors.push({
      field: 'first-name',
      href: '#first-name',
      text: 'First name must be 100 characters or fewer',
    });
  }
  if (!clean(lastName)) {
    errors.push({ field: 'last-name', href: '#last-name', text: 'Enter your last name' });
  } else if (clean(lastName).length > 100) {
    errors.push({
      field: 'last-name',
      href: '#last-name',
      text: 'Last name must be 100 characters or fewer',
    });
  }
  return errors;
}

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
    return error('Date of birth must include a day, month and year');
  }
  if (
    !/^\d{1,2}$/.test(clean(day)) ||
    !/^\d{1,2}$/.test(clean(month)) ||
    !/^\d{4}$/.test(clean(year))
  ) {
    return error('Date of birth must be a real date');
  }
  const dayNumber = Number(clean(day));
  const monthNumber = Number(clean(month));
  const yearNumber = Number(clean(year));
  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));
  const real =
    date.getUTCFullYear() === yearNumber &&
    date.getUTCMonth() === monthNumber - 1 &&
    date.getUTCDate() === dayNumber;
  if (!real) return error('Date of birth must be a real date');
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (date.getTime() > today.getTime()) return error('Date of birth must be in the past');
  if (ageOn(date, today) < 13) return error('You must be 13 or over to apply for a rod licence');
  return [];
}

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

export function validateContactPreference(contactBy: string, telephone: string): FieldError[] {
  const errors: FieldError[] = [];
  if (contactBy !== 'email' && contactBy !== 'telephone') {
    errors.push({
      field: 'contact-by',
      href: '#contact-by',
      text: 'Select how we should contact you',
    });
  }
  if (contactBy === 'telephone' && !clean(telephone)) {
    errors.push({ field: 'telephone', href: '#telephone', text: 'Enter a telephone number' });
  } else if (clean(telephone) && !PHONE.test(clean(telephone))) {
    errors.push({
      field: 'telephone',
      href: '#telephone',
      text: 'Enter a telephone number, like 01632 960 001',
    });
  }
  return errors;
}

export function validateRegions(regions: readonly string[]): FieldError[] {
  const known = new Set<string>(REGIONS.map((region) => region.value));
  const selected = regions.filter((region) => region !== NOT_SURE);
  const exclusive = regions.includes(NOT_SURE);
  if (regions.length === 0) {
    return [{ field: 'regions', href: '#regions', text: 'Select where you will fish' }];
  }
  if (exclusive && selected.length > 0) {
    return [
      {
        field: 'regions',
        href: '#regions',
        text: 'Select where you will fish, or select that you have not decided yet',
      },
    ];
  }
  if (selected.some((region) => !known.has(region))) {
    return [{ field: 'regions', href: '#regions', text: 'Select where you will fish' }];
  }
  return [];
}

export function validateLicenceLength(value: string): FieldError[] {
  if (!LICENCE_LENGTHS.some((option) => option.value === value)) {
    return [
      {
        field: 'licence-length',
        href: '#licence-length',
        text: 'Select how long you need a licence for',
      },
    ];
  }
  return [];
}

export function validateStartMonth(value: string, now: Date): FieldError[] {
  if (!startMonths(now).some((month) => month.value === value)) {
    return [
      { field: 'start-month', href: '#start-month', text: 'Select when the licence should start' },
    ];
  }
  return [];
}

export function validateAddress(line1: string, town: string, postcode: string): FieldError[] {
  const errors: FieldError[] = [];
  if (!clean(line1))
    errors.push({ field: 'address-line-1', href: '#address-line-1', text: 'Enter address line 1' });
  else if (clean(line1).length > 100) {
    errors.push({
      field: 'address-line-1',
      href: '#address-line-1',
      text: 'Address line 1 must be 100 characters or fewer',
    });
  }
  if (!clean(town)) errors.push({ field: 'town', href: '#town', text: 'Enter a town or city' });
  const normalised = normalisePostcode(postcode);
  if (!normalised || !POSTCODE.test(normalised)) {
    errors.push({ field: 'postcode', href: '#postcode', text: 'Enter a full UK postcode' });
  }
  return errors;
}

export function validateEvidence(filename: string): FieldError[] {
  if (!filename) return [];
  if (!EVIDENCE.test(filename)) {
    return [
      {
        field: 'evidence',
        href: '#evidence',
        text: 'The selected file must be a PDF, PNG, or JPG',
      },
    ];
  }
  return [];
}

export function validateAdditionalDetails(value: string): FieldError[] {
  if ([...value].length > 200) {
    return [
      {
        field: 'additional-details',
        href: '#additional-details',
        text: 'Additional details must be 200 characters or fewer',
      },
    ];
  }
  return [];
}

export function validatePassword(password: string, confirm: string): FieldError[] {
  if (password.length < 8) {
    return [
      { field: 'password', href: '#password', text: 'Password must be at least 8 characters' },
    ];
  }
  if (password !== confirm) {
    return [
      {
        field: 'password-confirm',
        href: '#password-confirm',
        text: 'Enter the same password in both fields',
      },
    ];
  }
  return [];
}

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

export function normalisePostcode(value: string): string {
  const compact = clean(value).toUpperCase().replaceAll(' ', '');
  if (compact.length < 5) return '';
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export function clean(value: string): string {
  return value.trim();
}

export function asContactBy(value: string): ContactBy | '' {
  return value === 'email' || value === 'telephone' ? value : '';
}

export function asLicenceLength(value: string): LicenceLength | '' {
  return value === '1-day' || value === '8-day' || value === '12-month' ? value : '';
}

export function safeFilename(filename: string): string | undefined {
  const base = filename.split(/[/\\]/).pop();
  if (!base || base === '.' || base === '..') return undefined;
  if (base.length > 120 || !/^[\w. -]+$/.test(base)) return undefined;
  return base;
}

function ageOn(dob: Date, today: Date): number {
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDelta = today.getUTCMonth() - dob.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getUTCDate() < dob.getUTCDate())) age -= 1;
  return age;
}
