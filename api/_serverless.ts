/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel Serverless Function entry point
 */

import { createApp } from '../server/app';
import { connectDatabase } from '../server/config/db';

const app = createApp();

let dbPromise: Promise<boolean> | null = null;
const ensureDb = () => {
  if (!dbPromise) {
    dbPromise = connectDatabase().catch(err => {
      console.warn('[Vercel Serverless DB Warning]:', err);
      return false;
    });
  }
  return dbPromise;
};

export default function handler(req: any, res: any) {
  return new Promise<void>((resolve, reject) => {
    // Keep serverless function alive until response is finished
    res.on('finish', () => resolve());
    res.on('close', () => resolve());
    res.on('error', (err: any) => reject(err));

    ensureDb()
      .then(() => {
        app(req, res, (err: any) => {
          if (err) {
            console.error('[Vercel Serverless Express Error]:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: (err as Error).message || 'Server error' });
            }
            return resolve();
          }
          if (!res.headersSent) {
            res.status(404).json({ error: 'Endpoint not found' });
            return resolve();
          }
        });
      })
      .catch(err => {
        console.error('[Vercel Serverless Handler Error]:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: (err as Error).message || 'Internal server error' });
        }
        resolve();
      });
  });
}
