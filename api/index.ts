/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel Serverless Function entry point
 */

import { createApp } from '../server/app';
import { connectDatabase } from '../server/config/db';

let cachedApp: any = null;

async function getHandler() {
  if (!cachedApp) {
    try {
      await connectDatabase();
    } catch (err) {
      console.warn('[Vercel Serverless] DB connection fallback:', err);
    }
    cachedApp = createApp();
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const app = await getHandler();
  return app(req, res);
}
