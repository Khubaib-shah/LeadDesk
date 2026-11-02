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

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health and Status Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      database: isMongoConnected() ? 'mongodb' : 'mock_memory',
      timestamp: new Date().toISOString(),
    });
  });

  // Feature Modular Routes
  app.use('/api/leads', leadRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Error Handling
  app.use(errorHandler);

  return app;
};
