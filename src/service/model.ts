/** How the applicant wants to be contacted. */
export type ContactBy = 'email' | 'telephone';

/** Licence length the applicant can choose. */
export type LicenceLength = '1-day' | '8-day' | '12-month';

/** Answers collected for one rod licence application. The password itself is never stored. */
export type Application = {
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  email: string;
  contactBy: ContactBy | '';
  telephone: string;
  regions: string[];
  licenceLength: LicenceLength | '';
  startMonth: string;
  addressLine1: string;
  addressLine2: string;
  town: string;
  postcode: string;
  evidenceFilename: string;
  additionalDetails: string;
  passwordCreated: boolean;
  submitted: boolean;
  reference: string;
  completed: string[];
};

/** Question paths, in the order the task list walks them. */
export const STEP_IDS = [
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
] as const;

/** One question path from {@link STEP_IDS}. */
export type StepId = (typeof STEP_IDS)[number];

/** Questions the applicant can skip and still submit. */
export const OPTIONAL_STEPS = new Set<StepId>(['evidence', 'additional-details']);

/** One question page. */
export type Step = {
  id: StepId;
  path: `/${StepId}`;
  heading: string;
};

/** Question pages in journey order. */
export const STEPS: Step[] = [
  { id: 'name', path: '/name', heading: 'What is your name?' },
  { id: 'date-of-birth', path: '/date-of-birth', heading: 'What is your date of birth?' },
  { id: 'email', path: '/email', heading: 'What is your email address?' },
  { id: 'contact-preference', path: '/contact-preference', heading: 'How should we contact you?' },
  { id: 'where-you-will-fish', path: '/where-you-will-fish', heading: 'Where will you fish?' },
  { id: 'licence-length', path: '/licence-length', heading: 'How long do you need a licence for?' },
  { id: 'start-month', path: '/start-month', heading: 'When should the licence start?' },
  { id: 'address', path: '/address', heading: 'What is your address?' },
  { id: 'evidence', path: '/evidence', heading: 'Upload evidence of a concession' },
  {
    id: 'additional-details',
    path: '/additional-details',
    heading: 'Is there anything else we should know?',
  },
  { id: 'create-a-password', path: '/create-a-password', heading: 'Create a password' },
];

/**
 * Empty application.
 *
 * @returns Answers with no completed steps.
 */
export function createApplication(): Application {
  return {
    firstName: '',
    lastName: '',
    day: '',
    month: '',
    year: '',
    email: '',
    contactBy: '',
    telephone: '',
    regions: [],
    licenceLength: '',
    startMonth: '',
    addressLine1: '',
    addressLine2: '',
    town: '',
    postcode: '',
    evidenceFilename: '',
    additionalDetails: '',
    passwordCreated: false,
    submitted: false,
    reference: '',
    completed: [],
  };
}

/**
 * Find a step by id.
 *
 * @param id - Step id.
 * @returns The step, or `undefined` when `id` is not a question.
 */
export function stepById(id: string): Step | undefined {
  return STEPS.find((step) => step.id === id);
}

/**
 * Find a step by its path.
 *
 * @param path - Path such as `/name`.
 * @returns The step, or `undefined` when `path` is not a question.
 */
export function stepByPath(path: string): Step | undefined {
  return STEPS.find((step) => step.path === path);
}

/**
 * The question after `id`.
 *
 * @param id - Current step.
 * @returns The next step, or `undefined` after the last question.
 */
export function nextStep(id: StepId): Step | undefined {
  const index = STEPS.findIndex((step) => step.id === id);
  if (index === -1) return undefined;
  return STEPS[index + 1];
}

/**
 * The question before `id`.
 *
 * @param id - Current step.
 * @returns The previous step, or `undefined` on the first question.
 */
export function previousStep(id: StepId): Step | undefined {
  const index = STEPS.findIndex((step) => step.id === id);
  if (index <= 0) return undefined;
  return STEPS[index - 1];
}

/**
 * Mark a step complete without duplicating it.
 *
 * @param completed - Step ids already complete.
 * @param id - Step to mark.
 * @returns A new list.
 */
export function markCompleted(completed: readonly string[], id: StepId): string[] {
  if (completed.includes(id)) return [...completed];
  return [...completed, id];
}

/**
 * Remove a step from the completed list.
 *
 * @param completed - Step ids already complete.
 * @param id - Step to clear.
 * @returns A new list.
 */
export function unmarkCompleted(completed: readonly string[], id: StepId): string[] {
  return completed.filter((item) => item !== id);
}

/**
 * Whether every required question is complete.
 *
 * @param application - Current answers.
 * @returns `true` when only optional steps, or none, are still incomplete.
 */
export function requiredStepsComplete(application: Application): boolean {
  return STEPS.every(
    (step) => OPTIONAL_STEPS.has(step.id) || application.completed.includes(step.id),
  );
}

/**
 * First required question that is not complete.
 *
 * @param application - Current answers.
 * @returns That step, or `undefined` when the applicant can check their answers.
 */
export function firstIncompleteStep(application: Application): Step | undefined {
  return STEPS.find(
    (step) => !OPTIONAL_STEPS.has(step.id) && !application.completed.includes(step.id),
  );
}
