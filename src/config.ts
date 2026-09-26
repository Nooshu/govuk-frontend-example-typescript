import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

type PackageJson = { version: string };

const frontendPackage = dirname(require.resolve('govuk-frontend/package.json'));
const frontendMeta = require('govuk-frontend/package.json') as PackageJson;

/** Pinned GOV.UK Frontend release. CSS, JavaScript, and fixtures all come from this package. */
export const FRONTEND_VERSION = frontendMeta.version;

export const govukDist = join(frontendPackage, 'dist');
export const govukRoot = join(govukDist, 'govuk');
export const componentsRoot = join(govukRoot, 'components');
export const frontendAssetRoot = join(govukRoot, 'assets');
export const viewsRoot = fileURLToPath(new URL('./views/', import.meta.url));

export const SERVICE_NAME = 'Apply for a rod fishing licence';
export const SERVICE_NAME_CY = 'Gwneud cais am drwydded bysgota';

export const MAX_BODY_BYTES = 1_000_000;

export function demosEnabledFromEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== 'production';
}

export function resolvePort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.PORT;
  if (raw === undefined || raw === '') return 3000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${raw}`);
  }
  return port;
}
