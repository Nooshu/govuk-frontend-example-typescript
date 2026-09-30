import type { Application, StepId } from './model.js';
import { markCompleted, unmarkCompleted } from './model.js';
import { asLicenceLength, clean } from './validate.js';

/**
 * Save the full name and mark the step complete only when it is valid.
 *
 * @param application - Current answers.
 * @param fullName - Full name as posted.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveName(application: Application, fullName: string, valid: boolean): Application {
  return {
    ...application,
    fullName: clean(fullName),
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
 * Save the fishing country and mark the step from `valid`.
 *
 * @param application - Current answers.
 * @param country - Posted country.
 * @param valid - Whether validation passed.
 * @returns The updated application.
 */
export function saveCountry(
  application: Application,
  country: string,
  valid: boolean,
): Application {
  return {
    ...application,
    country: clean(country),
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

function finish(completed: readonly string[], id: StepId, valid: boolean): string[] {
  return valid ? markCompleted(completed, id) : unmarkCompleted(completed, id);
}
