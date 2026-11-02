/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  bulkDeleteLeads,
  logInteraction,
  resetToMock,
} from './lead.controller';

const router = Router();

router.get('/', getLeads);
router.post('/', createLead);
router.post('/bulk-delete', bulkDeleteLeads);
router.post('/reset', resetToMock);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/interactions', logInteraction);

export default router;
