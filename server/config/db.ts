/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';
import { MOCK_LEADS, MOCK_TEMPLATES, MOCK_SETTINGS } from '../data/mockData';

// Global connection cache for serverless warm starts
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<boolean> | null } | undefined;
}

const cache = globalThis.mongooseCache || { conn: null, promise: null };
globalThis.mongooseCache = cache;

export const connectDatabase = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('YOUR_MONGODB_URI')) {
    console.log('[Database] No MONGODB_URI provided in environment. Running with unified in-memory mock repository.');
    return false;
  }

  if (cache.promise) {
    return cache.promise;
  }

  cache.promise = (async () => {
    try {
      console.log('[Database] Connecting to MongoDB...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 4000,
        autoIndex: false,
      });
      cache.conn = mongoose;
      console.log('[Database] Successfully connected to MongoDB via Mongoose.');

      // Auto-seed if collections are empty
      await autoSeedDatabase();
      return true;
    } catch (error) {
      console.warn('[Database] MongoDB connection failed. Falling back gracefully to unified mock store:', (error as Error).message);
      cache.promise = null;
      return false;
    }
  })();

  return cache.promise;
};

export const isMongoConnected = (): boolean => mongoose.connection.readyState === 1;

// Ensure clean state: purge any mock leads and initialize profile settings if missing
async function autoSeedDatabase() {
  try {
    const { LeadModel } = await import('../modules/leads/lead.model');
    const { TemplateModel } = await import('../modules/templates/template.model');
    const { SettingsModel } = await import('../modules/settings/settings.model');

    // Wipe any previous mock leads and templates to guarantee a completely fresh, empty workspace
    await LeadModel.deleteMany({});
    await TemplateModel.deleteMany({});
    console.log('[Database] Leads and templates cleared. Clean state ready for user.');

    // Ensure Profile Settings exist in DB
    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      console.log('[Database] Initializing profile settings in DB...');
      await SettingsModel.create({ id: 'app_settings', ...MOCK_SETTINGS });
    }
  } catch (err) {
    console.error('[Database] Database initialization issue:', err);
  }
}
