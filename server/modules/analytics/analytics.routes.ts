/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { getAnalyticsSummary } from './analytics.controller';

const router = Router();

router.get('/summary', getAnalyticsSummary);

export default router;
