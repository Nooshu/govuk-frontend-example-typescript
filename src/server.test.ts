import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { request as httpRequest } from 'node:http';
import { gunzipSync } from 'node:zlib';

import {
  copyNodeHeaders,
  listeningPort,
  requestHost,
  requestMethod,
  requestTarget,
  startServer,
  type App,
} from './app.js';

function raw(
  port: number,
  options: {
    path: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
): Promise<{ status: number; headers: NodeJS.Dict<string | string[]>; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        hostname: '127.0.0.1',
        port,
        path: options.path,
        method: options.method ?? 'GET',
        headers: options.headers,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer | string) => {
          chunks.push(Buffer.from(chunk));
        });
        response.on('end', () => {
          resolve({
            status: response.statusCode ?? 0,
            headers: response.headers,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

describe('node server', () => {
  it('normalises the node request', () => {
    assert.equal(requestMethod(undefined), 'GET');
    assert.equal(requestMethod('POST'), 'POST');
    assert.equal(requestHost(undefined), '127.0.0.1');
    assert.equal(requestHost('localhost'), 'localhost');
    assert.equal(requestHost(['example.test']), 'example.test');
    assert.equal(requestHost([]), '127.0.0.1');
    assert.equal(requestTarget(undefined, 'localhost').pathname, '/');
    assert.equal(requestTarget('', 'localhost').pathname, '/');
    assert.equal(requestTarget('/fees?page=2', 'localhost').search, '?page=2');

    const headers = new Headers();
    copyNodeHeaders({ accept: 'gzip', 'x-multi': ['a', 'b'], skip: undefined }, headers);
    assert.equal(headers.get('accept'), 'gzip');
    assert.equal(headers.get('x-multi'), 'a, b');
    assert.equal(headers.get('skip'), null);

    assert.equal(listeningPort({ port: 9, address: '127.0.0.1', family: 'IPv4' }), 9);
    assert.throws(() => listeningPort(null), /TCP port/);
    assert.throws(() => listeningPort('pipe'), /TCP port/);
  });

  it('serves pages, compresses text, and closes', async () => {
    const running = await startServer();
    try {
      const page = await raw(running.port, { path: '/', headers: { 'accept-encoding': 'gzip' } });
      assert.equal(page.status, 200);
      assert.equal(page.headers['content-encoding'], 'gzip');
      assert.equal(page.headers.vary, 'Accept-Encoding');
      assert.match(gunzipSync(page.body).toString('utf8'), /<h1/);
      const cookie = page.headers['set-cookie'];
      assert.match(Array.isArray(cookie) ? cookie.join(',') : (cookie ?? ''), /rod_session=/);

      const plain = await raw(running.port, { path: '/health' });
      assert.equal(plain.status, 200);
      assert.equal(plain.body.toString('utf8'), 'ok');
      assert.equal(plain.headers['content-encoding'], undefined);
      assert.equal(plain.headers['set-cookie'], undefined);

      const head = await raw(running.port, { path: '/', method: 'HEAD' });
      assert.equal(head.status, 405);
      assert.equal(head.body.length, 0);

      const redirect = await raw(running.port, { path: '/fees/' });
      assert.equal(redirect.status, 303);
      assert.equal(redirect.headers.location, '/fees');
      assert.equal(redirect.headers['content-type'], undefined);
      assert.equal(redirect.body.length, 0);

      const font = await raw(running.port, {
        path: '/assets/fonts/bold-b542beb274-v2.woff2',
        headers: { 'accept-encoding': 'gzip' },
      });
      assert.equal(font.status, 200);
      assert.equal(font.headers['content-type'], 'font/woff2');
      assert.equal(font.headers['content-encoding'], undefined);
      assert.equal(font.headers.vary, undefined);

      const token = /name="csrf" value="([^"]+)"/.exec(gunzipSync(page.body).toString('utf8'))?.[1];
      assert.ok(token);
      const session = Array.isArray(cookie) ? cookie[0]?.split(';')[0] : cookie?.split(';')[0];
      const posted = await raw(running.port, {
        method: 'POST',
        path: '/cookie-choices',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          cookie: session ?? '',
        },
        body: `csrf=${token}&cookies=accept&returnPath=/`,
      });
      assert.equal(posted.status, 303);
    } finally {
      await running.close();
    }
    await assert.rejects(() => running.close());
  });

  it('rejects a port that is already in use', async () => {
    const running = await startServer(0);
    try {
      await assert.rejects(() => startServer(running.port));
    } finally {
      await running.close();
    }
  });

  it('compresses responses by content type', async () => {
    const app: App = {
      async handle(request) {
        const path = new URL(request.url).pathname;
        if (path === '/js') {
          return new Response('var x = 1', {
            headers: { 'content-type': 'application/javascript' },
          });
        }
        if (path === '/json')
          return new Response('{}', { headers: { 'content-type': 'application/json' } });
        if (path === '/bin') {
          return new Response(Uint8Array.from([1, 2, 3]), {
            headers: { 'content-type': 'application/octet-stream' },
          });
        }
        return new Response(null, { status: 204 });
      },
    };
    const running = await startServer(0, app);
    try {
      const script = await raw(running.port, {
        path: '/js',
        headers: { 'accept-encoding': 'gzip' },
      });
      assert.equal(script.headers['content-encoding'], 'gzip');
      assert.equal(gunzipSync(script.body).toString('utf8'), 'var x = 1');
      assert.equal(script.headers.vary, 'Accept-Encoding');

      const json = await raw(running.port, { path: '/json' });
      assert.equal(json.headers['content-encoding'], undefined);
      assert.equal(json.body.toString('utf8'), '{}');
      assert.equal(json.headers.vary, 'Accept-Encoding');

      const binary = await raw(running.port, {
        path: '/bin',
        headers: { 'accept-encoding': 'gzip' },
      });
      assert.equal(binary.headers['content-encoding'], undefined);
      assert.equal(binary.headers.vary, undefined);
      assert.deepEqual([...binary.body], [1, 2, 3]);

      const empty = await raw(running.port, { path: '/empty' });
      assert.equal(empty.status, 204);
      assert.equal(empty.body.length, 0);
      assert.equal(empty.headers['content-type'], undefined);
    } finally {
      await running.close();
    }
  });
});
