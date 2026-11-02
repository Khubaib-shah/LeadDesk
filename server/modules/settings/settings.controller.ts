/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { SettingsRepository } from './settings.model';

export const getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await SettingsRepository.get();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updates = req.body;
    const updated = await SettingsRepository.update(updates);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
