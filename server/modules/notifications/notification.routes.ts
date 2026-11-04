/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  dispatchNotification,
  sendTestEmail,
  verifySmtp,
  getNotificationLogs,
} from './notification.controller';

const router = Router();

router.post('/dispatch', dispatchNotification);
router.post('/test-email', sendTestEmail);
router.post('/verify-smtp', verifySmtp);
router.get('/history', getNotificationLogs);

export default router;
