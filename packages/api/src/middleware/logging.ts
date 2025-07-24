import { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';

// Enhanced logging middleware for Islamic application monitoring
export const enhancedLogger = createMiddleware(async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header('User-Agent') || '';
  const userID = c.get('user')?.id || 'anonymous';
  
  // Generate request ID for tracing
  const requestId = generateRequestId();
  c.set('requestId', requestId);
  
  // Request logging
  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    requestId,
    type: 'request_start',
    method,
    url,
    userAgent,
    userID,
    headers: {
      authorization: c.req.header('Authorization') ? '[REDACTED]' : undefined,
      'content-type': c.req.header('Content-Type'),
      'x-forwarded-for': c.req.header('X-Forwarded-For'),
    },
  }));

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;
  
  // Response logging
  console.log(JSON.stringify({
    level: status >= 400 ? 'warn' : 'info',
    timestamp: new Date().toISOString(),
    requestId,
    type: 'request_complete',
    method,
    url,
    status,
    duration: `${duration}ms`,
    userID,
    // Islamic-specific metrics
    isIslamicEndpoint: isIslamicEndpoint(url),
    endpoint_category: categorizeEndpoint(url),
  }));
});

// Islamic application specific metrics middleware
export const islamicMetrics = createMiddleware(async (c: Context, next: Next) => {
  const start = performance.now();
  const url = c.req.url;
  
  await next();
  
  const duration = performance.now() - start;
  const status = c.res.status;
  
  // Track Islamic feature usage
  if (isIslamicEndpoint(url)) {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      type: 'islamic_feature_usage',
      endpoint: url,
      category: categorizeEndpoint(url),
      duration: `${duration.toFixed(2)}ms`,
      status,
      success: status < 400,
      // Islamic context
      hijriDate: getHijriDate(),
      prayerTimeContext: getPrayerTimeContext(),
    }));
  }
});

// Error tracking middleware with Islamic context
export const errorTracker = createMiddleware(async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    const requestId = c.get('requestId') || 'unknown';
    const userID = c.get('user')?.id || 'anonymous';
    const url = c.req.url;
    const method = c.req.method;
    
    // Enhanced error logging with Islamic context
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      requestId,
      type: 'application_error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      request: {
        method,
        url,
        userID,
        userAgent: c.req.header('User-Agent'),
        ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP'),
      },
      // Islamic application context
      islamicContext: {
        isIslamicEndpoint: isIslamicEndpoint(url),
        endpointCategory: categorizeEndpoint(url),
        hijriDate: getHijriDate(),
        serverLocation: process.env.SERVER_LOCATION || 'unknown',
      },
    }));
    
    // Send to external error tracking service if configured
    if (process.env.SENTRY_DSN) {
      await sendToSentry(error, {
        requestId,
        userID,
        url,
        method,
        islamicContext: true,
      });
    }
    
    throw error; // Re-throw to maintain error flow
  }
});

// Performance monitoring middleware
export const performanceMonitor = createMiddleware(async (c: Context, next: Next) => {
  const start = process.hrtime.bigint();
  const memoryBefore = process.memoryUsage();
  
  await next();
  
  const end = process.hrtime.bigint();
  const memoryAfter = process.memoryUsage();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds
  
  const url = c.req.url;
  const status = c.res.status;
  
  // Log performance metrics
  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    type: 'performance_metrics',
    endpoint: url,
    category: categorizeEndpoint(url),
    metrics: {
      duration: `${duration.toFixed(2)}ms`,
      memory: {
        heapUsed: formatBytes(memoryAfter.heapUsed - memoryBefore.heapUsed),
        heapTotal: formatBytes(memoryAfter.heapTotal),
        external: formatBytes(memoryAfter.external),
      },
      status,
    },
    // Performance thresholds for Islamic features
    performanceFlags: {
      slow: duration > 1000, // Prayer time calculations should be fast
      memoryIntensive: (memoryAfter.heapUsed - memoryBefore.heapUsed) > 50 * 1024 * 1024, // 50MB
      critical: duration > 5000, // Critical for prayer times
    },
  }));
});

// Health check endpoint with Islamic features status
export const healthCheck = (c: Context) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hijriDate: getHijriDate(),
    services: {
      database: 'healthy', // TODO: Add actual health checks
      prayerTimesAPI: 'healthy',
      redis: 'healthy',
    },
    islamicFeatures: {
      prayerTimesEnabled: true,
      qiblaDirectionEnabled: true,
      hijriCalendarEnabled: true,
      educationSystemEnabled: true,
    },
    serverInfo: {
      nodeVersion: process.version,
      uptime: formatUptime(process.uptime()),
      memory: {
        used: formatBytes(process.memoryUsage().heapUsed),
        total: formatBytes(process.memoryUsage().heapTotal),
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });
};

// Utility functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function isIslamicEndpoint(url: string): boolean {
  const islamicPaths = [
    '/api/prayer-times',
    '/api/education',
    '/api/qibla',
    '/api/hijri',
    '/api/announcements',
    '/api/events',
  ];
  
  return islamicPaths.some(path => url.includes(path));
}

function categorizeEndpoint(url: string): string {
  if (url.includes('/prayer-times')) return 'prayer_times';
  if (url.includes('/education')) return 'education';
  if (url.includes('/qibla')) return 'qibla_direction';
  if (url.includes('/announcements')) return 'announcements';
  if (url.includes('/events')) return 'events';
  if (url.includes('/auth')) return 'authentication';
  if (url.includes('/admin')) return 'admin';
  return 'general';
}

function getHijriDate(): string {
  // Simple Hijri date calculation (in production, use a proper Islamic calendar library)
  const gregorianDate = new Date();
  const hijriYear = gregorianDate.getFullYear() - 579; // Approximate conversion
  return `${hijriYear} AH`;
}

function getPrayerTimeContext(): string {
  const now = new Date();
  const hours = now.getHours();
  
  if (hours < 6) return 'fajr_time';
  if (hours < 12) return 'dhuhr_time';
  if (hours < 16) return 'asr_time';
  if (hours < 19) return 'maghrib_time';
  return 'isha_time';
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

function formatUptime(uptime: number): string {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

async function sendToSentry(error: Error, context: any): Promise<void> {
  // Placeholder for Sentry integration
  // In production, implement actual Sentry SDK integration
  console.log('Would send to Sentry:', { error: error.message, context });
}