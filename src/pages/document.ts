import { createRequire } from 'node:module';

import { renderComponent } from '../components/render.js';
import { govukDist, SERVICE_NAME, SERVICE_NAME_CY, viewsRoot } from '../config.js';
import { pageTitle, safeLocalPath } from '../html.js';
import { pageAssets } from '../http/assets.js';
import type { Session } from '../session/store.js';

const require = createRequire(import.meta.url);
const nunjucks = require('nunjucks') as typeof import('nunjucks');

/**
 * Data for one page render. A page has a back link or breadcrumbs, not both.
 */
export type PageView = {
  template: string;
  status: number;
  heading: string;
  hasErrors?: boolean;
  lang?: 'en' | 'cy';
  backLink?: Record<string, unknown>;
  breadcrumbs?: Record<string, unknown>;
  mainClasses?: string;
  showFeedback?: boolean;
  personal?: boolean;
  exitThisPage?: Record<string, unknown>;
  context: Record<string, unknown>;
};

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader([viewsRoot, govukDist]), {
  autoescape: true,
  trimBlocks: true,
  lstripBlocks: true,
});

const FEEDBACK = {
  titleText: 'Help us improve this service',
  html: '<p class="govuk-body">This example does not send feedback. <a class="govuk-link" href="/help">Get help with this example</a>.</p>',
};

/**
 * Render a page inside the GOV.UK Frontend page template.
 *
 * @param view - Template name, heading, and page-specific context.
 * @param session - Session used for the CSRF token and cookie banner.
 * @param url - Request URL, used for a safe return path.
 * @param demosEnabled - Whether catalogue and example links are included.
 * @returns The full HTML document.
 * @throws Error when the view sets both a back link and breadcrumbs.
 */
export function renderPage(
  view: PageView,
  session: Session,
  url: URL,
  demosEnabled: boolean,
): string {
  if (view.backLink && view.breadcrumbs) {
    throw new Error('A page cannot include both a back link and breadcrumbs');
  }
  const lang = view.lang ?? 'en';
  const serviceName = lang === 'cy' ? SERVICE_NAME_CY : SERVICE_NAME;
  const assets = pageAssets();
  return env.render(view.template, {
    ...view.context,
    heading: view.heading,
    csrf: session.csrf,
    stylesheetHref: assets.stylesheetHref,
    appModuleHref: assets.appModuleHref,
    htmlLang: lang,
    pageTitle: pageTitle(view.heading, serviceName, view.hasErrors === true),
    skipLinkText: lang === 'cy' ? "Neidio i'r prif gynnwys" : 'Skip to main content',
    serviceNavigation: serviceNavigation(lang),
    footer: footer(lang, demosEnabled),
    phaseBanner: phaseBanner(lang),
    demoBanner: demoBanner(lang),
    cookieBanner: cookieBanner(session),
    feedback: FEEDBACK,
    showFeedback: view.showFeedback === true,
    demosEnabled,
    backLink: view.backLink,
    breadcrumbs: view.breadcrumbs,
    mainClasses: view.mainClasses ?? '',
    exitThisPage: view.exitThisPage,
    returnPath: safeLocalPath(`${url.pathname}${url.search}`),
  });
}

function serviceNavigation(lang: 'en' | 'cy'): Record<string, unknown> {
  return {
    serviceName: lang === 'cy' ? SERVICE_NAME_CY : SERVICE_NAME,
    serviceUrl: lang === 'cy' ? '/cy' : '/',
    slots: {
      end: renderComponent('language-navigation', {
        ariaLabel: lang === 'cy' ? 'Iaith' : 'Language',
        items:
          lang === 'cy'
            ? [
                { text: 'English', lang: 'en', href: '/' },
                { text: 'Cymraeg', lang: 'cy', current: true },
              ]
            : [
                { text: 'English', lang: 'en', current: true },
                { text: 'Cymraeg', lang: 'cy', href: '/cy' },
              ],
      }),
    },
  };
}

function footer(lang: 'en' | 'cy', demosEnabled: boolean): Record<string, unknown> {
  const items = [
    { href: '/help', text: 'Help' },
    { href: '/fees', text: 'Licence fees' },
    { href: '/updates', text: 'Service updates' },
    { href: '/guidance', text: 'Guidance' },
    { href: '/cookies', text: 'Cookies' },
    { href: '/accessibility', text: 'Accessibility' },
    { href: '/about', text: 'About this example' },
  ];
  if (demosEnabled) {
    items.push(
      { href: '/components', text: 'Component catalogue' },
      { href: '/examples', text: 'Example pages' },
    );
  }
  if (lang !== 'cy') return { meta: { items } };
  return {
    meta: { items },
    contentLicence: {
      html: 'Mae’r holl gynnwys ar gael dan <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence-cymraeg/version/3/" rel="license">Drwydded y Llywodraeth Agored v3.0</a>, ac eithrio lle nodir yn wahanol',
    },
    copyright: { html: '<span>Hawlfraint y Goron</span>' },
  };
}

function phaseBanner(lang: 'en' | 'cy'): Record<string, unknown> {
  if (lang === 'cy') {
    return {
      tag: { text: 'Enghraifft' },
      html: 'Mae hon yn wasanaeth enghreifftiol – bydd eich <a class="govuk-link" href="/about">adborth</a> yn ein helpu i wella’r gwasanaeth.',
    };
  }
  return {
    tag: { text: 'Example' },
    html: 'This is an example service – your <a class="govuk-link" href="/about">feedback</a> will help us to improve it.',
  };
}

/**
 * Site-wide demo warning shown on every page (notification banner, Important).
 * Rendered full width at the top of `main` (see `layout.njk`). Uses
 * `app-notification-banner--demo` so `govuk-overrides.scss` can paint yellow
 * chrome for this demo notice only — Frontend’s default Important stays blue.
 */
function demoBanner(lang: 'en' | 'cy'): Record<string, unknown> {
  if (lang === 'cy') {
    return {
      titleText: 'Pwysig',
      text: 'Mae hon yn arddangosiad byw. Nid yw’n wasanaeth llywodraeth go iawn.',
      classes: 'app-notification-banner--demo',
    };
  }
  return {
    titleText: 'Important',
    text: 'This is a live demo. It is not a real government service.',
    classes: 'app-notification-banner--demo',
  };
}

function cookieBanner(session: Session): Record<string, unknown> | undefined {
  if (session.cookieBanner === 'accept') {
    return confirmationBanner('You have accepted analytics cookies.');
  }
  if (session.cookieBanner === 'reject') {
    return confirmationBanner('You have rejected analytics cookies.');
  }
  if (session.cookieChoice) return undefined;
  return {
    messages: [
      {
        headingText: 'Cookies on Apply for a rod fishing licence',
        text: 'We use analytics cookies to understand how you use this example service. This example does not set analytics cookies.',
        actions: [
          { text: 'Accept analytics cookies', type: 'submit', name: 'cookies', value: 'accept' },
          { text: 'Reject analytics cookies', type: 'submit', name: 'cookies', value: 'reject' },
          { text: 'View cookies', href: '/cookies' },
        ],
      },
    ],
  };
}

function confirmationBanner(text: string): Record<string, unknown> {
  return {
    messages: [
      {
        text,
        role: 'alert',
        actions: [{ text: 'Hide cookie message', type: 'submit', name: 'cookies', value: 'hide' }],
      },
    ],
  };
}
