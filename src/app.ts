import { readFileSync } from 'node:fs';
import type { AddressInfo, Server } from 'node:net';
import { createServer } from 'node:http';
import { applyResponseHeaders, baselinePolicy, buildSetCookie, strongEtag } from '#baseline';

import { describeComponent, listCatalogue } from './components/catalogue.js';
import { getFixture, loadComponentFixtures } from './components/fixtures.js';
import { parityBanner, selectFixture } from './components/preview.js';
import { isKnownComponent, renderComponent } from './components/render.js';
import { demosEnabledFromEnv, FRONTEND_VERSION, MAX_BODY_BYTES } from './config.js';
import { pageAssets, resolveAsset, type Asset } from './http/assets.js';
import { field, fields, parseRequestBody, RequestBodyError, type ParsedBody } from './http/body.js';
import { compressBody, isCompressible } from './http/compress.js';
import { parseCookieHeader } from './http/cookies.js';
import { type PageView, renderPage } from './pages/document.js';
import {
  createMemoryStore,
  createSession,
  referenceFor,
  type Session,
  type SessionStore,
} from './session/store.js';
import { summaryRows, taskSections } from './service/answers.js';
import {
  addressFields,
  confirmationPanel,
  contactFields,
  cookieFields,
  dateField,
  detailsField,
  emailField,
  errorSummary,
  evidenceField,
  feesTable,
  guidanceTabs,
  helpAccordion,
  licenceFields,
  monthField,
  nameFields,
  passwordFields,
  regionFields,
} from './service/forms.js';
import {
  createApplication,
  firstIncompleteStep,
  nextStep,
  previousStep,
  stepByPath,
  type Step,
} from './service/model.js';
import {
  saveAddress,
  saveContact,
  saveDate,
  saveDetails,
  saveEmail,
  saveEvidence,
  saveLicence,
  saveMonth,
  saveName,
  savePassword,
  saveRegions,
} from './service/save.js';
import {
  safeFilename,
  validateAdditionalDetails,
  validateAddress,
  validateContactPreference,
  validateCookieChoice,
  validateDateOfBirth,
  validateEmail,
  validateEvidence,
  validateLicenceLength,
  validateName,
  validatePassword,
  validateRegions,
  validateStartMonth,
  type FieldError,
} from './service/validate.js';

const SESSION_COOKIE = 'rod_session';
const HOST_SESSION_COOKIE = '__Host-session';

/** Dependencies for {@link createApp}. Tests replace the store, clock, renderer, and body parser. */
export type AppOptions = {
  demosEnabled?: boolean;
  store?: SessionStore;
  now?: () => Date;
  logger?: (error: unknown) => void;
  render?: typeof renderPage;
  readBody?: (request: Request) => Promise<ParsedBody>;
};

/** HTTP application. `handle` returns a Fetch `Response`. */
export type App = {
  handle(request: Request): Promise<Response>;
};

type RawResult = { type: 'raw'; response: Response };

/**
 * Build the example service.
 *
 * Routes cover the rod licence journey from the start page to confirmation, plus notices,
 * cookies, and — unless demos are off — the component catalogue and fixture previews.
 *
 * @param options - Optional store, clock, and test doubles.
 * @returns An app whose `handle` method serves one request.
 */
export function createApp(options: AppOptions = {}): App {
  const store = options.store ?? createMemoryStore();
  const demosEnabled = options.demosEnabled ?? demosEnabledFromEnv();
  const now = options.now ?? (() => new Date());
  const logger =
    options.logger ??
    ((error: unknown) => {
      console.error(error);
    });
  const render = options.render ?? renderPage;
  const readBody = options.readBody ?? defaultReadBody;

  return {
    async handle(request) {
      const url = new URL(request.url);
      try {
        const result = await route(request, url, {
          store,
          demosEnabled,
          now,
          readBody,
        });
        if (result.type === 'raw') return result.response;
        if (result.type === 'redirect') {
          return redirectResponse(result.location, request, resultCookie(request, result.session));
        }
        return pageResponse(result.view, result.session, url, demosEnabled, request, render);
      } catch (error) {
        logger(error);
        try {
          const body = render(problemView(500), createSession(), url, demosEnabled);
          return htmlResponse(500, body, request, 'document', []);
        } catch (nested) {
          logger(nested);
          return textResponse(500, 'Sorry, there is a problem with the service', request);
        }
      }
    },
  };
}

type RouteDeps = {
  store: SessionStore;
  demosEnabled: boolean;
  now: () => Date;
  readBody: (request: Request) => Promise<ParsedBody>;
};

type PageResult = { type: 'page'; view: PageView; session: Session };
type RedirectResult = { type: 'redirect'; location: string; session: Session };

async function route(
  request: Request,
  url: URL,
  deps: RouteDeps,
): Promise<PageResult | RedirectResult | RawResult> {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return { type: 'raw', response: textResponse(405, 'Method not allowed', request) };
  }

  const path = url.pathname;
  if (path.length > 1 && path.endsWith('/')) {
    const session = openSession(request, deps.store);
    return { type: 'redirect', location: `${path.slice(0, -1)}${url.search}`, session };
  }

  if (request.method === 'GET' && path === '/health') {
    return { type: 'raw', response: textResponse(200, 'ok', request) };
  }

  if (request.method === 'GET' && path === '/robots.txt') {
    return {
      type: 'raw',
      response: textResponse(
        200,
        'User-agent: *\nDisallow: /\n',
        request,
        'text/plain; charset=utf-8',
      ),
    };
  }

  if (request.method === 'GET' && path.startsWith('/assets/')) {
    const asset = resolveAsset(path);
    if (!asset) return { type: 'raw', response: textResponse(404, 'Not found', request) };
    return { type: 'raw', response: assetResponse(asset, request) };
  }

  const session = openSession(request, deps.store);

  if (request.method === 'POST') {
    let body: ParsedBody;
    try {
      body = await deps.readBody(request);
    } catch (error) {
      if (error instanceof RequestBodyError) {
        return { type: 'raw', response: textResponse(error.status, error.message, request) };
      }
      throw error;
    }
    if (!csrfOk(session, body)) {
      return { type: 'page', view: sessionExpiredView(), session };
    }
    const posted = post(path, body, session, deps);
    if (posted) return posted;
  }

  if (request.method === 'GET') {
    const viewed = get(request, path, url, session, deps);
    if (viewed) return viewed;
  }

  return { type: 'page', view: notFoundView(), session };
}

function post(
  path: string,
  body: ParsedBody,
  session: Session,
  deps: RouteDeps,
): PageResult | RedirectResult | undefined {
  if (path === '/cookie-choices') return postCookieBanner(body, session);
  if (path === '/cookies') return postCookies(body, session);
  if (path === '/check-answers') return postCheckAnswers(session);
  const step = stepByPath(path);
  if (!step) return undefined;
  return postStep(step, body, session, deps.now());
}

function get(
  request: Request,
  path: string,
  url: URL,
  session: Session,
  deps: RouteDeps,
): PageResult | RedirectResult | RawResult | undefined {
  if (deps.demosEnabled) {
    const demo = demoGet(request, path, url, session);
    if (demo) return demo;
  }
  if (path === '/new-application') {
    session.application = createApplication();
    return { type: 'redirect', location: '/', session };
  }
  if (path === '/') return { type: 'page', view: startView('en'), session };
  if (path === '/cy') return { type: 'page', view: startView('cy'), session };
  if (path === '/task-list') return { type: 'page', view: taskListView(session), session };
  if (path === '/check-answers') return checkAnswersGet(session, deps.now());
  if (path === '/confirmation') return confirmationGet(session);
  if (path === '/fees') return { type: 'page', view: feesView(), session };
  if (path === '/help') return { type: 'page', view: helpView(), session };
  if (path === '/guidance') return { type: 'page', view: guidanceView(), session };
  if (path === '/updates') return updatesGet(url, session);
  if (path === '/cookies')
    return { type: 'page', view: cookiesView(session, takeErrors(session, path)), session };
  if (path === '/accessibility') return { type: 'page', view: accessibilityView(), session };
  if (path === '/about') return { type: 'page', view: aboutView(), session };
  const step = stepByPath(path);
  if (step)
    return {
      type: 'page',
      view: stepView(step, session, url, takeErrors(session, path), deps.now()),
      session,
    };
  return undefined;
}

function demoGet(
  request: Request,
  path: string,
  url: URL,
  session: Session,
): PageResult | RedirectResult | RawResult | undefined {
  if (path === '/components') {
    return { type: 'page', view: componentsView(), session };
  }
  if (path === '/examples') return { type: 'page', view: examplesView(), session };
  if (path === '/examples/exit-this-page') return { type: 'page', view: exitView(), session };
  if (path === '/examples/problem-with-the-service')
    return { type: 'page', view: problemView(200), session };
  if (path === '/examples/service-unavailable')
    return { type: 'page', view: unavailableView(), session };

  const fixtureRoute = /^\/components\/([a-z0-9-]+)\/fixture$/.exec(path);
  if (fixtureRoute?.[1]) {
    const name = fixtureRoute[1];
    if (!isKnownComponent(name)) return { type: 'page', view: notFoundView(), session };
    const fixture = getFixture(name, url.searchParams.get('fixture') ?? '');
    if (!fixture) return { type: 'page', view: notFoundView(), session };
    return { type: 'raw', response: htmlResponse(200, fixture.html, request, 'document', []) };
  }

  const componentRoute = /^\/components\/([a-z0-9-]+)$/.exec(path);
  if (componentRoute?.[1]) {
    const name = componentRoute[1];
    if (!isKnownComponent(name)) return { type: 'page', view: notFoundView(), session };
    const view = componentView(name, url.searchParams.get('fixture'));
    if (!view) return { type: 'page', view: notFoundView(), session };
    return { type: 'page', view, session };
  }
  return undefined;
}

function postStep(step: Step, body: ParsedBody, session: Session, now: Date): RedirectResult {
  const errors = validateStep(step, body, now);
  session.application = applyStep(step, body, session.application, errors.length === 0);
  if (errors.length > 0) {
    session.errors = { path: step.path, items: errors };
    return { type: 'redirect', location: withReturn(step.path, body), session };
  }
  session.errors = null;
  const returnTo = field(body, 'returnTo');
  if (returnTo === 'check-answers')
    return { type: 'redirect', location: '/check-answers', session };
  return { type: 'redirect', location: nextStep(step.id)?.path ?? '/check-answers', session };
}

function validateStep(step: Step, body: ParsedBody, now: Date): FieldError[] {
  switch (step.id) {
    case 'name':
      return validateName(field(body, 'first-name'), field(body, 'last-name'));
    case 'date-of-birth':
      return validateDateOfBirth(
        field(body, 'date-of-birth-day'),
        field(body, 'date-of-birth-month'),
        field(body, 'date-of-birth-year'),
        now,
      );
    case 'email':
      return validateEmail(field(body, 'email'));
    case 'contact-preference':
      return validateContactPreference(field(body, 'contact-by'), field(body, 'telephone'));
    case 'where-you-will-fish':
      return validateRegions(fields(body, 'regions'));
    case 'licence-length':
      return validateLicenceLength(field(body, 'licence-length'));
    case 'start-month':
      return validateStartMonth(field(body, 'start-month'), now);
    case 'address':
      return validateAddress(
        field(body, 'address-line-1'),
        field(body, 'town'),
        field(body, 'postcode'),
      );
    case 'evidence':
      return validateEvidence(uploadedName(body) ?? '');
    case 'additional-details':
      return validateAdditionalDetails(field(body, 'additional-details'));
    case 'create-a-password':
      return validatePassword(field(body, 'password'), field(body, 'password-confirm'));
  }
}

function applyStep(
  step: Step,
  body: ParsedBody,
  application: ReturnType<typeof createApplication>,
  valid: boolean,
) {
  switch (step.id) {
    case 'name':
      return saveName(application, field(body, 'first-name'), field(body, 'last-name'), valid);
    case 'date-of-birth':
      return saveDate(
        application,
        field(body, 'date-of-birth-day'),
        field(body, 'date-of-birth-month'),
        field(body, 'date-of-birth-year'),
        valid,
      );
    case 'email':
      return saveEmail(application, field(body, 'email'), valid);
    case 'contact-preference':
      return saveContact(application, field(body, 'contact-by'), field(body, 'telephone'), valid);
    case 'where-you-will-fish':
      return saveRegions(application, fields(body, 'regions'), valid);
    case 'licence-length':
      return saveLicence(application, field(body, 'licence-length'), valid);
    case 'start-month':
      return saveMonth(application, field(body, 'start-month'), valid);
    case 'address':
      return saveAddress(
        application,
        {
          line1: field(body, 'address-line-1'),
          line2: field(body, 'address-line-2'),
          town: field(body, 'town'),
          postcode: field(body, 'postcode'),
        },
        valid,
      );
    case 'evidence':
      return saveEvidence(application, uploadedName(body), valid);
    case 'additional-details':
      return saveDetails(application, field(body, 'additional-details'), valid);
    case 'create-a-password':
      return savePassword(application, valid);
  }
}

function uploadedName(body: ParsedBody): string | undefined {
  if (!body.file || body.file.fieldName !== 'evidence') return undefined;
  return safeFilename(body.file.filename);
}

function postCookieBanner(body: ParsedBody, session: Session): RedirectResult {
  const choice = field(body, 'cookies');
  const location = safeReturn(field(body, 'returnPath'));
  if (choice === 'accept' || choice === 'reject') {
    session.cookieChoice = choice;
    session.cookieBanner = choice;
  } else if (choice === 'hide') {
    session.cookieBanner = null;
  }
  return { type: 'redirect', location, session };
}

function postCookies(body: ParsedBody, session: Session): RedirectResult {
  const errors = validateCookieChoice(field(body, 'analytics'));
  if (errors.length > 0) {
    session.errors = { path: '/cookies', items: errors };
    session.notice = null;
    return { type: 'redirect', location: '/cookies', session };
  }
  session.cookieChoice = field(body, 'analytics') === 'yes' ? 'accept' : 'reject';
  session.cookieBanner = null;
  session.errors = null;
  session.notice = { path: '/cookies', text: 'Your cookie settings were saved' };
  return { type: 'redirect', location: '/cookies', session };
}

function postCheckAnswers(session: Session): RedirectResult {
  if (session.application.submitted)
    return { type: 'redirect', location: '/confirmation', session };
  const incomplete = firstIncompleteStep(session.application);
  if (incomplete) return { type: 'redirect', location: incomplete.path, session };
  session.application = {
    ...session.application,
    submitted: true,
    reference: referenceFor(session.id),
  };
  return { type: 'redirect', location: '/confirmation', session };
}

function checkAnswersGet(session: Session, now: Date): PageResult | RedirectResult {
  if (session.application.submitted)
    return { type: 'redirect', location: '/confirmation', session };
  const incomplete = firstIncompleteStep(session.application);
  if (incomplete) return { type: 'redirect', location: incomplete.path, session };
  return {
    type: 'page',
    session,
    view: {
      template: 'pages/check-answers.njk',
      status: 200,
      heading: 'Check your answers',
      backLink: { text: 'Back', href: '/create-a-password' },
      mainClasses: 'govuk-main-wrapper--l',
      personal: true,
      context: { rows: summaryRows(session.application, now) },
    },
  };
}

function confirmationGet(session: Session): PageResult | RedirectResult {
  if (!session.application.submitted) return { type: 'redirect', location: '/task-list', session };
  return {
    type: 'page',
    session,
    view: {
      template: 'pages/confirmation.njk',
      status: 200,
      heading: 'Application complete',
      showFeedback: true,
      personal: true,
      context: { panel: confirmationPanel(session.application.reference) },
    },
  };
}

function updatesGet(url: URL, session: Session): PageResult | RedirectResult {
  const requested = url.searchParams.get('page');
  const page = requested === '2' ? 2 : 1;
  if (requested && requested !== '1' && requested !== '2') {
    return { type: 'redirect', location: '/updates', session };
  }
  const pagination: Record<string, unknown> = {
    items: [
      { number: 1, href: '/updates', current: page === 1 },
      { number: 2, href: '/updates?page=2', current: page === 2 },
    ],
  };
  if (page > 1) pagination.previous = { href: '/updates' };
  if (page < 2) pagination.next = { href: '/updates?page=2' };
  return {
    type: 'page',
    session,
    view: {
      template: 'pages/updates.njk',
      status: 200,
      heading: 'Service updates',
      breadcrumbs: crumbs('Service updates'),
      context: {
        body:
          page === 2
            ? 'There are no further fee changes planned in this example.'
            : 'Example fees for the 2026 to 2027 season are on the fees page.',
        pagination,
      },
    },
  };
}

function stepView(
  step: Step,
  session: Session,
  url: URL,
  errors: FieldError[],
  now: Date,
): PageView {
  const returnTo = url.searchParams.get('return') === 'check-answers' ? 'check-answers' : undefined;
  const previous = previousStep(step.id);
  return {
    template: `pages/${step.id}.njk`,
    status: 200,
    heading: step.heading,
    hasErrors: errors.length > 0,
    personal: true,
    backLink: {
      text: 'Back',
      href: returnTo ? '/check-answers' : (previous?.path ?? '/task-list'),
    },
    mainClasses: 'govuk-main-wrapper--l',
    context: {
      ...stepContext(step, session, errors, now),
      errorSummary: errorSummary(errors),
      returnTo,
    },
  };
}

function stepContext(
  step: Step,
  session: Session,
  errors: FieldError[],
  now: Date,
): Record<string, unknown> {
  const application = session.application;
  switch (step.id) {
    case 'name':
      return nameFields(application, errors);
    case 'date-of-birth':
      return dateField(application, errors);
    case 'email':
      return emailField(application, errors);
    case 'contact-preference':
      return contactFields(application, errors);
    case 'where-you-will-fish':
      return regionFields(application, errors);
    case 'licence-length':
      return licenceFields(application, errors);
    case 'start-month':
      return monthField(application, errors, now);
    case 'address':
      return addressFields(application, errors);
    case 'evidence':
      return evidenceField(application, errors);
    case 'additional-details':
      return detailsField(application, errors);
    case 'create-a-password':
      return passwordFields(errors);
  }
}

function startView(lang: 'en' | 'cy'): PageView {
  const welsh = lang === 'cy';
  return {
    template: 'pages/start.njk',
    status: 200,
    heading: welsh ? 'Gwneud cais am drwydded bysgota' : 'Apply for a rod fishing licence',
    lang,
    showFeedback: true,
    context: {
      lede: welsh
        ? 'Defnyddiwch y gwasanaeth hwn i wneud cais am drwydded i bysgota gyda gwialen.'
        : 'Use this service to apply for a licence to fish with a rod.',
      timing: welsh ? 'Mae’n cymryd tua 10 munud.' : 'Applying takes about 10 minutes.',
      startButton: {
        text: welsh ? 'Dechrau nawr' : 'Start now',
        href: '/task-list',
        isStartButton: true,
      },
      notification: {
        titleText: welsh ? 'Pwysig' : 'Important',
        text: welsh
          ? 'Mae trwydded gwialen 2026 i 2027 ar gael nawr.'
          : 'The 2026 to 2027 rod licence is now available.',
      },
      warning: {
        text: welsh
          ? 'Rhaid i chi gael trwydded gwialen ddilys cyn i chi bysgota.'
          : 'You must have a valid rod licence before you fish.',
        iconFallbackText: welsh ? 'Rhybudd' : 'Warning',
      },
      inset: {
        text: welsh
          ? 'Mae gweddill yr enghraifft hon yn Saesneg.'
          : 'You need to be 13 or over. This example does not take payment.',
      },
      details: {
        summaryText: welsh ? 'Beth fydd ei angen arnoch' : 'What you will need',
        html: welsh
          ? '<ul class="govuk-list govuk-list--bullet"><li>Eich enw</li><li>Eich dyddiad geni</li><li>Eich cyfeiriad</li></ul>'
          : '<ul class="govuk-list govuk-list--bullet"><li>Your name</li><li>Your date of birth</li><li>Your address</li></ul>',
      },
    },
  };
}

function taskListView(session: Session): PageView {
  return {
    template: 'pages/task-list.njk',
    status: 200,
    heading: 'Your application',
    backLink: { text: 'Back', href: '/' },
    personal: true,
    context: { sections: taskSections(session.application) },
  };
}

function feesView(): PageView {
  return {
    template: 'pages/fees.njk',
    status: 200,
    heading: 'Licence fees',
    breadcrumbs: crumbs('Licence fees'),
    context: { table: feesTable() },
  };
}

function helpView(): PageView {
  return {
    template: 'pages/help.njk',
    status: 200,
    heading: 'Help',
    showFeedback: true,
    breadcrumbs: crumbs('Help'),
    context: { accordion: helpAccordion() },
  };
}

function guidanceView(): PageView {
  return {
    template: 'pages/guidance.njk',
    status: 200,
    heading: 'Guidance',
    breadcrumbs: crumbs('Guidance'),
    context: { tabs: guidanceTabs() },
  };
}

function cookiesView(session: Session, errors: FieldError[]): PageView {
  const notice = takeNotice(session, '/cookies');
  return {
    template: 'pages/cookies.njk',
    status: 200,
    heading: 'Cookies',
    hasErrors: errors.length > 0,
    personal: true,
    breadcrumbs: crumbs('Cookies'),
    context: {
      ...cookieFields(session.cookieChoice, errors),
      errorSummary: errorSummary(errors),
      notice: notice ? { type: 'success', titleText: 'Success', text: notice } : undefined,
    },
  };
}

function accessibilityView(): PageView {
  return {
    template: 'pages/accessibility.njk',
    status: 200,
    heading: 'Accessibility statement',
    showFeedback: true,
    breadcrumbs: crumbs('Accessibility statement'),
    context: {},
  };
}

function aboutView(): PageView {
  return {
    template: 'pages/about.njk',
    status: 200,
    heading: 'About this example',
    showFeedback: true,
    breadcrumbs: crumbs('About this example'),
    context: { frontendVersion: FRONTEND_VERSION },
  };
}

function componentsView(): PageView {
  return {
    template: 'pages/components.njk',
    status: 200,
    heading: 'Component catalogue',
    breadcrumbs: crumbs('Component catalogue'),
    context: { components: listCatalogue(), frontendVersion: FRONTEND_VERSION },
  };
}

function examplesView(): PageView {
  return {
    template: 'pages/examples.njk',
    status: 200,
    heading: 'Example pages',
    breadcrumbs: crumbs('Example pages'),
    context: {},
  };
}

function exitView(): PageView {
  return {
    template: 'pages/exit-this-page.njk',
    status: 200,
    heading: 'Exit this page',
    backLink: { text: 'Back', href: '/examples' },
    exitThisPage: { redirectUrl: 'https://www.bbc.co.uk/weather' },
    context: {},
  };
}

function unavailableView(): PageView {
  return {
    template: 'pages/unavailable.njk',
    status: 200,
    heading: 'Sorry, the service is unavailable',
    backLink: { text: 'Back', href: '/examples' },
    context: {},
  };
}

function componentView(name: string, requested: string | null): PageView | undefined {
  const fixtures = loadComponentFixtures(name).fixtures;
  const fixture = selectFixture(fixtures, requested);
  if (!fixture) return undefined;
  const info = describeComponent(name);
  const rendered = renderComponent(name, fixture.options);
  return {
    template: 'pages/component.njk',
    status: 200,
    heading: info.title,
    backLink: { text: 'Back', href: '/components' },
    context: {
      componentName: name,
      componentTitle: info.title,
      designSystemUrl: info.designSystemUrl,
      description: fixture.description,
      fixtureName: fixture.name,
      rendered,
      parity: parityBanner(rendered === fixture.html),
      fixtures: fixtures.map((item) => ({
        name: item.name,
        href: encodeURIComponent(item.name),
        current: item.name === fixture.name,
      })),
    },
  };
}

function notFoundView(): PageView {
  return {
    template: 'pages/not-found.njk',
    status: 404,
    heading: 'Page not found',
    context: {},
  };
}

function problemView(status: number): PageView {
  return {
    template: 'pages/problem.njk',
    status,
    heading: 'Sorry, there is a problem with the service',
    context: {},
  };
}

function sessionExpiredView(): PageView {
  return {
    template: 'pages/session-expired.njk',
    status: 403,
    heading: 'Sorry, your session has expired',
    context: {},
  };
}

function crumbs(current: string): Record<string, unknown> {
  return { items: [{ href: '/', text: 'Home' }, { text: current }] };
}

function withReturn(path: string, body: ParsedBody): string {
  return field(body, 'returnTo') === 'check-answers' ? `${path}?return=check-answers` : path;
}

function safeReturn(value: string): string {
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('://') ||
    value.includes('\\')
  )
    return '/';
  if (value.includes('\n') || value.includes('\r')) return '/';
  return value;
}

function csrfOk(session: Session, body: ParsedBody): boolean {
  const token = field(body, 'csrf');
  return token.length > 0 && token === session.csrf;
}

function takeErrors(session: Session, path: string): FieldError[] {
  const items = session.errors?.path === path ? session.errors.items : [];
  session.errors = null;
  return items;
}

function takeNotice(session: Session, path: string): string | undefined {
  const text = session.notice?.path === path ? session.notice.text : undefined;
  session.notice = null;
  return text;
}

function openSession(request: Request, store: SessionStore): Session {
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  const id = cookies.get(HOST_SESSION_COOKIE) ?? cookies.get(SESSION_COOKIE);
  if (id) {
    const existing = store.get(id);
    if (existing) return existing;
  }
  return store.create();
}

async function defaultReadBody(request: Request): Promise<ParsedBody> {
  const buffer = Buffer.from(await request.arrayBuffer());
  if (buffer.length > MAX_BODY_BYTES) throw new RequestBodyError(413, 'Payload too large');
  return parseRequestBody(request.headers.get('content-type'), buffer);
}

function resultCookie(request: Request, session: Session): string {
  const secure = requestIsSecure(request);
  return buildSetCookie(secure ? HOST_SESSION_COOKIE : SESSION_COOKIE, session.id, {
    secure,
    maxAge: 60 * 60 * 4,
    ...(secure ? { hostPrefix: true } : {}),
  });
}

function pageResponse(
  view: PageView,
  session: Session,
  url: URL,
  demosEnabled: boolean,
  request: Request,
  render: typeof renderPage,
): Response {
  const body = render(view, session, url, demosEnabled);
  const kind = view.personal === true ? 'sensitive-document' : 'document';
  return htmlResponse(view.status, body, request, kind, [resultCookie(request, session)]);
}

function redirectResponse(location: string, request: Request, cookie: string): Response {
  const headers = documentHeaders(request, 'document', true);
  headers.set('location', location);
  headers.append('set-cookie', cookie);
  return new Response(null, { status: 303, headers });
}

function htmlResponse(
  status: number,
  body: string,
  request: Request,
  kind: 'document' | 'sensitive-document',
  cookies: string[],
): Response {
  const headers = documentHeaders(request, kind, cookies.length > 0);
  for (const cookie of cookies) headers.append('set-cookie', cookie);
  if (kind === 'document') {
    const etag = strongEtag(body);
    headers.set('etag', etag);
    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, { status: 304, headers });
    }
  }
  return new Response(body, { status, headers });
}

function textResponse(
  status: number,
  body: string,
  request: Request,
  contentType = 'text/plain; charset=utf-8',
): Response {
  const headers = new Headers();
  applyResponseHeaders(
    { headers },
    {
      kind: 'static-asset',
      secureTransport: requestIsSecure(request),
      contentType,
    },
  );
  return new Response(body, { status, headers });
}

function assetResponse(asset: Asset, request: Request): Response {
  const headers = new Headers();
  applyResponseHeaders(
    { headers },
    {
      kind: asset.kind,
      secureTransport: requestIsSecure(request),
      contentType: asset.contentType,
    },
  );
  const bytes = asset.body ?? readFileSync(asset.filePath);
  return new Response(bytes, { status: 200, headers });
}

function documentHeaders(
  request: Request,
  kind: 'document' | 'sensitive-document',
  setsCookie: boolean,
): Headers {
  const headers = new Headers();
  applyResponseHeaders(
    { headers },
    {
      kind,
      secureTransport: requestIsSecure(request),
      setsCookie,
      preload: pageAssets().preloads,
    },
  );
  headers.set('x-robots-tag', 'noindex, nofollow');
  return headers;
}

function requestIsSecure(request: Request): boolean {
  if (new URL(request.url).protocol === 'https:') return true;
  const forwarded = request.headers.get('x-forwarded-proto');
  if (!forwarded) return false;
  return forwarded.split(',')[0]!.trim().toLowerCase() === 'https';
}

/**
 * TCP port a server is bound to.
 *
 * @param address - Value from `server.address()`.
 * @returns The port.
 * @throws Error when the server is not bound to a TCP port.
 */
export function listeningPort(address: string | AddressInfo | null): number {
  if (address && typeof address === 'object') return address.port;
  throw new Error('Server is not listening on a TCP port');
}

/**
 * Listen for HTTP requests and adapt Node's request to {@link App.handle}.
 *
 * @param port - Port to bind. `0` asks the operating system for a free port.
 * @param app - Application to serve. Defaults to {@link createApp}.
 * @returns The bound port, a local URL, and a function that closes the server.
 */
export function startServer(
  port = 0,
  app: App = createApp(),
): Promise<{ port: number; url: string; close: () => Promise<void> }> {
  const server = createServer((nodeRequest, nodeResponse) => {
    void writeNodeResponse(nodeRequest, nodeResponse, app);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      const bound = listeningPort(server.address());
      resolve({
        port: bound,
        url: `http://127.0.0.1:${bound}`,
        close: () => closeServer(server),
      });
    });
  });
}

/**
 * HTTP method, treating a missing method as GET.
 *
 * @param method - Node request method.
 * @returns The method.
 */
export function requestMethod(method: string | undefined): string {
  return method ?? 'GET';
}

/**
 * Host used to resolve the request URL.
 *
 * @param host - Node `Host` header, which may be repeated.
 * @returns The first host, or `127.0.0.1`.
 */
export function requestHost(host: string | string[] | undefined): string {
  if (Array.isArray(host)) return host[0] ?? '127.0.0.1';
  return host ?? '127.0.0.1';
}

/**
 * Absolute URL for a Node request target.
 *
 * @param url - Request target. An empty or missing target is `/`.
 * @param host - Host used as the base.
 * @returns The URL.
 */
export function requestTarget(url: string | undefined, host: string): URL {
  const path = url === undefined || url.length === 0 ? '/' : url;
  return new URL(path, `http://${host}`);
}

/**
 * Copy Node incoming headers onto a Fetch `Headers` object.
 *
 * @param headers - Node header map. Array values are appended. Other values are ignored.
 * @param target - Headers to write.
 */
export function copyNodeHeaders(
  headers: Record<string, string | string[] | undefined>,
  target: Headers,
): void {
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) target.append(key, item);
    } else if (typeof value === 'string') {
      target.set(key, value);
    }
  }
}

async function writeNodeResponse(
  nodeRequest: import('node:http').IncomingMessage,
  nodeResponse: import('node:http').ServerResponse,
  app: App,
): Promise<void> {
  const host = requestHost(nodeRequest.headers.host);
  const url = requestTarget(nodeRequest.url, host);
  const chunks: Buffer[] = [];
  for await (const chunk of nodeRequest) {
    chunks.push(Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks);
  const headers = new Headers();
  copyNodeHeaders(nodeRequest.headers, headers);
  const method = requestMethod(nodeRequest.method);
  const init: RequestInit = { method, headers };
  if (method !== 'GET' && method !== 'HEAD') init.body = body;
  const request = new Request(url, init);
  const response = await app.handle(request);
  const payload = Buffer.from(await response.arrayBuffer());
  const encodingHeader = headers.get('accept-encoding');
  const type = response.headers.get('content-type') ?? 'application/octet-stream';
  const compressed = compressBody(payload, encodingHeader, type);
  nodeResponse.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key === 'set-cookie') return;
    nodeResponse.setHeader(key, value);
  });
  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) nodeResponse.setHeader('set-cookie', cookies);
  if (compressed.encoding) nodeResponse.setHeader('content-encoding', compressed.encoding);
  if (isCompressible(type) && nodeResponse.getHeader('vary') === undefined) {
    nodeResponse.setHeader('vary', 'Accept-Encoding');
  }
  for (const name of baselinePolicy.remove) nodeResponse.removeHeader(name);
  nodeResponse.end(method === 'HEAD' ? undefined : compressed.body);
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
