/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel Serverless Function entry point
 */

import { createApp } from '../server/app';
import { connectDatabase } from '../server/config/db';

const app = createApp();

let dbPromise: Promise<boolean> | null = null;
function ensureDb() {
  if (!dbPromise) {
    dbPromise = connectDatabase()
      .then(() => true)
      .catch(err => {
        console.warn('[Vercel Serverless DB Warning]:', err);
        return false;
      });
  }
  return dbPromise;
}

export default async function handler(req: any, res: any) {
  await ensureDb();
  return app(req, res);
}
