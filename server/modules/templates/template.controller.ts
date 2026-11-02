/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { TemplateRepository } from './template.model';

export const getTemplates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const templates = await TemplateRepository.getAll();
    res.json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    next(error);
  }
};

export const getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const template = await TemplateRepository.getById(id);
    if (!template) {
      res.status(404).json({ success: false, message: `Template ${id} not found.` });
      return;
    }
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, category, channel, body, subject } = req.body;
    if (!title || !category || !body) {
      res.status(400).json({ success: false, message: 'Title, category, and body are required.' });
      return;
    }

    const created = await TemplateRepository.create({
      title,
      category,
      channel: channel || 'WhatsApp',
      body,
      subject,
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await TemplateRepository.update(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: `Template ${id} not found.` });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await TemplateRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: `Template ${id} not found.` });
      return;
    }
    res.json({ success: true, message: `Template ${id} deleted.` });
  } catch (error) {
    next(error);
  }
};
