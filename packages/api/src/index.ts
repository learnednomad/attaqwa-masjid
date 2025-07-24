import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import 'dotenv/config';

import { announcementRoutes } from './routes/announcements.js';
import { eventRoutes } from './routes/events.js';
import { prayerTimeRoutes } from './routes/prayer-times.js';
import { authRoutes } from './routes/auth.js';
import educationRoutes from './routes/education.js';
import monitoringRoutes from './routes/monitoring.js';
import { enhancedLogger, islamicMetrics, errorTracker, performanceMonitor, healthCheck } from './middleware/logging.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', timing());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3002', // Alternative development port
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Enhanced monitoring middleware
app.use('*', enhancedLogger);
app.use('*', islamicMetrics);
app.use('*', errorTracker);
app.use('*', performanceMonitor);

// Enhanced health check with Islamic features
app.get('/health', healthCheck);

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/announcements', announcementRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/prayer-times', prayerTimeRoutes);
app.route('/api/education', educationRoutes);
app.route('/api/monitoring', monitoringRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  }, 500);
});

const port = parseInt(process.env.PORT || '3001', 10);

console.log(`🚀 API Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});