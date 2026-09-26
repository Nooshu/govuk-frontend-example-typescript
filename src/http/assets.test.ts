import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveAsset } from './assets.js';

describe('static assets', () => {
  it('serves Frontend CSS, JavaScript, and font files', () => {
    const css = resolveAsset('/assets/govuk-frontend.min.css');
    assert.match(css?.contentType ?? '', /^text\/css/);
    assert.match(css?.cacheControl ?? '', /max-age=86400/);

    const script = resolveAsset('/assets/govuk-frontend.min.js');
    assert.match(script?.contentType ?? '', /javascript/);

    const font = resolveAsset('/assets/fonts/bold-b542beb274-v2.woff2');
    assert.equal(font?.contentType, 'font/woff2');
    assert.match(font?.cacheControl ?? '', /immutable/);

    const woff = resolveAsset('/assets/fonts/bold-affa96571d-v2.woff');
    assert.equal(woff?.contentType, 'font/woff');
    assert.match(resolveAsset('/assets/manifest.json')?.contentType ?? '', /json/);
  });

  it('rejects paths that are not a published file', () => {
    assert.equal(resolveAsset('/other/govuk-frontend.min.css'), undefined);
    assert.equal(resolveAsset('/assets/%'), undefined);
    assert.equal(resolveAsset('/assets/'), undefined);
    assert.equal(resolveAsset('/assets/%00.css'), undefined);
    assert.equal(resolveAsset('/assets/../govuk-frontend.min.css'), undefined);
    assert.equal(resolveAsset('/assets/missing.css'), undefined);
    assert.equal(resolveAsset('/assets/govuk-frontend.min.css.map'), undefined);
  });

  it('rejects directories and files outside the configured roots', () => {
    const files = mkdtempSync(join(tmpdir(), 'govuk-files-'));
    const assets = mkdtempSync(join(tmpdir(), 'govuk-assets-'));
    writeFileSync(join(files, 'govuk-frontend.min.css'), 'body{}');
    writeFileSync(join(assets, 'icon.png'), 'png');
    writeFileSync(join(assets, 'photo.jpg'), 'jpg');
    writeFileSync(join(assets, 'photo.jpeg'), 'jpeg');
    writeFileSync(join(assets, 'mark.svg'), '<svg/>');
    writeFileSync(join(assets, 'anim.gif'), 'gif');
    writeFileSync(join(assets, 'favicon.ico'), 'ico');
    mkdirSync(join(assets, 'fonts'));
    mkdirSync(join(assets, 'images'));
    writeFileSync(join(assets, 'images', 'crest.png'), 'png');
    mkdirSync(join(assets, 'folder.css'));
    writeFileSync(join(assets, 'notes.txt'), 'no');
    writeFileSync(join(assets, 'LICENSE'), 'no');

    const roots = { files, assets };
    assert.match(
      resolveAsset('/assets/govuk-frontend.min.css', roots)?.filePath ?? '',
      /govuk-frontend\.min\.css$/,
    );
    assert.equal(resolveAsset('/assets/icon.png', roots)?.contentType, 'image/png');
    assert.equal(resolveAsset('/assets/photo.jpg', roots)?.contentType, 'image/jpeg');
    assert.equal(resolveAsset('/assets/photo.jpeg', roots)?.contentType, 'image/jpeg');
    assert.match(resolveAsset('/assets/mark.svg', roots)?.contentType ?? '', /svg/);
    assert.equal(resolveAsset('/assets/anim.gif', roots)?.contentType, 'image/gif');
    assert.equal(resolveAsset('/assets/favicon.ico', roots)?.contentType, 'image/x-icon');
    assert.match(resolveAsset('/assets/images/crest.png', roots)?.cacheControl ?? '', /immutable/);
    assert.equal(resolveAsset('/assets/folder.css', roots), undefined);
    assert.equal(resolveAsset('/assets/notes.txt', roots), undefined);
    assert.equal(resolveAsset('/assets/LICENSE', roots), undefined);
    assert.equal(resolveAsset('/assets/../../etc/passwd', roots), undefined);
    assert.equal(resolveAsset('/assets/.', roots), undefined);
  });
});
