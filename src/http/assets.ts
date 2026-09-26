import { constants as fsConstants } from 'node:fs';
import { accessSync, statSync } from 'node:fs';
import { join, normalize, relative } from 'node:path';

import { frontendAssetRoot, govukRoot } from '../config.js';

const ROOT_FILES = new Set(['govuk-frontend.min.css', 'govuk-frontend.min.js']);

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
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

/** A Frontend static file that is safe to send. */
export type Asset = {
  filePath: string;
  contentType: string;
  cacheControl: string;
};

/**
 * Resolve `/assets/…` to a file inside the Frontend package.
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

  const cacheControl =
    requested.startsWith('fonts/') || requested.startsWith('images/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=86400';

  return { filePath: target, contentType, cacheControl };
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
