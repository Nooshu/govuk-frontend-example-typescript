import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { accessSync, readFileSync, statSync } from 'node:fs';
import { join, normalize, relative } from 'node:path';

import { frontendAssetRoot, govukRoot } from '../config.js';

const ROOT_FILES = new Set(['govuk-frontend.min.css', 'govuk-frontend.min.js']);

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

/** Cache kind from the shared baseline. Fingerprinted URLs can be immutable. */
export type AssetKind = 'fingerprinted-asset' | 'static-asset';

/** A static file that is safe to send. */
export type Asset = {
  filePath: string;
  body?: Buffer;
  contentType: string;
  kind: AssetKind;
};

/** Stylesheet, application module, and font preloads for one page. */
export type PageAssets = {
  stylesheetHref: string;
  appModuleHref: string;
  preloads: { href: string; as: 'font'; type: 'font/woff2' }[];
};

type Published = PageAssets & {
  cssHref: string;
  scriptHref: string;
  appHref: string;
  css: Buffer;
  script: Buffer;
  app: Buffer;
};

let published: Published | undefined;

/**
 * Fingerprinted stylesheet and module URLs, plus the font files the CSS uses.
 *
 * @returns Paths to put in the page. The URLs change when the file bytes change.
 */
export function pageAssets(): PageAssets {
  const assets = loadPublished();
  return {
    stylesheetHref: assets.stylesheetHref,
    appModuleHref: assets.appModuleHref,
    preloads: assets.preloads,
  };
}

/**
 * Resolve `/assets/…` to a file inside the Frontend package, or to the fingerprinted
 * stylesheet, script, or application module.
 *
 * @param urlPath - Request path, including the `/assets/` prefix.
 * @param roots - Directories for root files (`govuk-frontend.min.css` and `.js`) and nested assets.
 * @returns The file to send, or `undefined` when the path is missing, unsafe, or not an allowed type.
 */
export function resolveAsset(
  urlPath: string,
  roots: { files: string; assets: string } = { files: govukRoot, assets: frontendAssetRoot },
): Asset | undefined {
  if (!urlPath.startsWith('/assets/')) return undefined;
  if (roots.files === govukRoot && roots.assets === frontendAssetRoot) {
    const fingerprinted = publishedAsset(urlPath);
    if (fingerprinted) return fingerprinted;
  }

  let requested: string;
  try {
    requested = decodeURIComponent(urlPath.slice('/assets/'.length));
  } catch {
    return undefined;
  }
  if (!requested || requested.includes('\0')) return undefined;

  const rootFile = ROOT_FILES.has(requested);
  const root = rootFile ? roots.files : roots.assets;
  const target = normalize(join(root, requested));
  if (!isInside(root, target)) return undefined;

  const extension = extensionOf(target);
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) return undefined;

  try {
    accessSync(target, fsConstants.R_OK);
    if (!statSync(target).isFile()) return undefined;
  } catch {
    return undefined;
  }

  return { filePath: target, contentType, kind: assetKind(requested) };
}

function publishedAsset(urlPath: string): Asset | undefined {
  const assets = loadPublished();
  if (urlPath === assets.cssHref) {
    return {
      filePath: join(govukRoot, 'govuk-frontend.min.css'),
      body: assets.css,
      contentType: 'text/css; charset=utf-8',
      kind: 'fingerprinted-asset',
    };
  }
  if (urlPath === assets.scriptHref) {
    return {
      filePath: join(govukRoot, 'govuk-frontend.min.js'),
      body: assets.script,
      contentType: 'text/javascript; charset=utf-8',
      kind: 'fingerprinted-asset',
    };
  }
  if (urlPath === assets.appHref) {
    return {
      filePath: '',
      body: assets.app,
      contentType: 'text/javascript; charset=utf-8',
      kind: 'fingerprinted-asset',
    };
  }
  return undefined;
}

function loadPublished(): Published {
  if (published) return published;
  const css = readFileSync(join(govukRoot, 'govuk-frontend.min.css'));
  const script = readFileSync(join(govukRoot, 'govuk-frontend.min.js'));
  const cssHref = `/assets/govuk-frontend.${fingerprint(css)}.min.css`;
  const scriptHref = `/assets/govuk-frontend.${fingerprint(script)}.min.js`;
  const app = Buffer.from(`import { initAll } from '${scriptHref}';\n\ninitAll();\n`, 'utf8');
  const appHref = `/assets/app.${fingerprint(app)}.mjs`;
  published = {
    stylesheetHref: cssHref,
    appModuleHref: appHref,
    preloads: fontPreloads(css.toString('utf8')),
    cssHref,
    scriptHref,
    appHref,
    css,
    script,
    app,
  };
  return published;
}

function fontPreloads(css: string): PageAssets['preloads'] {
  const hrefs = new Set<string>();
  for (const match of css.matchAll(/url\((\/assets\/fonts\/[^)]+\.woff2)\)/g)) {
    hrefs.add(match[0].slice('url('.length, -1));
  }
  return [...hrefs].map((href) => ({ href, as: 'font', type: 'font/woff2' }));
}

function fingerprint(body: Buffer): string {
  return createHash('sha256').update(body).digest('hex').slice(0, 10);
}

function assetKind(requested: string): AssetKind {
  if (requested.startsWith('fonts/') && /-[a-f0-9]{8,}-/.test(requested)) {
    return 'fingerprinted-asset';
  }
  return 'static-asset';
}

function extensionOf(filePath: string): string {
  const dot = filePath.lastIndexOf('.');
  if (dot === -1) return '';
  return filePath.slice(dot).toLowerCase();
}

function isInside(root: string, target: string): boolean {
  const rel = relative(normalize(root), target);
  return rel.length > 0 && !rel.startsWith('..');
}
