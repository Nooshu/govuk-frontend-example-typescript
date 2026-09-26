import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

type PackageJson = { version: string };

const frontendPackage = dirname(require.resolve('govuk-frontend/package.json'));
const frontendMeta = require('govuk-frontend/package.json') as PackageJson;

/** Pinned GOV.UK Frontend release. CSS, JavaScript, and fixtures all come from this package. */
export const FRONTEND_VERSION = frontendMeta.version;

/** Absolute path to the installed `govuk-frontend` `dist` directory. */
export const govukDist = join(frontendPackage, 'dist');

/** Absolute path to `dist/govuk`, including the page template and components. */
export const govukRoot = join(govukDist, 'govuk');

/** Absolute path to the component directories that ship `fixtures.json`. */
export const componentsRoot = join(govukRoot, 'components');

/** Absolute path to fonts, images, and other files served under `/assets`. */
export const frontendAssetRoot = join(govukRoot, 'assets');

/** Absolute path to this app's Nunjucks page templates. */
export const viewsRoot = fileURLToPath(new URL('./views/', import.meta.url));

/** English service name used in the header, title, and phase banner. */
export const SERVICE_NAME = 'Apply for a rod fishing licence';

/** Welsh service name used on the Welsh start page. */
export const SERVICE_NAME_CY = 'Gwneud cais am drwydded bysgota';

/** Maximum accepted request body size, in bytes. */
export const MAX_BODY_BYTES = 1_000_000;

/**
 * Whether component demos are on.
 *
 * @param env - Process environment. Defaults to `process.env`.
 * @returns `false` when `NODE_ENV` is `production`.
 */
export function demosEnabledFromEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== 'production';
}

/**
 * Port for `npm start`.
 *
 * @param env - Process environment. Defaults to `process.env`.
 * @returns `PORT` when it is an integer from 0 to 65535, otherwise 3000.
 * @throws Error when `PORT` is set but not a valid port.
 */
export function resolvePort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.PORT;
  if (raw === undefined || raw === '') return 3000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${raw}`);
  }
  return port;
}
