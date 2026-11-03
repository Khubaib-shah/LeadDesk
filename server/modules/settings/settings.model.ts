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
    userName: { type: String, default: 'Creator' },
    userRole: { type: String, default: 'Software Engineer & Creator' },
    userEmail: { type: String, default: '' },
    userPhone: { type: String, default: '' },
    userBio: { type: String, default: 'Building and shipping projects.' },
    userSignature: { type: String, default: 'Best regards,\nCreator' },
    instagramHandle: { type: String, default: '' },
    tiktokHandle: { type: String, default: '' },
    youtubeHandle: { type: String, default: '' },
    websiteUrl: { type: String, default: '' },
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
          userName: doc.userName || 'Creator',
          userRole: doc.userRole || '',
          userEmail: doc.userEmail || '',
          userPhone: doc.userPhone || '',
          userBio: doc.userBio || '',
          userSignature: doc.userSignature || '',
          instagramHandle: doc.instagramHandle || '',
          tiktokHandle: doc.tiktokHandle || '',
          youtubeHandle: doc.youtubeHandle || '',
          websiteUrl: doc.websiteUrl || '',
          defaultCountryCode: doc.defaultCountryCode || 'US',
          defaultCurrency: doc.defaultCurrency || 'USD',
          defaultFollowUpTime: doc.defaultFollowUpTime || '10:00',
          cadenceDays: doc.cadenceDays || [2, 5, 10],
          goingColdDays: doc.goingColdDays || 7,
          theme: doc.theme || 'light',
          reducedMotion: doc.reducedMotion || false,
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
        userName: updated.userName || 'Creator',
        userRole: updated.userRole || '',
        userEmail: updated.userEmail || '',
        userPhone: updated.userPhone || '',
        userBio: updated.userBio || '',
        userSignature: updated.userSignature || '',
        instagramHandle: updated.instagramHandle || '',
        tiktokHandle: updated.tiktokHandle || '',
        youtubeHandle: updated.youtubeHandle || '',
        websiteUrl: updated.websiteUrl || '',
        defaultCountryCode: updated.defaultCountryCode || 'US',
        defaultCurrency: updated.defaultCurrency || 'USD',
        defaultFollowUpTime: updated.defaultFollowUpTime || '10:00',
        cadenceDays: updated.cadenceDays || [2, 5, 10],
        goingColdDays: updated.goingColdDays || 7,
        theme: updated.theme || 'light',
        reducedMotion: updated.reducedMotion || false,
      };
    }
    inMemorySettings = { ...inMemorySettings, ...updates };
    return { ...inMemorySettings };
  }
}
