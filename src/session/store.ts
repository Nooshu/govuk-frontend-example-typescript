import { randomBytes } from 'node:crypto';

import type { Application } from '../service/model.js';
import { createApplication } from '../service/model.js';

/** Cookie banner choice stored on the session. */
export type CookieChoice = 'accept' | 'reject';

/** In-memory session for one applicant. */
export type Session = {
  id: string;
  csrf: string;
  application: Application;
  cookieChoice: CookieChoice | null;
  cookieBanner: CookieChoice | null;
  errors: { path: string; items: { field: string; href: string; text: string }[] } | null;
  notice: { path: string; text: string } | null;
};

/** Store that creates, reads, and replaces sessions. */
export type SessionStore = {
  create(): Session;
  get(id: string): Session | undefined;
  save(session: Session): void;
};

/**
 * Create a session with a new id, CSRF token, and empty application.
 *
 * @returns The session. It is not stored until a {@link SessionStore} saves it.
 */
export function createSession(): Session {
  return {
    id: randomBytes(16).toString('hex'),
    csrf: randomBytes(16).toString('hex'),
    application: createApplication(),
    cookieChoice: null,
    cookieBanner: null,
    errors: null,
    notice: null,
  };
}

/**
 * Session store that keeps sessions in memory for this process.
 *
 * @returns A store. Sessions disappear when the process stops.
 */
export function createMemoryStore(): SessionStore {
  const sessions = new Map<string, Session>();
  return {
    create() {
      const session = createSession();
      sessions.set(session.id, session);
      return session;
    },
    get(id) {
      return sessions.get(id);
    },
    save(session) {
      sessions.set(session.id, session);
    },
  };
}

/**
 * Confirmation reference for a session.
 *
 * @param sessionId - Session id, hex.
 * @returns `FR` plus eight digits derived from the session id.
 */
export function referenceFor(sessionId: string): string {
  const digits = BigInt(`0x${sessionId.slice(0, 8)}`)
    .toString()
    .padStart(8, '0')
    .slice(-8);
  return `FR${digits}`;
}
