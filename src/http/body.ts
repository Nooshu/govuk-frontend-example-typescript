import { MAX_BODY_BYTES } from '../config.js';

/**
 * A request body that could not be read.
 *
 * `status` is the HTTP status to return, such as 413 or 415.
 */
export class RequestBodyError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'RequestBodyError';
    this.status = status;
  }
}

/** A file part from a multipart body. Only the field name and filename are kept. */
export type UploadedFile = {
  fieldName: string;
  filename: string;
};

/** Parsed form fields, plus at most one uploaded file. */
export type ParsedBody = {
  fields: Map<string, string[]>;
  file?: UploadedFile;
};

/**
 * First value posted for a field.
 *
 * @param body - Parsed body.
 * @param name - Field name.
 * @returns The first value, or an empty string when the field is absent.
 */
export function field(body: ParsedBody, name: string): string {
  return body.fields.get(name)?.[0] ?? '';
}

/**
 * Every value posted for a field.
 *
 * @param body - Parsed body.
 * @param name - Field name.
 * @returns The values, or an empty list when the field is absent.
 */
export function fields(body: ParsedBody, name: string): string[] {
  return body.fields.get(name) ?? [];
}

/**
 * Parse a urlencoded or multipart form body.
 *
 * @param contentType - Request `Content-Type`, or `null`.
 * @param body - Raw body.
 * @returns Fields and, for multipart, one file part.
 * @throws RequestBodyError when the body is too large, the type is unsupported, or multipart is malformed.
 */
export function parseRequestBody(contentType: string | null, body: Buffer): ParsedBody {
  if (body.length > MAX_BODY_BYTES) {
    throw new RequestBodyError(413, 'Payload too large');
  }
  if (body.length === 0) return { fields: new Map() };
  const type = mediaType(contentType);
  if (type === 'application/x-www-form-urlencoded') return parseUrlEncoded(body.toString('utf8'));
  if (contentType !== null && type === 'multipart/form-data')
    return parseMultipart(contentType, body);
  throw new RequestBodyError(415, 'Unsupported media type');
}

function mediaType(contentType: string | null): string {
  const header = contentType ?? '';
  const semi = header.indexOf(';');
  const type = semi === -1 ? header : header.slice(0, semi);
  return type.trim().toLowerCase();
}

/**
 * Parse an `application/x-www-form-urlencoded` body.
 *
 * @param raw - Decoded body text.
 * @returns The fields. Repeated names keep every value.
 */
export function parseUrlEncoded(raw: string): ParsedBody {
  const fieldsMap = new Map<string, string[]>();
  for (const [key, value] of new URLSearchParams(raw)) {
    const existing = fieldsMap.get(key);
    if (existing) existing.push(value);
    else fieldsMap.set(key, [value]);
  }
  return { fields: fieldsMap };
}

/**
 * Parse a `multipart/form-data` body.
 *
 * @param contentType - Full `Content-Type`, including the boundary.
 * @param body - Raw body.
 * @returns The fields and the first file part that has a filename.
 * @throws RequestBodyError when the boundary is missing or the body is malformed.
 */
export function parseMultipart(contentType: string, body: Buffer): ParsedBody {
  const boundary = boundaryFrom(contentType);
  if (!boundary) throw new RequestBodyError(400, 'Missing multipart boundary');
  const delimiter = Buffer.from(`--${boundary}`);
  const fieldsMap = new Map<string, string[]>();
  let file: UploadedFile | undefined;
  let start = body.indexOf(delimiter);
  if (start === -1) throw new RequestBodyError(400, 'Malformed multipart body');

  while (start !== -1) {
    let partStart = start + delimiter.length;
    if (body.subarray(partStart, partStart + 2).toString('utf8') === '--') break;
    if (body.subarray(partStart, partStart + 2).toString('utf8') === '\r\n') partStart += 2;
    const next = body.indexOf(delimiter, partStart);
    if (next === -1) throw new RequestBodyError(400, 'Malformed multipart body');
    let partEnd = next;
    if (body.subarray(partEnd - 2, partEnd).toString('utf8') === '\r\n') partEnd -= 2;
    const part = body.subarray(partStart, partEnd);
    const headerEnd = indexOfHeaderEnd(part);
    if (headerEnd === -1) throw new RequestBodyError(400, 'Malformed multipart part');
    const headerText = part.subarray(0, headerEnd).toString('utf8');
    const content = part.subarray(headerEnd + 4);
    const disposition = /content-disposition:[^\r\n]*/i.exec(headerText)?.[0] ?? '';
    const name = /\bname="([^"]*)"/.exec(disposition)?.[1];
    const filename = /\bfilename="([^"]*)"/.exec(disposition)?.[1];
    if (name && filename !== undefined) {
      if (filename !== '') file = { fieldName: name, filename };
    } else if (name) {
      pushField(fieldsMap, name, content.toString('utf8'));
    }
    start = next;
  }

  return file ? { fields: fieldsMap, file } : { fields: fieldsMap };
}

function boundaryFrom(contentType: string): string | undefined {
  const quoted = /boundary="([^"]*)"/i.exec(contentType);
  if (quoted) return cleanedBoundary(quoted[1]);
  const plain = /boundary=([^;]+)/i.exec(contentType);
  return cleanedBoundary(plain?.[1]);
}

function cleanedBoundary(value: string | undefined): string | undefined {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : undefined;
}

function indexOfHeaderEnd(part: Buffer): number {
  return part.indexOf('\r\n\r\n');
}

function pushField(fieldsMap: Map<string, string[]>, name: string, value: string): void {
  const existing = fieldsMap.get(name);
  if (existing) existing.push(value);
  else fieldsMap.set(name, [value]);
}
