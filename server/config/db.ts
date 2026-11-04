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
      let targetDbName = process.env.MONGODB_DB_NAME;
      if (!targetDbName) {
        try {
          const parsed = new URL(mongoUri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
          const path = parsed.pathname.replace(/^\//, '').split('?')[0];
          if (path && path.length > 0) {
            targetDbName = path;
          }
        } catch {
          // ignore
        }
      }
      if (!targetDbName) {
        targetDbName = 'leaddesk';
      }

      console.log(`[Database] Connecting to MongoDB (target database: ${targetDbName})...`);
      await mongoose.connect(mongoUri, {
        dbName: targetDbName,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        autoIndex: true,
      });
      cache.conn = mongoose;
      console.log(`[Database] Successfully connected to MongoDB database "${targetDbName}".`);

      // Ensure collections exist and seed settings/templates if completely fresh
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

// Ensure collections exist and initialize default settings and templates if missing
async function autoSeedDatabase() {
  try {
    const { LeadModel } = await import('../modules/leads/lead.model');
    const { TemplateModel } = await import('../modules/templates/template.model');
    const { SettingsModel } = await import('../modules/settings/settings.model');

    // 1. Explicitly ensure collections ("folders") exist in MongoDB Atlas
    await LeadModel.createCollection().catch(e => console.log('[Database] leads collection ready:', (e as Error).message));
    await TemplateModel.createCollection().catch(e => console.log('[Database] templates collection ready:', (e as Error).message));
    await SettingsModel.createCollection().catch(e => console.log('[Database] settings collection ready:', (e as Error).message));

    // Note: Never wipe or delete user leads on startup! Existing leads are preserved safely.

    // 2. Ensure Profile Settings document exists in DB
    const existingSettings = await SettingsModel.findOne({ id: 'app_settings' });
    if (!existingSettings) {
      console.log('[Database] Initializing profile settings in DB...');
      await SettingsModel.create({ id: 'app_settings', ...MOCK_SETTINGS });
    }

    // 3. Ensure outreach templates exist if collection is empty
    const templatesCount = await TemplateModel.countDocuments();
    if (templatesCount === 0 && MOCK_TEMPLATES.length > 0) {
      console.log('[Database] Seeding default outreach templates...');
      await TemplateModel.insertMany(MOCK_TEMPLATES).catch(() => {});
    }

    const currentLeadsCount = await LeadModel.countDocuments();
    console.log(`[Database] Collections ready. Current leads in database: ${currentLeadsCount}`);
  } catch (err) {
    console.error('[Database] Database initialization issue:', err);
  }
}
