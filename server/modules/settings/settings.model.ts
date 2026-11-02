/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from 'mongoose';
import { AppSettings } from '../leads/lead.types';
import { isMongoConnected } from '../../config/db';
import { MOCK_SETTINGS } from '../../data/mockData';

export interface SettingsDocument extends Document, AppSettings {
  id: string;
}

export const settingsMongooseSchema = new Schema<SettingsDocument>(
  {
    id: { type: String, default: 'app_settings', unique: true },
    userName: { type: String, default: 'Zubair' },
    userSignature: { type: String, default: 'Best regards,\nZubair' },
    defaultCountryCode: { type: String, default: 'US' },
    defaultCurrency: { type: String, default: 'USD' },
    defaultFollowUpTime: { type: String, default: '10:00' },
    cadenceDays: { type: [Number], default: [2, 5, 10] },
    goingColdDays: { type: Number, default: 7 },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    reducedMotion: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete (ret as Record<string, unknown>)._id;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

export const SettingsModel = mongoose.models.Settings || mongoose.model<SettingsDocument>('Settings', settingsMongooseSchema);

// In-Memory Fallback
let inMemorySettings: AppSettings = { ...MOCK_SETTINGS };

export class SettingsRepository {
  static async get(): Promise<AppSettings> {
    if (isMongoConnected()) {
      const doc = await SettingsModel.findOne({ id: 'app_settings' }).lean();
      if (doc) {
        return {
          userName: doc.userName,
          userSignature: doc.userSignature,
          defaultCountryCode: doc.defaultCountryCode,
          defaultCurrency: doc.defaultCurrency,
          defaultFollowUpTime: doc.defaultFollowUpTime,
          cadenceDays: doc.cadenceDays,
          goingColdDays: doc.goingColdDays,
          theme: doc.theme,
          reducedMotion: doc.reducedMotion,
        };
      }
    }
    return { ...inMemorySettings };
  }

  static async update(updates: Partial<AppSettings>): Promise<AppSettings> {
    if (isMongoConnected()) {
      const updated = await SettingsModel.findOneAndUpdate(
        { id: 'app_settings' },
        { $set: updates },
        { new: true, upsert: true }
      ).lean();
      return {
        userName: updated.userName,
        userSignature: updated.userSignature,
        defaultCountryCode: updated.defaultCountryCode,
        defaultCurrency: updated.defaultCurrency,
        defaultFollowUpTime: updated.defaultFollowUpTime,
        cadenceDays: updated.cadenceDays,
        goingColdDays: updated.goingColdDays,
        theme: updated.theme,
        reducedMotion: updated.reducedMotion,
      };
    }
    inMemorySettings = { ...inMemorySettings, ...updates };
    return { ...inMemorySettings };
  }
}
