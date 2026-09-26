import type { Application, StepId } from './model.js';
import { markCompleted, unmarkCompleted } from './model.js';
import { NOT_SURE, REGIONS } from './options.js';
import { asContactBy, asLicenceLength, clean, normalisePostcode } from './validate.js';

const REGION_VALUES = new Set<string>([...REGIONS.map((region) => region.value), NOT_SURE]);

/**
 * Save the name and mark the step complete only when it is valid.
 *
 * @param application - Current answers.
 * @param firstName - First name as posted.
 * @param lastName - Last name as posted.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveName(
  application: Application,
  firstName: string,
  lastName: string,
  valid: boolean,
): Application {
  return {
    ...application,
    firstName: clean(firstName),
    lastName: clean(lastName),
    completed: finish(application.completed, 'name', valid),
  };
}

/**
 * Save the date of birth and mark the step from `valid`.
 *
 * @param application - Current answers.
 * @param day - Day as posted.
 * @param month - Month as posted.
 * @param year - Year as posted.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveDate(
  application: Application,
  day: string,
  month: string,
  year: string,
  valid: boolean,
): Application {
  return {
    ...application,
    day: clean(day),
    month: clean(month),
    year: clean(year),
    completed: finish(application.completed, 'date-of-birth', valid),
  };
}

/**
 * Save the email address and mark the step from `valid`.
 *
 * @param application - Current answers.
 * @param email - Email as posted.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveEmail(application: Application, email: string, valid: boolean): Application {
  return {
    ...application,
    email: clean(email),
    completed: finish(application.completed, 'email', valid),
  };
}

/**
 * Save the contact preference. The telephone is stored only as text.
 *
 * @param application - Current answers.
 * @param contactBy - Posted contact method.
 * @param telephone - Telephone as posted.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveContact(
  application: Application,
  contactBy: string,
  telephone: string,
  valid: boolean,
): Application {
  return {
    ...application,
    contactBy: asContactBy(contactBy),
    telephone: clean(telephone),
    completed: finish(application.completed, 'contact-preference', valid),
  };
}

/**
 * Save known region values and mark the step from `valid`.
 *
 * @param application - Current answers.
 * @param regions - Posted region values. Unknown values are dropped.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveRegions(
  application: Application,
  regions: readonly string[],
  valid: boolean,
): Application {
  return {
    ...application,
    regions: regions.filter((region) => REGION_VALUES.has(region)),
    completed: finish(application.completed, 'where-you-will-fish', valid),
  };
}

/**
 * Save the licence length and mark the step from `valid`.
 *
 * @param application - Current answers.
 * @param value - Posted licence length.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveLicence(application: Application, value: string, valid: boolean): Application {
  return {
    ...application,
    licenceLength: asLicenceLength(value),
    completed: finish(application.completed, 'licence-length', valid),
  };
}

/**
 * Save the start month and mark the step from `valid`.
 *
 * @param application - Current answers.
 * @param value - Posted `YYYY-MM` value.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveMonth(application: Application, value: string, valid: boolean): Application {
  return {
    ...application,
    startMonth: value,
    completed: finish(application.completed, 'start-month', valid),
  };
}

/**
 * Save the address. The postcode is normalised only when the answer is valid.
 *
 * @param application - Current answers.
 * @param values - Address lines as posted.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveAddress(
  application: Application,
  values: { line1: string; line2: string; town: string; postcode: string },
  valid: boolean,
): Application {
  return {
    ...application,
    addressLine1: clean(values.line1),
    addressLine2: clean(values.line2),
    town: clean(values.town),
    postcode: valid ? normalisePostcode(values.postcode) : clean(values.postcode),
    completed: finish(application.completed, 'address', valid),
  };
}

/**
 * Save an evidence filename. A missing or invalid upload keeps the previous name.
 *
 * @param application - Current answers.
 * @param filename - Safe filename, or `undefined` when there is no acceptable file.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveEvidence(
  application: Application,
  filename: string | undefined,
  valid: boolean,
): Application {
  return {
    ...application,
    evidenceFilename: filename && valid ? filename : application.evidenceFilename,
    completed: finish(application.completed, 'evidence', valid),
  };
}

/**
 * Save additional details and mark the step from `valid`.
 *
 * @param application - Current answers.
 * @param value - Details as posted.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveDetails(application: Application, value: string, valid: boolean): Application {
  return {
    ...application,
    additionalDetails: value,
    completed: finish(application.completed, 'additional-details', valid),
  };
}

/**
 * Record that a password was accepted. The password is not stored.
 *
 * @param application - Current answers.
 * @param valid - Whether validation passed.
 * @returns The updated application. `passwordCreated` follows `valid`.
 */
export function savePassword(application: Application, valid: boolean): Application {
  return {
    ...application,
    passwordCreated: valid,
    completed: finish(application.completed, 'create-a-password', valid),
  };
}

function finish(completed: readonly string[], id: StepId, valid: boolean): string[] {
  return valid ? markCompleted(completed, id) : unmarkCompleted(completed, id);
}
