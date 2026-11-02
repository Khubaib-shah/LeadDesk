/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from './template.controller';

const router = Router();

router.get('/', getTemplates);
router.post('/', createTemplate);
router.get('/:id', getTemplateById);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
