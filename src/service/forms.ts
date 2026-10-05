import { escapeHtml } from '../html.js';
import type { Application } from './model.js';
import { COUNTRIES, LICENCE_FEES, LICENCE_LENGTHS } from './options.js';
import type { FieldError } from './validate.js';

/**
 * Error summary macro params, or nothing when there are no errors.
 *
 * @param errors - Field errors for this page.
 * @returns Params for the error summary macro.
 */
export function errorSummary(errors: FieldError[]): Record<string, unknown> | undefined {
  if (errors.length === 0) return undefined;
  return {
    titleText: 'There is a problem',
    errorList: errors.map((error) => ({ text: error.text, href: error.href })),
  };
}

/**
 * Text input params for the full name question.
 *
 * @param application - Current answers, used to retain values.
 * @param errors - Field errors for this page.
 * @returns Params whose label is the page heading.
 */
export function nameField(application: Application, errors: FieldError[]): Record<string, unknown> {
  return {
    fullName: textInput('full-name', 'What is your full name?', application.fullName, errors, {
      autocomplete: 'name',
      label: {
        text: 'What is your full name?',
        isPageHeading: true,
        classes: 'govuk-label--l',
      },
    }),
  };
}

/**
 * Text input params for the email question.
 *
 * @param application - Current answers, used to retain the value.
 * @param errors - Field errors for this page.
 * @returns Params whose label is the page heading.
 */
export function emailField(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  return {
    email: textInput('email', 'What is your email address?', application.email, errors, {
      type: 'email',
      autocomplete: 'email',
      spellcheck: false,
      hint: { text: 'This example stores the address in your browser session only.' },
      label: {
        text: 'What is your email address?',
        isPageHeading: true,
        classes: 'govuk-label--l',
      },
    }),
  };
}

/**
 * Date input params for the date of birth question.
 *
 * @param application - Current answers, used to retain the value.
 * @param errors - Field errors for this page.
 * @returns Params for the date input macro.
 */
export function dateField(application: Application, errors: FieldError[]): Record<string, unknown> {
  const message = messageFor(errors, 'date-of-birth');
  return {
    dateOfBirth: {
      id: 'date-of-birth',
      namePrefix: 'date-of-birth',
      fieldset: {
        legend: {
          text: 'What is your date of birth?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      hint: { text: 'For example, 31 3 1980' },
      ...(message ? { errorMessage: { text: message } } : {}),
      items: [
        { name: 'day', value: application.day },
        { name: 'month', value: application.month },
        { name: 'year', value: application.year },
      ],
    },
  };
}

/**
 * Radio params for where the applicant will fish.
 *
 * @param application - Current answers, used to retain the value.
 * @param errors - Field errors for this page.
 * @returns Params for the radios macro.
 */
export function countryFields(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  const message = messageFor(errors, 'country');
  return {
    radios: {
      idPrefix: 'country',
      name: 'country',
      fieldset: {
        legend: {
          text: 'Where will you fish?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      hint: { text: 'This example is fictional. It does not check a real fishing area.' },
      ...(message ? { errorMessage: { text: message } } : {}),
      items: COUNTRIES.map((option, index) => ({
        value: option.value,
        text: option.text,
        checked: application.country === option.value,
        ...(index === 0 ? { id: 'country' } : {}),
      })),
    },
  };
}

/**
 * Radio params for the licence length.
 *
 * @param application - Current answers, used to retain the value.
 * @param errors - Field errors for this page.
 * @returns Params for the radios macro.
 */
export function licenceFields(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  const message = messageFor(errors, 'licence-length');
  return {
    radios: {
      idPrefix: 'licence-length',
      name: 'licence-length',
      fieldset: {
        legend: {
          text: 'How long do you need the licence for?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      ...(message ? { errorMessage: { text: message } } : {}),
      items: LICENCE_LENGTHS.map((option, index) => ({
        value: option.value,
        text: option.text,
        checked: application.licenceLength === option.value,
        ...(index === 0 ? { id: 'licence-length' } : {}),
      })),
    },
  };
}

/**
 * Radio params for the cookie settings page.
 *
 * @param choice - Stored cookie choice, or `null` when the applicant has not chosen.
 * @param errors - Field errors for this page.
 * @returns Params for the radios macro.
 */
export function cookieFields(
  choice: 'accept' | 'reject' | null,
  errors: FieldError[],
): Record<string, unknown> {
  const selected = choice === 'accept' ? 'yes' : choice === 'reject' ? 'no' : '';
  const message = messageFor(errors, 'analytics');
  return {
    radios: {
      idPrefix: 'analytics',
      name: 'analytics',
      fieldset: {
        legend: {
          text: 'Do you want to accept analytics cookies?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      hint: { text: 'This example stores your choice. It does not set analytics cookies.' },
      ...(message ? { errorMessage: { text: message } } : {}),
      items: [
        { value: 'yes', text: 'Yes', id: 'analytics', checked: selected === 'yes' },
        { value: 'no', text: 'No', checked: selected === 'no' },
      ],
    },
  };
}

/**
 * Table params for the example licence fees.
 *
 * @returns Params for the table macro.
 */
export function feesTable(): Record<string, unknown> {
  return {
    caption: 'Rod licence fees',
    captionClasses: 'govuk-table__caption--m',
    firstCellIsHeader: true,
    head: [{ text: 'Licence' }, { text: 'Fee', format: 'numeric' }],
    rows: LICENCE_FEES.map((option) => [
      { text: option.text },
      { text: option.fee, format: 'numeric' },
    ]),
  };
}

/**
 * Accordion params for the help page.
 *
 * @returns Params for the accordion macro.
 */
export function helpAccordion(): Record<string, unknown> {
  return {
    id: 'help',
    items: [
      {
        heading: { text: 'Who can apply' },
        content: {
          text: 'You can apply if you are 13 or over and you will fish with a rod in England, Wales or Scotland.',
        },
      },
      {
        heading: { text: 'What a licence covers' },
        content: {
          html: '<ul class="govuk-list govuk-list--bullet"><li>Rod and line fishing</li><li>Up to 2 rods where the licence allows it</li><li>The dates printed on your licence</li></ul>',
        },
      },
      {
        heading: { text: 'If you need help to apply' },
        content: {
          text: 'You can ask someone to apply for you. This example service does not offer a phone application line.',
        },
      },
    ],
  };
}

/**
 * Tabs params for the guidance page.
 *
 * @returns Params for the tabs macro.
 */
export function guidanceTabs(): Record<string, unknown> {
  return {
    id: 'guidance',
    items: [
      {
        label: 'Before you apply',
        id: 'before-you-apply',
        panel: {
          html: '<h2 class="govuk-heading-l">Before you apply</h2><p class="govuk-body">You need how long you need the licence, your name, date of birth, the country where you will fish, and your email address.</p>',
        },
      },
      {
        label: 'Fees',
        id: 'fees',
        panel: {
          html: `<h2 class="govuk-heading-l">Fees</h2><p class="govuk-body">Fees depend on the length of the licence. <a class="govuk-link" href="/fees">See licence fees</a>.</p>`,
        },
      },
      {
        label: 'After you apply',
        id: 'after-you-apply',
        panel: {
          html: '<h2 class="govuk-heading-l">After you apply</h2><p class="govuk-body">This example shows a confirmation page with a reference number. It does not send email and it does not take payment.</p>',
        },
      },
    ],
  };
}

/**
 * Panel params for the confirmation page. The reference is escaped.
 *
 * @param reference - Application reference.
 * @returns Params for the panel macro. The panel is the page `h1`.
 */
export function confirmationPanel(reference: string): Record<string, unknown> {
  return {
    titleText: 'Application complete',
    html: `Your example reference number<br><strong>${escapeHtml(reference)}</strong>`,
  };
}

function textInput(
  id: string,
  label: string,
  value: string,
  errors: FieldError[],
  extra: Record<string, unknown>,
): Record<string, unknown> {
  return withError(
    {
      id,
      name: id,
      label: { text: label },
      value,
      ...extra,
    },
    errors,
    id,
  );
}

function withError(
  base: Record<string, unknown>,
  errors: FieldError[],
  field: string,
): Record<string, unknown> {
  const message = messageFor(errors, field);
  if (!message) return base;
  return { ...base, errorMessage: { text: message } };
}

function messageFor(errors: FieldError[], field: string): string | undefined {
  return errors.find((error) => error.field === field)?.text;
}
