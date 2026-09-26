import { randomBytes } from 'node:crypto';

import type { Application } from '../service/model.js';
import { createApplication } from '../service/model.js';

export type CookieChoice = 'accept' | 'reject';

export type Session = {
  id: string;
  csrf: string;
  application: Application;
  cookieChoice: CookieChoice | null;
  cookieBanner: CookieChoice | null;
  errors: { path: string; items: { field: string; href: string; text: string }[] } | null;
  notice: { path: string; text: string } | null;
};

export type SessionStore = {
  create(): Session;
  get(id: string): Session | undefined;
  save(session: Session): void;
};

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

export function referenceFor(sessionId: string): string {
  return `RL${sessionId.slice(0, 6).toUpperCase()}`;
}
