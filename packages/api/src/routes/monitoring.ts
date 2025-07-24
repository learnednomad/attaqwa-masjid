import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { requireAuth, requireRole } from '../middleware/auth';

const app = new Hono();

// Schema for client events
const clientEventSchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'debug']),
  event: z.string(),
  timestamp: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
  data: z.record(z.any()).optional(),
  islamicContext: z.object({
    hijriDate: z.string().optional(),
    prayerTimeContext: z.string().optional(),
    currentPrayer: z.string().optional(),
    qiblaDirection: z.number().optional(),
  }).optional(),
});

const clientEventsPayloadSchema = z.object({
  events: z.array(clientEventSchema),
  metadata: z.object({
    userAgent: z.string(),
    screen: z.object({
      width: z.number(),
      height: z.number(),
    }),
    language: z.string(),
    timezone: z.string(),
  }).optional(),
});

// Receive client-side events
app.post('/client-events', zValidator('json', clientEventsPayloadSchema), async (c) => {
  try {
    const { events, metadata } = c.req.valid('json');
    const ip = c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'unknown';
    
    // Process each event
    for (const event of events) {
      // Enhanced server-side logging with Islamic context
      console.log(JSON.stringify({
        level: event.level,
        timestamp: new Date().toISOString(),
        type: 'client_event',
        clientEvent: event.event,
        sessionId: event.sessionId,
        userId: event.userId,
        data: event.data,
        islamicContext: event.islamicContext,
        metadata: {
          ...metadata,
          ip,
          serverTimestamp: new Date().toISOString(),
        },
        // Server-side Islamic context
        serverIslamicContext: {
          hijriDate: getServerHijriDate(),
          prayerTimeWindow: getCurrentPrayerTimeWindow(),
          serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }));
      
      // Process specific Islamic events
      await processIslamicEvent(event);
      
      // Store in database for analytics (if needed)
      // await storeClientEvent(event, metadata);
    }
    
    return c.json({ success: true, processed: events.length });
  } catch (error) {
    console.error('Error processing client events:', error);
    return c.json({ error: 'Failed to process events' }, 500);
  }
});

// Get monitoring metrics (Admin only)
app.get('/metrics', requireAuth, requireRole(['ADMIN']), async (c) => {
  try {
    // In a real implementation, this would aggregate data from logs/database
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: formatUptime(process.uptime()),
        memory: {
          used: formatBytes(process.memoryUsage().heapUsed),
          total: formatBytes(process.memoryUsage().heapTotal),
          rss: formatBytes(process.memoryUsage().rss),
        },
        cpu: await getCpuUsage(),
        nodeVersion: process.version,
      },
      islamicFeatures: {
        prayerTimesRequests24h: await getPrayerTimesRequests(),
        educationContentViews24h: await getEducationContentViews(),
        quizAttempts24h: await getQuizAttempts(),
        qiblaDirectionUsage24h: await getQiblaDirectionUsage(),
        activeUsers24h: await getActiveUsers(),
      },
      errors: {
        total24h: await getErrorCount(),
        islamicFeatureErrors24h: await getIslamicFeatureErrors(),
        criticalErrors: await getCriticalErrors(),
      },
      performance: {
        averageResponseTime: await getAverageResponseTime(),
        slowQueries: await getSlowQueries(),
        prayerTimeApiLatency: await getPrayerTimeApiLatency(),
      },
      userEngagement: {
        newUsers24h: await getNewUsers(),
        contentCompletions24h: await getContentCompletions(),
        topIslamicSubjects: await getTopIslamicSubjects(),
        userRetention: await getUserRetention(),
      },
    };
    
    return c.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return c.json({ error: 'Failed to fetch metrics' }, 500);
  }
});

// Get Islamic feature analytics
app.get('/islamic-analytics', requireAuth, requireRole(['ADMIN']), async (c) => {
  try {
    const analytics = {
      timestamp: new Date().toISOString(),
      prayerTimes: {
        totalRequests: await getPrayerTimesRequests(),
        topLocations: await getTopPrayerTimeLocations(),
        calculationMethods: await getCalculationMethodUsage(),
        peakUsageHours: await getPrayerTimePeakHours(),
      },
      education: {
        popularContent: await getPopularEducationContent(),
        completionRates: await getEducationCompletionRates(),
        subjectDistribution: await getSubjectDistribution(),
        ageGroupEngagement: await getAgeGroupEngagement(),
        quizPerformance: await getQuizPerformanceStats(),
      },
      qiblaDirection: {
        totalUsage: await getQiblaDirectionUsage(),
        userLocations: await getQiblaUserLocations(),
        accuracyMetrics: await getQiblaAccuracyMetrics(),
      },
      announcements: {
        viewRates: await getAnnouncementViewRates(),
        engagementMetrics: await getAnnouncementEngagement(),
        priorityDistribution: await getAnnouncementPriorityDistribution(),
      },
      userBehavior: {
        sessionDuration: await getAverageSessionDuration(),
        featureUsage: await getFeatureUsageStats(),
        islamicContentPreferences: await getIslamicContentPreferences(),
        retentionByFeature: await getRetentionByFeature(),
      },
    };
    
    return c.json(analytics);
  } catch (error) {
    console.error('Error fetching Islamic analytics:', error);
    return c.json({ error: 'Failed to fetch Islamic analytics' }, 500);
  }
});

// Error reporting endpoint
app.post('/error-report', zValidator('json', z.object({
  error: z.string(),
  context: z.record(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
})), async (c) => {
  try {
    const { error, context, userId, sessionId } = c.req.valid('json');
    
    // Log the error with Islamic context
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      type: 'client_error_report',
      error,
      context,
      userId,
      sessionId,
      ip: c.req.header('X-Forwarded-For') || 'unknown',
      userAgent: c.req.header('User-Agent'),
      islamicContext: {
        hijriDate: getServerHijriDate(),
        currentPrayerWindow: getCurrentPrayerTimeWindow(),
      },
    }));
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing error report:', error);
    return c.json({ error: 'Failed to process error report' }, 500);
  }
});

// Utility functions for metrics collection
async function processIslamicEvent(event: any): Promise<void> {
  // Process specific Islamic events for analytics
  switch (event.event) {
    case 'prayer_times_viewed':
      // Track prayer time usage patterns
      break;
    case 'education_content_viewed':
      // Track educational content engagement
      break;
    case 'quiz_attempt':
      // Track quiz performance and learning outcomes
      break;
    case 'qibla_direction_used':
      // Track Qibla direction usage patterns
      break;
  }
}

// Placeholder functions for metrics - in production these would query actual data
async function getPrayerTimesRequests(): Promise<number> { return 1250; }
async function getEducationContentViews(): Promise<number> { return 890; }
async function getQuizAttempts(): Promise<number> { return 145; }
async function getQiblaDirectionUsage(): Promise<number> { return 320; }
async function getActiveUsers(): Promise<number> { return 450; }
async function getErrorCount(): Promise<number> { return 12; }
async function getIslamicFeatureErrors(): Promise<number> { return 3; }
async function getCriticalErrors(): Promise<number> { return 0; }
async function getAverageResponseTime(): Promise<string> { return '95ms'; }
async function getSlowQueries(): Promise<number> { return 2; }
async function getPrayerTimeApiLatency(): Promise<string> { return '120ms'; }
async function getNewUsers(): Promise<number> { return 25; }
async function getContentCompletions(): Promise<number> { return 78; }
async function getTopIslamicSubjects(): Promise<string[]> { return ['Prayer', 'Quran', 'Hadith']; }
async function getUserRetention(): Promise<string> { return '73%'; }

async function getTopPrayerTimeLocations(): Promise<any[]> {
  return [
    { city: 'New York', requests: 145 },
    { city: 'London', requests: 98 },
    { city: 'Dubai', requests: 87 },
  ];
}

async function getCalculationMethodUsage(): Promise<any[]> {
  return [
    { method: 'ISNA', usage: 45 },
    { method: 'Muslim World League', usage: 32 },
    { method: 'Umm Al-Qura', usage: 23 },
  ];
}

async function getPrayerTimePeakHours(): Promise<number[]> {
  return [5, 6, 12, 13, 15, 16, 18, 19]; // Hours when prayer time requests peak
}

async function getPopularEducationContent(): Promise<any[]> {
  return [
    { title: 'Introduction to Salah', views: 234 },
    { title: 'Quran Recitation Basics', views: 189 },
    { title: 'Islamic History Overview', views: 156 },
  ];
}

async function getEducationCompletionRates(): Promise<any> {
  return {
    overall: '67%',
    bySubject: {
      worship: '72%',
      quran: '69%',
      hadith: '64%',
      fiqh: '59%',
    },
  };
}

async function getSubjectDistribution(): Promise<any[]> {
  return [
    { subject: 'Worship', percentage: 35 },
    { subject: 'Quran', percentage: 28 },
    { subject: 'Hadith', percentage: 18 },
    { subject: 'Fiqh', percentage: 12 },
    { subject: 'History', percentage: 7 },
  ];
}

async function getAgeGroupEngagement(): Promise<any[]> {
  return [
    { ageGroup: 'Children', engagement: '78%' },
    { ageGroup: 'Youth', engagement: '65%' },
    { ageGroup: 'Adults', engagement: '71%' },
    { ageGroup: 'Seniors', engagement: '58%' },
  ];
}

async function getQuizPerformanceStats(): Promise<any> {
  return {
    averageScore: 76,
    completionRate: '82%',
    retakeRate: '23%',
    topPerformingQuizzes: [
      'Basic Prayer Knowledge',
      'Quran Basics',
      'Islamic Manners',
    ],
  };
}

async function getQiblaUserLocations(): Promise<any[]> {
  return [
    { country: 'United States', users: 156 },
    { country: 'United Kingdom', users: 89 },
    { country: 'Canada', users: 67 },
  ];
}

async function getQiblaAccuracyMetrics(): Promise<any> {
  return {
    averageAccuracy: '±2.3°',
    gpsUsage: '67%',
    manualEntry: '33%',
  };
}

async function getAnnouncementViewRates(): Promise<any> {
  return {
    overall: '73%',
    byPriority: {
      high: '89%',
      medium: '71%',
      low: '52%',
    },
  };
}

async function getAnnouncementEngagement(): Promise<any> {
  return {
    clickThroughRate: '23%',
    averageViewTime: '45s',
    shareRate: '8%',
  };
}

async function getAnnouncementPriorityDistribution(): Promise<any[]> {
  return [
    { priority: 'High', count: 12 },
    { priority: 'Medium', count: 34 },
    { priority: 'Low', count: 18 },
  ];
}

async function getAverageSessionDuration(): Promise<string> { return '12m 34s'; }
async function getFeatureUsageStats(): Promise<any[]> {
  return [
    { feature: 'Prayer Times', usage: '89%' },
    { feature: 'Education', usage: '67%' },
    { feature: 'Qibla Direction', usage: '45%' },
    { feature: 'Announcements', usage: '78%' },
  ];
}

async function getIslamicContentPreferences(): Promise<any[]> {
  return [
    { preference: 'Arabic with Translation', percentage: 45 },
    { preference: 'English Only', percentage: 35 },
    { preference: 'Arabic Only', percentage: 20 },
  ];
}

async function getRetentionByFeature(): Promise<any[]> {
  return [
    { feature: 'Prayer Times', retention: '78%' },
    { feature: 'Education', retention: '65%' },
    { feature: 'Qibla', retention: '52%' },
  ];
}

function getServerHijriDate(): string {
  const gregorianDate = new Date();
  const hijriYear = gregorianDate.getFullYear() - 579;
  return `${hijriYear} AH`;
}

function getCurrentPrayerTimeWindow(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'fajr_window';
  if (hour < 12) return 'dhuhr_window';
  if (hour < 16) return 'asr_window';
  if (hour < 19) return 'maghrib_window';
  return 'isha_window';
}

function formatUptime(uptime: number): string {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

async function getCpuUsage(): Promise<string> {
  // Simplified CPU usage calculation
  return '12%';
}

export default app;