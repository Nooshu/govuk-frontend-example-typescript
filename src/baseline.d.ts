/**
 * Types for the shared baseline helpers in `baseline/`.
 * The implementation is the language-agnostic template's JavaScript.
 */
declare module '#baseline' {
  export type ResponseKind =
    | 'document'
    | 'sensitive-document'
    | 'fingerprinted-asset'
    | 'static-asset'
    | 'download'
    | 'sensitive-download';

  export type HeaderAccess = {
    setHeader?(name: string, value: string): void;
    removeHeader?(name: string): void;
    headers?: {
      set(name: string, value: string): void;
      delete?(name: string): void;
    };
  };

  export type PreloadLink = {
    href: string;
    as: 'style' | 'script' | 'font' | 'image' | 'fetch';
    type?: string;
    crossorigin?: boolean;
  };

  export type ResponseHeaderOptions = {
    kind: ResponseKind;
    secureTransport: boolean;
    setsCookie?: boolean;
    contentType?: string;
    hstsPreload?: boolean;
    preload?: readonly PreloadLink[];
  };

  export type BuiltHeaders = {
    kind: ResponseKind;
    headers: Record<string, string>;
    remove: readonly string[];
  };

  export type SetCookieOptions = {
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None';
    path?: string;
    maxAge?: number;
    hostPrefix?: boolean;
    domain?: string;
  };

  export function applyResponseHeaders(
    response: HeaderAccess,
    options: ResponseHeaderOptions,
  ): BuiltHeaders;

  export function buildSetCookie(name: string, value: string, options?: SetCookieOptions): string;

  export function strongEtag(body: string | Uint8Array): string;

  export const baselinePolicy: {
    readonly remove: readonly string[];
  };
}
