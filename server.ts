/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createApp } from './server/app';
import { connectDatabase } from './server/config/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  // 1. Initialize Database / Unified Mock Store
  await connectDatabase();

  // 2. Initialize Modular Express App
  const app = createApp();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LeadDesk Server] Listening on http://0.0.0.0:${PORT} (Mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('[LeadDesk Server] Fatal error during startup:', err);
  process.exit(1);
});
