/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose, { Schema, Document } from 'mongoose';
import { Lead, Interaction } from './lead.types';
import { isMongoConnected } from '../../config/db';
import { MOCK_LEADS } from '../../data/mockData';

// Interaction Schema
const InteractionSchema = new Schema<Interaction>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['WhatsApp', 'Email', 'Call', 'Meeting', 'Note'],
      required: true,
    },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
    channel: { type: String },
  },
  { _id: false }
);

// Lead Schema
export interface LeadDocument extends Document, Omit<Lead, 'id'> {
  id: string;
}

export const leadMongooseSchema = new Schema<LeadDocument>(
  {
    id: { type: String, index: true },
    fullName: { type: String, default: '' },
    whatsappNumber: { type: String, default: '', index: true },
    altPhone: { type: String },
    email: { type: String },
    instagramHandle: { type: String },
    tiktokHandle: { type: String },
    company: { type: String },
    city: { type: String },
    country: { type: String },

    source: {
      type: String,
      enum: ['WhatsApp', 'TikTok', 'Instagram', 'YouTube', 'LinkedIn', 'X', 'Facebook', 'Email', 'Referral', 'Website', 'Other'],
      default: 'WhatsApp',
      index: true,
    },
    sourceDetail: { type: String },
    referredBy: { type: String },
    firstContactAt: { type: String, required: true },

    purpose: {
      type: String,
      enum: ['Software project', 'Consultation or mentoring', 'Course or coaching', 'Collaboration or sponsorship', 'Job or hiring', 'Question or support', 'Other'],
      default: 'Software project',
    },
    interestedIn: { type: String },
    estimatedValue: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    deadline: { type: String },

    summary: { type: String, default: '' },
    interactions: { type: [InteractionSchema], default: [] },

    stage: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal sent', 'Negotiation', 'Won', 'Lost'],
      default: 'New',
      index: true,
    },
    temperature: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold'],
      default: 'Warm',
      index: true,
    },
    lostReason: { type: String },
    wonValue: { type: Number },
    closedAt: { type: String },

    nextFollowUpAt: { type: String, index: true },
    followUpChannel: {
      type: String,
      enum: ['WhatsApp', 'Email', 'Call', 'DM'],
      default: 'WhatsApp',
    },
    followUpNote: { type: String },
    reminder: {
      type: String,
      enum: ['at_time', '1h_before', '1d_before'],
      default: 'at_time',
    },
    lastContactedAt: { type: String, required: true },
    followUpCount: { type: Number, default: 0 },

    tags: { type: [String], default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    archived: { type: Boolean, default: false, index: true },
    avatarColor: { type: String, default: 'mint' },
  },
  {
    timestamps: false,
    strict: false,
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

// Indexes for query performance
leadMongooseSchema.index({ stage: 1, nextFollowUpAt: 1 });
leadMongooseSchema.index({ archived: 1, temperature: 1 });

export const LeadModel = mongoose.models.Lead || mongoose.model<LeadDocument>('Lead', leadMongooseSchema);

// In-Memory Fallback State (Initialized with unified mockData)
let inMemoryLeads: Lead[] = JSON.parse(JSON.stringify(MOCK_LEADS));

// Helper to normalize doc from MongoDB
const normalizeLeadDoc = (d: any): Lead => ({
  ...d,
  id: d.id || d._id?.toString() || `lead-${Date.now()}`,
  fullName: d.fullName || d.name || 'Unnamed Lead',
  whatsappNumber: d.whatsappNumber || d.phone || d.mobile || '',
  altPhone: d.altPhone,
  email: d.email || '',
  instagramHandle: d.instagramHandle,
  tiktokHandle: d.tiktokHandle,
  company: d.company,
  city: d.city,
  country: d.country,
  source: d.source || 'WhatsApp',
  sourceDetail: d.sourceDetail,
  referredBy: d.referredBy,
  firstContactAt: d.firstContactAt || d.createdAt || new Date().toISOString(),
  purpose: d.purpose || d.subject || 'Software project',
  interestedIn: d.interestedIn,
  estimatedValue: Number(d.estimatedValue || d.value || 0),
  currency: d.currency || 'USD',
  deadline: d.deadline,
  summary: d.summary || '',
  interactions: Array.isArray(d.interactions) ? d.interactions : [],
  stage: d.stage || d.status || 'New',
  temperature: d.temperature || 'Warm',
  lostReason: d.lostReason,
  wonValue: d.wonValue !== undefined ? Number(d.wonValue) : undefined,
  closedAt: d.closedAt,
  nextFollowUpAt: d.nextFollowUpAt,
  followUpChannel: d.followUpChannel || 'WhatsApp',
  followUpNote: d.followUpNote,
  reminder: d.reminder || 'at_time',
  lastContactedAt: d.lastContactedAt || d.updatedAt || new Date().toISOString(),
  followUpCount: Number(d.followUpCount || 0),
  tags: Array.isArray(d.tags) ? d.tags : [],
  createdAt: d.createdAt || d.created_at || (d._id?.getTimestamp ? d._id.getTimestamp().toISOString() : new Date().toISOString()),
  updatedAt: d.updatedAt || d.updated_at || new Date().toISOString(),
  archived: Boolean(d.archived),
  avatarColor: d.avatarColor || 'mint',
});

// Unified Repository Pattern (Swaps between real MongoDB and in-memory mock seamlessly)
export class LeadRepository {
  static async getAll(): Promise<Lead[]> {
    if (isMongoConnected()) {
      const docs = await LeadModel.find().lean();
      return docs.map(normalizeLeadDoc);
    }
    return [...inMemoryLeads];
  }

  static async getById(id: string): Promise<Lead | null> {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ id }, { _id: id }] }
        : { id };
      const doc = await LeadModel.findOne(query).lean();
      if (!doc) return null;
      return normalizeLeadDoc(doc);
    }
    const found = inMemoryLeads.find(l => l.id === id);
    return found ? { ...found } : null;
  }

  static async create(leadData: Partial<Lead>): Promise<Lead> {
    const now = new Date().toISOString();
    const id = leadData.id || `lead-${Date.now()}`;
    const newLead: Lead = {
      id,
      fullName: leadData.fullName || '',
      whatsappNumber: leadData.whatsappNumber || '',
      altPhone: leadData.altPhone,
      email: leadData.email,
      instagramHandle: leadData.instagramHandle,
      tiktokHandle: leadData.tiktokHandle,
      company: leadData.company,
      city: leadData.city,
      country: leadData.country,
      source: leadData.source || 'WhatsApp',
      sourceDetail: leadData.sourceDetail,
      referredBy: leadData.referredBy,
      firstContactAt: leadData.firstContactAt || now,
      purpose: leadData.purpose || 'Software project',
      interestedIn: leadData.interestedIn,
      estimatedValue: leadData.estimatedValue || 0,
      currency: leadData.currency || 'USD',
      deadline: leadData.deadline,
      summary: leadData.summary || '',
      interactions: leadData.interactions || [],
      stage: leadData.stage || 'New',
      temperature: leadData.temperature || 'Warm',
      lostReason: leadData.lostReason,
      wonValue: leadData.wonValue,
      closedAt: leadData.closedAt,
      nextFollowUpAt: leadData.nextFollowUpAt,
      followUpChannel: leadData.followUpChannel || 'WhatsApp',
      followUpNote: leadData.followUpNote,
      reminder: leadData.reminder || 'at_time',
      lastContactedAt: leadData.lastContactedAt || now,
      followUpCount: leadData.followUpCount || 0,
      tags: leadData.tags || [],
      createdAt: leadData.createdAt || now,
      updatedAt: now,
      archived: leadData.archived || false,
      avatarColor: leadData.avatarColor || 'mint',
    };

    if (isMongoConnected()) {
      await LeadModel.create(newLead);
    } else {
      inMemoryLeads.unshift(newLead);
    }
    return newLead;
  }

  static async update(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const updatedAt = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt };

    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ id }, { _id: id }] }
        : { id };
      const updated = await LeadModel.findOneAndUpdate(
        query,
        { $set: cleanUpdates },
        { new: true }
      ).lean();
      if (!updated) return null;
      return normalizeLeadDoc(updated);
    }

    const index = inMemoryLeads.findIndex(l => l.id === id);
    if (index === -1) return null;
    inMemoryLeads[index] = { ...inMemoryLeads[index], ...cleanUpdates };
    return { ...inMemoryLeads[index] };
  }

  static async delete(id: string): Promise<boolean> {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ id }, { _id: id }] }
        : { id };
      const res = await LeadModel.deleteOne(query);
      return res.deletedCount > 0;
    }
    const initialLen = inMemoryLeads.length;
    inMemoryLeads = inMemoryLeads.filter(l => l.id !== id);
    return inMemoryLeads.length < initialLen;
  }

  static async bulkDelete(ids: string[]): Promise<number> {
    if (isMongoConnected()) {
      const res = await LeadModel.deleteMany({ id: { $in: ids } });
      return res.deletedCount || 0;
    }
    const countBefore = inMemoryLeads.length;
    inMemoryLeads = inMemoryLeads.filter(l => !ids.includes(l.id));
    return countBefore - inMemoryLeads.length;
  }

  static async logInteraction(
    leadId: string,
    interaction: Omit<Interaction, 'id'>,
    nextFollowUpAt?: string
  ): Promise<Lead | null> {
    const lead = await this.getById(leadId);
    if (!lead) return null;

    const newInteraction: Interaction = {
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: interaction.type,
      text: interaction.text,
      timestamp: interaction.timestamp || new Date().toISOString(),
      channel: interaction.channel,
    };

    const updates: Partial<Lead> = {
      interactions: [...lead.interactions, newInteraction],
      lastContactedAt: newInteraction.timestamp,
      followUpCount: (lead.followUpCount || 0) + 1,
    };

    if (nextFollowUpAt !== undefined) {
      updates.nextFollowUpAt = nextFollowUpAt;
    }

    return this.update(leadId, updates);
  }

  static async resetToMock(): Promise<void> {
    if (isMongoConnected()) {
      await LeadModel.deleteMany({});
      await LeadModel.insertMany(MOCK_LEADS);
    }
    inMemoryLeads = JSON.parse(JSON.stringify(MOCK_LEADS));
  }
}
