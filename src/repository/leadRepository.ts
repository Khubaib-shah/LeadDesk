/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, LeadTemplate, AppSettings, Interaction } from '../types';

export interface LeadRepository {
  getAllLeads(): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | null>;
  createLead(data: Partial<Lead>): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  logInteraction(
    leadId: string,
    interaction: Omit<Interaction, 'id'>,
    nextFollowUpAt?: string
  ): Promise<Lead>;
  clearAllLeads(): Promise<void>;
  seedInitialData(force?: boolean): Promise<void>;

  // Templates
  getAllTemplates(): Promise<LeadTemplate[]>;
  createTemplate(template: Omit<LeadTemplate, 'id'>): Promise<LeadTemplate>;
  updateTemplate(id: string, updates: Partial<LeadTemplate>): Promise<LeadTemplate>;

  // Settings
  getSettings(): Promise<AppSettings>;
  updateSettings(updates: Partial<AppSettings>): Promise<AppSettings>;
}
