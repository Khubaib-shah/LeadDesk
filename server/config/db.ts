/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';
import { MOCK_LEADS, MOCK_TEMPLATES, MOCK_SETTINGS } from '../data/mockData';

let isConnected = false;

export const connectDatabase = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('YOUR_MONGODB_URI')) {
    console.log('[Database] No MONGODB_URI provided in environment. Running with unified in-memory mock repository.');
    isConnected = false;
    return false;
  }

  try {
    console.log('[Database] Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    isConnected = true;
    console.log('[Database] Successfully connected to MongoDB via Mongoose.');

    // Auto-seed if collections are empty
    await autoSeedDatabase();
    return true;
  } catch (error) {
    console.warn('[Database] MongoDB connection failed. Falling back gracefully to unified mock store:', (error as Error).message);
    isConnected = false;
    return false;
  }
};

export const isMongoConnected = (): boolean => isConnected;

// Dynamic import to avoid circular dependencies during initialization
async function autoSeedDatabase() {
  try {
    const { LeadModel } = await import('../modules/leads/lead.model');
    const { TemplateModel } = await import('../modules/templates/template.model');
    const { SettingsModel } = await import('../modules/settings/settings.model');

    const leadCount = await LeadModel.countDocuments();
    if (leadCount === 0) {
      console.log('[Database] Auto-seeding initial leads from unified mockData...');
      await LeadModel.insertMany(MOCK_LEADS);
      console.log(`[Database] Seeded ${MOCK_LEADS.length} leads successfully.`);
    }

    const tplCount = await TemplateModel.countDocuments();
    if (tplCount === 0) {
      console.log('[Database] Auto-seeding initial templates from unified mockData...');
      await TemplateModel.insertMany(MOCK_TEMPLATES);
      console.log(`[Database] Seeded ${MOCK_TEMPLATES.length} templates successfully.`);
    }

    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      console.log('[Database] Auto-seeding initial settings from unified mockData...');
      await SettingsModel.create({ id: 'app_settings', ...MOCK_SETTINGS });
    }
  } catch (err) {
    console.error('[Database] Auto-seed check encountered an issue:', err);
  }
}
