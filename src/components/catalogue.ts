import { listComponentNames } from './fixtures.js';
import { titleFromKebab } from './names.js';

/** A page in this example that uses the component. */
export type UsedOn = { href: string; text: string };

/** Catalogue entry for one GOV.UK Frontend component. */
export type ComponentInfo = {
  name: string;
  title: string;
  description: string;
  designSystemUrl: string;
  usedOn: UsedOn[];
};

const DESIGN_SYSTEM = 'https://design-system.service.gov.uk/components';

const DETAILS: Record<string, Omit<ComponentInfo, 'name'>> = {
  accordion: {
    title: 'Accordion',
    description: 'Lets users show and hide sections of related content.',
    designSystemUrl: `${DESIGN_SYSTEM}/accordion/`,
    usedOn: [{ href: '/help', text: 'Help' }],
  },
  'back-link': {
    title: 'Back link',
    description: 'Link to the previous page in a journey.',
    designSystemUrl: `${DESIGN_SYSTEM}/back-link/`,
    usedOn: [{ href: '/name', text: 'What is your name?' }],
  },
  breadcrumbs: {
    title: 'Breadcrumbs',
    description: 'Helps users move between levels of a section.',
    designSystemUrl: `${DESIGN_SYSTEM}/breadcrumbs/`,
    usedOn: [{ href: '/help', text: 'Help' }],
  },
  button: {
    title: 'Button',
    description: 'Starts or continues an action.',
    designSystemUrl: `${DESIGN_SYSTEM}/button/`,
    usedOn: [{ href: '/', text: 'Start page' }],
  },
  'character-count': {
    title: 'Character count',
    description: 'Shows how many characters are left in a textarea.',
    designSystemUrl: `${DESIGN_SYSTEM}/character-count/`,
    usedOn: [{ href: '/additional-details', text: 'Additional details' }],
  },
  checkboxes: {
    title: 'Checkboxes',
    description: 'Lets users select one or more options.',
    designSystemUrl: `${DESIGN_SYSTEM}/checkboxes/`,
    usedOn: [{ href: '/where-you-will-fish', text: 'Where will you fish?' }],
  },
  'cookie-banner': {
    title: 'Cookie banner',
    description: 'Asks users to accept or reject analytics cookies.',
    designSystemUrl: `${DESIGN_SYSTEM}/cookie-banner/`,
    usedOn: [{ href: '/', text: 'Every page until a choice is saved' }],
  },
  'date-input': {
    title: 'Date input',
    description: 'Asks users for a date they already know.',
    designSystemUrl: `${DESIGN_SYSTEM}/date-input/`,
    usedOn: [{ href: '/date-of-birth', text: 'Date of birth' }],
  },
  details: {
    title: 'Details',
    description: 'Hides content that only some users need.',
    designSystemUrl: `${DESIGN_SYSTEM}/details/`,
    usedOn: [{ href: '/', text: 'Start page' }],
  },
  'error-message': {
    title: 'Error message',
    description: 'Tells users how to fix a field that failed validation.',
    designSystemUrl: `${DESIGN_SYSTEM}/error-message/`,
    usedOn: [{ href: '/name', text: 'Question pages when validation fails' }],
  },
  'error-summary': {
    title: 'Error summary',
    description: 'Summarises form errors at the top of the page.',
    designSystemUrl: `${DESIGN_SYSTEM}/error-summary/`,
    usedOn: [{ href: '/name', text: 'Question pages when validation fails' }],
  },
  'exit-this-page': {
    title: 'Exit this page',
    description: 'Lets users leave a page quickly. For services where someone may be in danger.',
    designSystemUrl: `${DESIGN_SYSTEM}/exit-this-page/`,
    usedOn: [{ href: '/examples/exit-this-page', text: 'Exit this page example' }],
  },
  feedback: {
    title: 'Feedback',
    description: 'Asks users what they think of a page. Trial component in Frontend 6.5.',
    designSystemUrl: `${DESIGN_SYSTEM}/feedback/`,
    usedOn: [{ href: '/', text: 'Start, confirmation, and help pages' }],
  },
  fieldset: {
    title: 'Fieldset',
    description: 'Groups related form fields, such as an address.',
    designSystemUrl: `${DESIGN_SYSTEM}/fieldset/`,
    usedOn: [{ href: '/address', text: 'What is your address?' }],
  },
  'file-upload': {
    title: 'File upload',
    description: 'Lets users select a file to upload.',
    designSystemUrl: `${DESIGN_SYSTEM}/file-upload/`,
    usedOn: [{ href: '/evidence', text: 'Upload evidence' }],
  },
  footer: {
    title: 'Footer',
    description: 'Page footer with Open Government Licence and Crown copyright.',
    designSystemUrl: `${DESIGN_SYSTEM}/footer/`,
    usedOn: [{ href: '/', text: 'Every page' }],
  },
  'generic-header': {
    title: 'Generic header',
    description: 'Header for services that are not branded as GOV.UK. Shown in the catalogue only.',
    designSystemUrl: 'https://design-system.service.gov.uk/styles/page-template/',
    usedOn: [],
  },
  header: {
    title: 'Header',
    description: 'The GOV.UK masthead.',
    designSystemUrl: `${DESIGN_SYSTEM}/header/`,
    usedOn: [{ href: '/', text: 'Every page' }],
  },
  hint: {
    title: 'Hint',
    description:
      'Extra help for a form field. Form controls include it; the catalogue shows it on its own.',
    designSystemUrl: 'https://design-system.service.gov.uk/get-started/labels-legends-headings/',
    usedOn: [{ href: '/name', text: 'Composed inside form controls' }],
  },
  input: {
    title: 'Text input',
    description: 'Lets users enter a single line of text.',
    designSystemUrl: `${DESIGN_SYSTEM}/text-input/`,
    usedOn: [{ href: '/name', text: 'What is your name?' }],
  },
  'inset-text': {
    title: 'Inset text',
    description: 'Draws attention to important content on the page.',
    designSystemUrl: `${DESIGN_SYSTEM}/inset-text/`,
    usedOn: [{ href: '/address', text: 'What is your address?' }],
  },
  label: {
    title: 'Label',
    description:
      'Labels a form field. Form controls include it; the catalogue shows it on its own.',
    designSystemUrl: 'https://design-system.service.gov.uk/get-started/labels-legends-headings/',
    usedOn: [{ href: '/name', text: 'Composed inside form controls' }],
  },
  'language-navigation': {
    title: 'Language navigation',
    description: 'Lets users switch between languages. Trial component in Frontend 6.5.',
    designSystemUrl: `${DESIGN_SYSTEM}/language-navigation/`,
    usedOn: [{ href: '/', text: 'Every page' }],
  },
  'notification-banner': {
    title: 'Notification banner',
    description: 'Tells users about something that affects the whole service.',
    designSystemUrl: `${DESIGN_SYSTEM}/notification-banner/`,
    usedOn: [{ href: '/', text: 'Start page' }],
  },
  pagination: {
    title: 'Pagination',
    description: 'Splits a long list across pages.',
    designSystemUrl: `${DESIGN_SYSTEM}/pagination/`,
    usedOn: [{ href: '/updates', text: 'Service updates' }],
  },
  panel: {
    title: 'Panel',
    description: 'Confirms a transaction is complete.',
    designSystemUrl: `${DESIGN_SYSTEM}/panel/`,
    usedOn: [{ href: '/confirmation', text: 'Confirmation' }],
  },
  'password-input': {
    title: 'Password input',
    description: 'Lets users enter a password, with a control to show or hide it.',
    designSystemUrl: `${DESIGN_SYSTEM}/password-input/`,
    usedOn: [{ href: '/create-a-password', text: 'Create a password' }],
  },
  'phase-banner': {
    title: 'Phase banner',
    description: 'Shows users that the service is still being tried out.',
    designSystemUrl: `${DESIGN_SYSTEM}/phase-banner/`,
    usedOn: [{ href: '/', text: 'Every page' }],
  },
  radios: {
    title: 'Radios',
    description: 'Lets users select one option from a list.',
    designSystemUrl: `${DESIGN_SYSTEM}/radios/`,
    usedOn: [{ href: '/contact-preference', text: 'How should we contact you?' }],
  },
  select: {
    title: 'Select',
    description: 'Lets users choose one option from a long list.',
    designSystemUrl: `${DESIGN_SYSTEM}/select/`,
    usedOn: [{ href: '/start-month', text: 'When should the licence start?' }],
  },
  'service-navigation': {
    title: 'Service navigation',
    description: 'Shows the service name under the GOV.UK masthead.',
    designSystemUrl: `${DESIGN_SYSTEM}/service-navigation/`,
    usedOn: [{ href: '/', text: 'Every page' }],
  },
  'skip-link': {
    title: 'Skip link',
    description: 'Lets keyboard users skip to the main content.',
    designSystemUrl: `${DESIGN_SYSTEM}/skip-link/`,
    usedOn: [{ href: '/', text: 'Every page' }],
  },
  'summary-list': {
    title: 'Summary list',
    description: 'Summarises answers so users can check them.',
    designSystemUrl: `${DESIGN_SYSTEM}/summary-list/`,
    usedOn: [{ href: '/check-answers', text: 'Check your answers' }],
  },
  table: {
    title: 'Table',
    description: 'Shows information in rows and columns.',
    designSystemUrl: `${DESIGN_SYSTEM}/table/`,
    usedOn: [{ href: '/fees', text: 'Licence fees' }],
  },
  tabs: {
    title: 'Tabs',
    description:
      'Lets users switch between related views. Content stays in the page without JavaScript.',
    designSystemUrl: `${DESIGN_SYSTEM}/tabs/`,
    usedOn: [{ href: '/guidance', text: 'Guidance' }],
  },
  tag: {
    title: 'Tag',
    description: 'Shows a short status, such as on a task list.',
    designSystemUrl: `${DESIGN_SYSTEM}/tag/`,
    usedOn: [{ href: '/task-list', text: 'Task list' }],
  },
  'task-list': {
    title: 'Task list',
    description: 'Shows the tasks in an application and whether they are done.',
    designSystemUrl: `${DESIGN_SYSTEM}/task-list/`,
    usedOn: [{ href: '/task-list', text: 'Task list' }],
  },
  textarea: {
    title: 'Textarea',
    description:
      'Lets users enter more than one line of text. This service uses character count, which includes a textarea.',
    designSystemUrl: `${DESIGN_SYSTEM}/textarea/`,
    usedOn: [{ href: '/additional-details', text: 'Additional details, via character count' }],
  },
  'warning-text': {
    title: 'Warning text',
    description: 'Tells users about something important before they continue.',
    designSystemUrl: `${DESIGN_SYSTEM}/warning-text/`,
    usedOn: [{ href: '/', text: 'Start page' }],
  },
};

/**
 * Catalogue copy for one component.
 *
 * @param name - Kebab-case component name.
 * @returns Known copy, or a title derived from the name when this release adds a component we have not described.
 */
export function describeComponent(name: string): ComponentInfo {
  const known = DETAILS[name];
  if (!known) {
    return {
      name,
      title: titleFromKebab(name),
      description: 'GOV.UK Frontend component.',
      designSystemUrl: `${DESIGN_SYSTEM}/${name}/`,
      usedOn: [],
    };
  }
  return { name, ...known };
}

/**
 * Catalogue entries for every component in the pinned Frontend package.
 *
 * @returns Entries in component-name order.
 */
export function listCatalogue(): ComponentInfo[] {
  return listComponentNames().map((name) => describeComponent(name));
}

/**
 * Component names this catalogue has hand-written copy for.
 *
 * @returns The keys of the local catalogue, which tests compare with the package.
 */
export function catalogueNames(): string[] {
  return Object.keys(DETAILS);
}
