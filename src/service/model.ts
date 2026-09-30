/** Licence length the applicant can choose. */
export type LicenceLength = '1-day' | '8-days' | '12-months';

/** Answers collected for one fishing rod licence application. */
export type Application = {
  licenceLength: LicenceLength | '';
  fullName: string;
  day: string;
  month: string;
  year: string;
  country: string;
  email: string;
  submitted: boolean;
  reference: string;
  completed: string[];
};

/** Question paths, in journey order. */
export const STEP_IDS = [
  'licence-length',
  'name',
  'date-of-birth',
  'where-you-will-fish',
  'email',
] as const;

/** One question path from {@link STEP_IDS}. */
export type StepId = (typeof STEP_IDS)[number];

/** One question page. */
export type Step = {
  id: StepId;
  path: `/${StepId}`;
  heading: string;
};

/** Question pages in journey order. */
export const STEPS: Step[] = [
  {
    id: 'licence-length',
    path: '/licence-length',
    heading: 'How long do you need the licence for?',
  },
  { id: 'name', path: '/name', heading: 'What is your full name?' },
  { id: 'date-of-birth', path: '/date-of-birth', heading: 'What is your date of birth?' },
  { id: 'where-you-will-fish', path: '/where-you-will-fish', heading: 'Where will you fish?' },
  { id: 'email', path: '/email', heading: 'What is your email address?' },
];

/**
 * Empty application.
 *
 * @returns Answers with no completed steps.
 */
export function createApplication(): Application {
  return {
    licenceLength: '',
    fullName: '',
    day: '',
    month: '',
    year: '',
    country: '',
    email: '',
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
 * Whether every question is complete.
 *
 * @param application - Current answers.
 * @returns `true` when every step is complete.
 */
export function requiredStepsComplete(application: Application): boolean {
  return STEPS.every((step) => application.completed.includes(step.id));
}

/**
 * First question that is not complete.
 *
 * @param application - Current answers.
 * @returns That step, or `undefined` when the applicant can check their answers.
 */
export function firstIncompleteStep(application: Application): Step | undefined {
  return STEPS.find((step) => !application.completed.includes(step.id));
}
