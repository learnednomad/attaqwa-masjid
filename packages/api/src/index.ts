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
import { prayerTimesAdminRoutes } from './routes/prayer-times-admin.js';
import { authRoutes } from './routes/auth.js';
import educationRoutes from './routes/education.js';
import monitoringRoutes from './routes/monitoring.js';
import { notificationRoutes } from './routes/notifications.js';
import { donationRoutes } from './routes/donations.js';
import { enhancedLogger, islamicMetrics, errorTracker, performanceMonitor, healthCheck } from './middleware/logging.js';
import { apiVersioning, mobileCompression, fieldSelection, mobilePagination, mobileCache, mobileFormat, mobileRateLimit, mobileErrorHandler, networkAwareOptimization } from './middleware/mobile.js';
import { createRouteProtection } from './config/route-protection.js';
import educationAgeFilteringRoutes from './routes/education-age-filtering.js';
import islamicEducationCalendarRoutes from './routes/islamic-education-calendar.js';
import quranMemorizationRoutes from './routes/quran-memorization.js';
import halaqahSessionRoutes from './routes/halaqah-sessions.js';
import seerahCourseRoutes from './routes/seerah-courses.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', timing());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001', // Next.js development port
    'http://localhost:3002', // Alternative development port
    'http://localhost:8081', // Expo mobile development
    'http://localhost:19000', // Expo mobile development
    'http://localhost:19002', // Expo mobile development
    'http://localhost:19006', // Expo mobile development
  ],
  allowHeaders: ['Content-Type', 'Authorization', 'API-Version', 'Save-Data', 'Network-Information', 'Connection-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  exposeHeaders: ['API-Version', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-Fields-Applied']
}));

// Mobile optimization middleware
app.use('*', apiVersioning());
app.use('*', mobileCompression());
app.use('*', mobileRateLimit());
app.use('*', networkAwareOptimization());
app.use('*', mobileCache(300)); // 5 minute default cache
app.use('*', mobilePagination());
app.use('*', fieldSelection());
app.use('*', mobileFormat());
app.use('*', mobileErrorHandler());

// Enhanced monitoring middleware
app.use('*', enhancedLogger);
app.use('*', islamicMetrics);
app.use('*', errorTracker);
app.use('*', performanceMonitor);

// Global route protection based on configuration
app.use('/api/*', createRouteProtection());

// Enhanced health check with Islamic features
app.get('/health', healthCheck);

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/announcements', announcementRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/prayer-times', prayerTimeRoutes);
app.route('/api/admin/prayer-times', prayerTimesAdminRoutes);
app.route('/api/education', educationRoutes);
app.route('/api/education-age', educationAgeFilteringRoutes);
app.route('/api/islamic-calendar', islamicEducationCalendarRoutes);
app.route('/api/quran', quranMemorizationRoutes);
app.route('/api/halaqah', halaqahSessionRoutes);
app.route('/api/seerah', seerahCourseRoutes);
app.route('/api/monitoring', monitoringRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/donations', donationRoutes);

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