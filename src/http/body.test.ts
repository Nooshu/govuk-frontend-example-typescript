import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MAX_BODY_BYTES } from '../config.js';
import { field, fields, parseRequestBody, parseUrlEncoded, RequestBodyError } from './body.js';

function multipart(contentTypeBoundary: string, body: string): ReturnType<typeof parseRequestBody> {
  return parseRequestBody(
    `multipart/form-data; boundary=${contentTypeBoundary}`,
    Buffer.from(body),
  );
}

describe('request bodies', () => {
  it('reads urlencoded fields', () => {
    const empty = parseRequestBody('application/x-www-form-urlencoded', Buffer.alloc(0));
    assert.equal(field(empty, 'missing'), '');
    assert.deepEqual(fields(empty, 'missing'), []);

    const parsed = parseUrlEncoded('a=1&a=2&b=hello+world');
    assert.deepEqual(fields(parsed, 'a'), ['1', '2']);
    assert.equal(field(parsed, 'b'), 'hello world');

    const typed = parseRequestBody(
      'Application/X-WWW-Form-Urlencoded; charset=UTF-8',
      Buffer.from('name=Ada'),
    );
    assert.equal(field(typed, 'name'), 'Ada');
  });

  it('rejects bodies that are too large or the wrong type', () => {
    assert.throws(
      () => parseRequestBody('text/plain', Buffer.alloc(MAX_BODY_BYTES + 1)),
      (error: unknown) => error instanceof RequestBodyError && error.status === 413,
    );
    assert.throws(
      () => parseRequestBody(null, Buffer.from('x')),
      (error: unknown) => error instanceof RequestBodyError && error.status === 415,
    );
    assert.throws(
      () => parseRequestBody('text/plain', Buffer.from('x')),
      (error: unknown) => error instanceof RequestBodyError && error.status === 415,
    );
    assert.deepEqual(parseRequestBody(null, Buffer.alloc(0)).fields.size, 0);
  });

  it('reads multipart fields and one file name', () => {
    const boundary = '----bound';
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="csrf"',
      '',
      'token',
      `--${boundary}`,
      'Content-Disposition: form-data; name="csrf"',
      '',
      'again',
      `--${boundary}`,
      'X-Unrelated: yes',
      '',
      'ignored',
      `--${boundary}`,
      'Content-Disposition: form-data; name="evidence"; filename="notes.pdf"',
      '',
      'file-bytes',
      `--${boundary}`,
      'Content-Disposition: form-data; name="empty"; filename=""',
      '',
      'ignored',
      `--${boundary}`,
      'Content-Disposition: form-data; filename="orphan.txt"',
      '',
      'no-name',
      `--${boundary}--`,
      '',
    ].join('\r\n');
    const parsed = multipart(`"${boundary}"`, body);
    assert.deepEqual(fields(parsed, 'csrf'), ['token', 'again']);
    assert.deepEqual(parsed.file, { fieldName: 'evidence', filename: 'notes.pdf' });

    const plain = multipart(
      'plain',
      `--plain\r\nContent-Disposition: form-data; name="a"\r\n\r\nok\r\n--plain--`,
    );
    assert.equal(field(plain, 'a'), 'ok');
    assert.equal(plain.file, undefined);
  });

  it('rejects malformed multipart bodies', () => {
    assert.throws(
      () => parseRequestBody('multipart/form-data', Buffer.from('x')),
      /Missing multipart boundary/,
    );
    assert.throws(
      () => parseRequestBody('multipart/form-data; boundary=', Buffer.from('x')),
      /Missing multipart boundary/,
    );
    assert.throws(
      () => parseRequestBody('multipart/form-data; boundary=""', Buffer.from('x')),
      /Missing multipart boundary/,
    );
    assert.throws(
      () => parseRequestBody('multipart/form-data; boundary="  "', Buffer.from('x')),
      /Missing multipart boundary/,
    );
    assert.throws(
      () => parseRequestBody('multipart/form-data; boundary=   ', Buffer.from('x')),
      /Missing multipart boundary/,
    );
    assert.throws(() => multipart('bound', 'no delimiter here'), /Malformed multipart body/);
    assert.throws(
      () => multipart('bound', '--bound\r\nContent-Disposition: form-data; name="a"\r\n\r\nvalue'),
      /Malformed multipart body/,
    );
    assert.throws(
      () => multipart('bound', '--bound\r\nnot-a-part\r\n--bound--'),
      /Malformed multipart part/,
    );

    const loose = multipart(
      'bound',
      '--bound\nContent-Disposition: form-data; name="a"\r\n\r\nvalue--bound--',
    );
    assert.equal(field(loose, 'a'), 'value');
  });
});
