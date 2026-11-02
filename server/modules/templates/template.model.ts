/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from 'mongoose';
import { LeadTemplate } from './template.types';
import { isMongoConnected } from '../../config/db';
import { MOCK_TEMPLATES } from '../../data/mockData';

export interface TemplateDocument extends Document, Omit<LeadTemplate, 'id'> {
  id: string;
}

export const templateMongooseSchema = new Schema<TemplateDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['first_reply', 'follow_up', 'proposal', 'nudge', 'thank_you', 'close'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['WhatsApp', 'Email'],
      default: 'WhatsApp',
    },
    subject: { type: String },
    body: { type: String, required: true },
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

export const TemplateModel = mongoose.models.Template || mongoose.model<TemplateDocument>('Template', templateMongooseSchema);

// In-Memory Fallback
let inMemoryTemplates: LeadTemplate[] = JSON.parse(JSON.stringify(MOCK_TEMPLATES));

export class TemplateRepository {
  static async getAll(): Promise<LeadTemplate[]> {
    if (isMongoConnected()) {
      const docs = await TemplateModel.find().lean();
      return docs.map(d => ({ ...d, id: d.id || (d as unknown as { _id: string })._id?.toString() }));
    }
    return [...inMemoryTemplates];
  }

  static async getById(id: string): Promise<LeadTemplate | null> {
    if (isMongoConnected()) {
      const doc = await TemplateModel.findOne({ id }).lean();
      if (!doc) return null;
      return { ...doc, id: doc.id || (doc as unknown as { _id: string })._id?.toString() };
    }
    const found = inMemoryTemplates.find(t => t.id === id);
    return found ? { ...found } : null;
  }

  static async create(templateData: Omit<LeadTemplate, 'id'> & { id?: string }): Promise<LeadTemplate> {
    const id = templateData.id || `tpl-${Date.now()}`;
    const newTemplate: LeadTemplate = {
      id,
      title: templateData.title,
      category: templateData.category,
      channel: templateData.channel,
      subject: templateData.subject,
      body: templateData.body,
    };

    if (isMongoConnected()) {
      await TemplateModel.create(newTemplate);
    } else {
      inMemoryTemplates.push(newTemplate);
    }
    return newTemplate;
  }

  static async update(id: string, updates: Partial<LeadTemplate>): Promise<LeadTemplate | null> {
    if (isMongoConnected()) {
      const updated = await TemplateModel.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true }
      ).lean();
      if (!updated) return null;
      return { ...updated, id: updated.id || (updated as unknown as { _id: string })._id?.toString() };
    }

    const idx = inMemoryTemplates.findIndex(t => t.id === id);
    if (idx === -1) return null;
    inMemoryTemplates[idx] = { ...inMemoryTemplates[idx], ...updates };
    return { ...inMemoryTemplates[idx] };
  }

  static async delete(id: string): Promise<boolean> {
    if (isMongoConnected()) {
      const res = await TemplateModel.deleteOne({ id });
      return res.deletedCount > 0;
    }
    const lenBefore = inMemoryTemplates.length;
    inMemoryTemplates = inMemoryTemplates.filter(t => t.id !== id);
    return inMemoryTemplates.length < lenBefore;
  }
}
