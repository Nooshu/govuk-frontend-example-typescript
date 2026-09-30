/**
 * Process entry for `npm start`. Listens on {@link resolvePort} and prints the URL.
 */

import { resolvePort } from './config.js';
import { startServer } from './app.js';

const running = await startServer(resolvePort());
console.log(`Apply for a fishing rod licence example at ${running.url}`);
