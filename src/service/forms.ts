import { escapeHtml } from '../html.js';
import { renderComponent } from '../components/render.js';
import type { Application } from './model.js';
import { CONTACT_OPTIONS, LICENCE_LENGTHS, NOT_SURE, REGIONS, startMonths } from './options.js';
import type { FieldError } from './validate.js';

export function errorSummary(errors: FieldError[]): Record<string, unknown> | undefined {
  if (errors.length === 0) return undefined;
  return {
    titleText: 'There is a problem',
    errorList: errors.map((error) => ({ text: error.text, href: error.href })),
  };
}

export function nameFields(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  return {
    firstName: textInput('first-name', 'First name', application.firstName, errors, {
      autocomplete: 'given-name',
      classes: 'govuk-input--width-20',
      spellcheck: false,
    }),
    lastName: textInput('last-name', 'Last name', application.lastName, errors, {
      autocomplete: 'family-name',
      classes: 'govuk-input--width-20',
      spellcheck: false,
    }),
  };
}

export function emailField(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  return {
    email: textInput('email', 'Email address', application.email, errors, {
      type: 'email',
      autocomplete: 'email',
      spellcheck: false,
      classes: 'govuk-input--width-20',
      hint: { text: 'We will send the decision to this address' },
      label: {
        text: 'What is your email address?',
        isPageHeading: true,
        classes: 'govuk-label--l',
      },
    }),
  };
}

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
        { name: 'day', autocomplete: 'bday-day', value: application.day },
        { name: 'month', autocomplete: 'bday-month', value: application.month },
        { name: 'year', autocomplete: 'bday-year', value: application.year },
      ],
    },
  };
}

export function contactFields(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  const telephone = textInput('telephone', 'Telephone number', application.telephone, errors, {
    type: 'tel',
    autocomplete: 'tel',
    classes: 'govuk-input--width-20',
  });
  const message = messageFor(errors, 'contact-by');
  return {
    radios: {
      idPrefix: 'contact-by',
      name: 'contact-by',
      fieldset: {
        legend: {
          text: 'How should we contact you?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      hint: { text: 'We will use this if we need to ask about your application' },
      ...(message ? { errorMessage: { text: message } } : {}),
      items: [
        {
          value: 'email',
          text: 'Email',
          id: 'contact-by',
          checked: application.contactBy === 'email',
        },
        {
          value: 'telephone',
          text: 'Telephone',
          checked: application.contactBy === 'telephone',
          conditional: { html: renderComponent('input', telephone) },
        },
      ],
    },
  };
}

export function regionFields(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  const message = messageFor(errors, 'regions');
  const items: Record<string, unknown>[] = REGIONS.map((region, index) => ({
    value: region.value,
    text: region.text,
    checked: application.regions.includes(region.value),
    ...(index === 0 ? { id: 'regions' } : {}),
  }));
  items.push({ divider: 'or' });
  items.push({
    value: NOT_SURE,
    text: 'I have not decided yet',
    behaviour: 'exclusive',
    checked: application.regions.includes(NOT_SURE),
  });
  return {
    checkboxes: {
      idPrefix: 'where',
      name: 'regions',
      fieldset: {
        legend: {
          text: 'Where will you fish?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      hint: { text: 'Select all that apply' },
      ...(message ? { errorMessage: { text: message } } : {}),
      items,
    },
  };
}

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
          text: 'How long do you need a licence for?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      ...(message ? { errorMessage: { text: message } } : {}),
      items: LICENCE_LENGTHS.map((option, index) => ({
        value: option.value,
        text: `${option.text} (${option.fee})`,
        checked: application.licenceLength === option.value,
        ...(index === 0 ? { id: 'licence-length' } : {}),
      })),
    },
  };
}

export function monthField(
  application: Application,
  errors: FieldError[],
  now: Date,
): Record<string, unknown> {
  return {
    select: withError(
      {
        id: 'start-month',
        name: 'start-month',
        label: {
          text: 'When should the licence start?',
          isPageHeading: true,
          classes: 'govuk-label--l',
        },
        items: [
          { value: '', text: 'Select a month', selected: application.startMonth === '' },
          ...startMonths(now).map((month) => ({
            value: month.value,
            text: month.text,
            selected: application.startMonth === month.value,
          })),
        ],
      },
      errors,
      'start-month',
    ),
  };
}

export function addressFields(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  return {
    fieldset: {
      legend: {
        text: 'What is your address?',
        isPageHeading: true,
        classes: 'govuk-fieldset__legend--l',
      },
    },
    line1: textInput('address-line-1', 'Address line 1', application.addressLine1, errors, {
      autocomplete: 'address-line1',
    }),
    line2: textInput(
      'address-line-2',
      'Address line 2 (optional)',
      application.addressLine2,
      errors,
      {
        autocomplete: 'address-line2',
      },
    ),
    town: textInput('town', 'Town or city', application.town, errors, {
      autocomplete: 'address-level2',
      classes: 'govuk-input--width-20',
    }),
    postcode: textInput('postcode', 'Postcode', application.postcode, errors, {
      autocomplete: 'postal-code',
      classes: 'govuk-input--width-10',
      spellcheck: false,
    }),
    inset: {
      text: 'This example asks you to type your address. It does not look up addresses from a postcode.',
    },
  };
}

export function evidenceField(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  return {
    currentFile: application.evidenceFilename,
    upload: withError(
      {
        id: 'evidence',
        name: 'evidence',
        label: {
          text: 'Upload evidence of a concession',
          isPageHeading: true,
          classes: 'govuk-label--l',
        },
        hint: {
          text: 'PDF, PNG, or JPG. You can skip this question if you do not have a concession.',
        },
      },
      errors,
      'evidence',
    ),
  };
}

export function detailsField(
  application: Application,
  errors: FieldError[],
): Record<string, unknown> {
  return {
    details: withError(
      {
        name: 'additional-details',
        id: 'additional-details',
        maxlength: 200,
        threshold: 75,
        value: application.additionalDetails,
        label: {
          text: 'Is there anything else we should know?',
          isPageHeading: true,
          classes: 'govuk-label--l',
        },
        hint: {
          text: 'You can skip this question. Do not include payment card numbers or passwords.',
        },
      },
      errors,
      'additional-details',
    ),
  };
}

export function passwordFields(errors: FieldError[]): Record<string, unknown> {
  return {
    password: withError(
      {
        id: 'password',
        name: 'password',
        autocomplete: 'new-password',
        label: {
          text: 'Create a password',
          isPageHeading: true,
          classes: 'govuk-label--l',
        },
        hint: { text: 'Must be at least 8 characters. This example does not store your password.' },
      },
      errors,
      'password',
    ),
    confirm: withError(
      {
        id: 'password-confirm',
        name: 'password-confirm',
        autocomplete: 'new-password',
        label: { text: 'Confirm password' },
      },
      errors,
      'password-confirm',
    ),
  };
}

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

export function feesTable(): Record<string, unknown> {
  return {
    caption: 'Rod licence fees',
    captionClasses: 'govuk-table__caption--m',
    firstCellIsHeader: true,
    head: [{ text: 'Licence' }, { text: 'Fee', format: 'numeric' }],
    rows: LICENCE_LENGTHS.map((option) => [
      { text: option.text },
      { text: option.fee, format: 'numeric' },
    ]),
  };
}

export function helpAccordion(): Record<string, unknown> {
  return {
    id: 'help',
    items: [
      {
        heading: { text: 'Who can apply' },
        content: {
          text: 'You can apply if you are 13 or over and you will fish with a rod in England or Wales.',
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

export function guidanceTabs(): Record<string, unknown> {
  return {
    id: 'guidance',
    items: [
      {
        label: 'Before you apply',
        id: 'before-you-apply',
        panel: {
          html: '<h2 class="govuk-heading-l">Before you apply</h2><p class="govuk-body">You need your name, date of birth, email address, and home address.</p>',
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

export function confirmationPanel(reference: string): Record<string, unknown> {
  return {
    titleText: 'Application complete',
    html: `Your reference number<br><strong>${escapeHtml(reference)}</strong>`,
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
      label: extra.label ?? { text: label },
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
