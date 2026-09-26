import type { Application, StepId } from './model.js';
import { markCompleted, unmarkCompleted } from './model.js';
import { NOT_SURE, REGIONS } from './options.js';
import { asContactBy, asLicenceLength, clean, normalisePostcode } from './validate.js';

const REGION_VALUES = new Set<string>([...REGIONS.map((region) => region.value), NOT_SURE]);

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

export function saveEmail(application: Application, email: string, valid: boolean): Application {
  return {
    ...application,
    email: clean(email),
    completed: finish(application.completed, 'email', valid),
  };
}

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

export function saveLicence(application: Application, value: string, valid: boolean): Application {
  return {
    ...application,
    licenceLength: asLicenceLength(value),
    completed: finish(application.completed, 'licence-length', valid),
  };
}

export function saveMonth(application: Application, value: string, valid: boolean): Application {
  return {
    ...application,
    startMonth: value,
    completed: finish(application.completed, 'start-month', valid),
  };
}

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

export function saveDetails(application: Application, value: string, valid: boolean): Application {
  return {
    ...application,
    additionalDetails: value,
    completed: finish(application.completed, 'additional-details', valid),
  };
}

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
