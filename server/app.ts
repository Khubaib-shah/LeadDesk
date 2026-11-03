/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import leadRoutes from './modules/leads/lead.routes';
import templateRoutes from './modules/templates/template.routes';
import settingsRoutes from './modules/settings/settings.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import { errorHandler } from './middleware/errorHandler';
import { isMongoConnected } from './config/db';

import cors from 'cors';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health and Status Endpoint
  app.get(['/api/health', '/health'], (_req, res) => {
    res.json({
      status: 'healthy',
      database: isMongoConnected() ? 'mongodb' : 'mock_memory',
      timestamp: new Date().toISOString(),
    });
  });

  // Feature Modular Routes (support both /api/* and stripped /* on serverless)
  app.use(['/api/leads', '/leads'], leadRoutes);
  app.use(['/api/templates', '/templates'], templateRoutes);
  app.use(['/api/settings', '/settings'], settingsRoutes);
  app.use(['/api/analytics', '/analytics'], analyticsRoutes);

  // Error Handling
  app.use(errorHandler);

  return app;
};
