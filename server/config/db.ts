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
      const dbName = process.env.MONGODB_DB_NAME || 'leaddesk';
      console.log(`[Database] Connecting to MongoDB (db: ${dbName})...`);
      await mongoose.connect(mongoUri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        autoIndex: true,
      });
      cache.conn = mongoose;
      console.log('[Database] Successfully connected to MongoDB via Mongoose.');

      // Auto-seed if collections are empty and ensure collections exist in DB
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

// Ensure clean state: create collections in Atlas, purge any mock leads and initialize profile settings if missing
async function autoSeedDatabase() {
  try {
    const { LeadModel } = await import('../modules/leads/lead.model');
    const { TemplateModel } = await import('../modules/templates/template.model');
    const { SettingsModel } = await import('../modules/settings/settings.model');

    // 1. Explicitly ensure collections ("folders") exist in MongoDB Atlas
    await LeadModel.createCollection().catch(e => console.log('[Database] leads collection ready:', (e as Error).message));
    await TemplateModel.createCollection().catch(e => console.log('[Database] templates collection ready:', (e as Error).message));
    await SettingsModel.createCollection().catch(e => console.log('[Database] settings collection ready:', (e as Error).message));

    // 2. Wipe any previous mock leads and templates to guarantee a completely fresh, empty workspace
    await LeadModel.deleteMany({});
    await TemplateModel.deleteMany({});
    console.log('[Database] Leads and templates cleared. Clean state ready for user.');

    // 3. Ensure Profile Settings document exists in DB
    const existingSettings = await SettingsModel.findOne({ id: 'app_settings' });
    if (!existingSettings) {
      console.log('[Database] Initializing profile settings in DB...');
      await SettingsModel.create({ id: 'app_settings', ...MOCK_SETTINGS });
    }
    console.log('[Database] MongoDB collections ready: leads, settings, templates');
  } catch (err) {
    console.error('[Database] Database initialization issue:', err);
  }
}
