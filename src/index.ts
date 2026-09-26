/**
 * Public entry for this TypeScript example.
 *
 * Re-exports the Frontend pin, the Nunjucks macro renderer, and the HTTP app.
 */

export { FRONTEND_VERSION, demosEnabledFromEnv, resolvePort } from './config.js';
export { renderComponent } from './components/render.js';
export { macroNameFor } from './components/names.js';
export { listComponentNames, loadComponentFixtures } from './components/fixtures.js';
export { createApp, startServer } from './app.js';
