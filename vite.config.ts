import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { GET as fetchText } from './api/fetch-text';

// Serves the Vercel function locally, so `npm run dev` and `npm run preview` work without the Vercel CLI.
function localApi(): Plugin {
  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.end();
      return;
    }
    const response = await fetchText(new Request(new URL(req.url ?? '/', 'http://localhost')));
    res.statusCode = response.status;
    response.headers.forEach((value, name) => res.setHeader(name, value));
    res.end(await response.text());
  }

  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/fetch-text', (req, res) => void handle(req, res));
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/fetch-text', (req, res) => void handle(req, res));
    },
  };
}

export default defineConfig({
  // GitHub Pages serves the site under /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [localApi()],
  test: {
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
});
