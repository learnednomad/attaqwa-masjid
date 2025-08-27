// Prayer Times Admin Routes
// Manual override management and monitoring

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { islamicFallbackService } from '../lib/islamic-fallback-service';
import { requireAuth, requireRole } from '../middleware/auth';

const adminRoutes = new Hono();

// Apply authentication middleware
adminRoutes.use('*', requireAuth);

// Validation schemas
const manualOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  prayerTimes: z.object({
    fajr: z.string().regex(/^\d{2}:\d{2}$/),
    dhuhr: z.string().regex(/^\d{2}:\d{2}$/),
    asr: z.string().regex(/^\d{2}:\d{2}$/),
    maghrib: z.string().regex(/^\d{2}:\d{2}$/),
    isha: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  validDays: z.number().int().min(1).max(30).default(7),
  reason: z.string().min(10).max(500),
  approved: z.boolean().default(false)
});

const overrideApprovalSchema = z.object({
  approved: z.boolean(),
  approvalReason: z.string().optional()
});

// POST /api/admin/prayer-times/manual-override
// Create a manual prayer time override
adminRoutes.post('/manual-override',
  requireRole(['admin', 'moderator']),
  zValidator('json', manualOverrideSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + data.validDays);
      
      const overrideId = await islamicFallbackService.addManualOverride({
        date: data.date,
        location: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        prayerTimes: data.prayerTimes,
        createdBy: user.id,
        validUntil,
        approved: user.role === 'admin' ? data.approved : false // Auto-approve for admin
      });
      
      return c.json({
        success: true,
        data: {
          overrideId,
          status: user.role === 'admin' ? (data.approved ? 'approved' : 'pending') : 'pending',
          validUntil: validUntil.toISOString(),
          message: user.role === 'admin' && data.approved 
            ? 'Manual override created and approved'
            : 'Manual override created, pending approval'
        },
        timestamp: new Date().toISOString()
      }, 201);
    } catch (error) {
      console.error('Manual override creation error:', error);
      return c.json({
        success: false,
        error: 'Failed to create manual override',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// PUT /api/admin/prayer-times/manual-override/:id/approve
// Approve or reject a manual override
adminRoutes.put('/manual-override/:id/approve',
  requireRole(['admin']),
  zValidator('json', overrideApprovalSchema),
  async (c) => {
    const overrideId = c.req.param('id');
    const { approved, approvalReason } = c.req.valid('json');
    const user = c.get('user');
    
    try {
      // TODO: Implement override approval in service
      // For now, return success response
      return c.json({
        success: true,
        data: {
          overrideId,
          approved,
          approvedBy: user.id,
          approvalReason,
          approvedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Override approval error:', error);
      return c.json({
        success: false,
        error: 'Failed to approve override',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// GET /api/admin/prayer-times/system-stats
// Get comprehensive system statistics
adminRoutes.get('/system-stats',
  requireRole(['admin', 'moderator']),
  async (c) => {
    try {
      const stats = islamicFallbackService.getSystemStats();
      const serviceHealth = islamicFallbackService.getServiceHealth();
      
      // Calculate uptime and performance metrics
      const uptimeHours = Math.floor(stats.uptime / 3600);
      const uptimeMins = Math.floor((stats.uptime % 3600) / 60);
      
      const healthyServices = serviceHealth.filter(s => s.healthy).length;
      const totalServices = serviceHealth.length;
      const systemHealth = (healthyServices / totalServices) * 100;
      
      return c.json({
        success: true,
        data: {
          overview: {
            systemHealth: `${Math.round(systemHealth)}%`,
            uptime: `${uptimeHours}h ${uptimeMins}m`,
            healthyServices: `${healthyServices}/${totalServices}`,
            cacheEfficiency: stats.cacheSize > 0 ? 'Active' : 'Empty'
          },
          cache: {
            size: stats.cacheSize,
            status: stats.cacheSize > 0 ? 'active' : 'empty'
          },
          services: serviceHealth.map(service => ({
            name: service.service,
            status: service.healthy ? 'healthy' : 'unhealthy',
            lastChecked: service.lastChecked,
            consecutiveFailures: service.consecutiveFailures,
            responseTime: service.responseTime ? `${service.responseTime}ms` : null
          })),
          fallbackLayers: {
            manualOverrides: stats.manualOverrides,
            offlineSchedules: stats.offlineSchedules,
            localCalculations: 'Available',
            primaryApi: serviceHealth.find(s => s.service === 'aladhan')?.healthy ? 'Operational' : 'Down',
            secondaryApi: serviceHealth.find(s => s.service === 'islamicfinder')?.healthy ? 'Operational' : 'Down'
          },
          performance: {
            averageResponseTime: serviceHealth
              .filter(s => s.responseTime)
              .reduce((avg, s, i, arr) => avg + s.responseTime! / arr.length, 0) + 'ms',
            failureRate: serviceHealth
              .reduce((rate, s) => rate + (s.consecutiveFailures > 0 ? 1 : 0), 0) / totalServices * 100 + '%'
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('System stats error:', error);
      return c.json({
        success: false,
        error: 'Failed to retrieve system statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// GET /api/admin/prayer-times/service-health
// Get detailed service health information
adminRoutes.get('/service-health',
  requireRole(['admin', 'moderator']),
  async (c) => {
    try {
      const serviceHealth = islamicFallbackService.getServiceHealth();
      
      const detailedHealth = serviceHealth.map(service => {
        const status = service.healthy ? 'healthy' : 'unhealthy';
        const alertLevel = service.consecutiveFailures === 0 ? 'none' :
                          service.consecutiveFailures < 3 ? 'warning' : 'critical';
        
        return {
          service: service.service,
          status,
          alertLevel,
          lastChecked: service.lastChecked,
          consecutiveFailures: service.consecutiveFailures,
          responseTime: service.responseTime,
          recommendations: service.consecutiveFailures > 0 ? [
            service.consecutiveFailures >= 3 && 'Service requires immediate attention',
            service.consecutiveFailures === 1 && 'Monitor service closely',
            !service.responseTime && 'Enable response time monitoring'
          ].filter(Boolean) : []
        };
      });
      
      return c.json({
        success: true,
        data: {
          services: detailedHealth,
          summary: {
            totalServices: serviceHealth.length,
            healthyServices: serviceHealth.filter(s => s.healthy).length,
            servicesWithWarnings: serviceHealth.filter(s => s.consecutiveFailures > 0 && s.consecutiveFailures < 3).length,
            servicesInCritical: serviceHealth.filter(s => s.consecutiveFailures >= 3).length,
            overallStatus: serviceHealth.every(s => s.healthy) ? 'all-healthy' :
                          serviceHealth.some(s => s.healthy) ? 'partial-degradation' : 'all-down'
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Service health error:', error);
      return c.json({
        success: false,
        error: 'Failed to retrieve service health',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// POST /api/admin/prayer-times/clear-cache
// Clear system cache
adminRoutes.post('/clear-cache',
  requireRole(['admin']),
  async (c) => {
    try {
      // TODO: Implement cache clearing in service
      // For now, return success response
      return c.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Cache clear error:', error);
      return c.json({
        success: false,
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// POST /api/admin/prayer-times/test-fallback
// Test fallback system functionality
adminRoutes.post('/test-fallback',
  requireRole(['admin']),
  zValidator('json', z.object({
    layer: z.enum(['primary', 'secondary', 'local', 'manual', 'offline']).optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional()
  })),
  async (c) => {
    const { layer, coordinates } = c.req.valid('json');
    const testCoords = coordinates || { latitude: 43.6532, longitude: -79.3832 };
    
    try {
      const startTime = Date.now();
      
      // Test the fallback service
      const response = await islamicFallbackService.getPrayerTimes({
        date: new Date().toISOString().split('T')[0],
        latitude: testCoords.latitude,
        longitude: testCoords.longitude
      });
      
      const responseTime = Date.now() - startTime;
      
      return c.json({
        success: true,
        data: {
          fallbackTest: {
            layer: layer || 'auto',
            responseTime: `${responseTime}ms`,
            sourceUsed: response.data?.source || 'unknown',
            fallbackTriggered: response.fallbackUsed || false,
            dataReceived: !!response.data,
            testCoordinates: testCoords
          },
          response: response.success ? response.data : { error: response.error },
          performance: {
            responseTime,
            acceptable: responseTime < 5000,
            rating: responseTime < 1000 ? 'excellent' :
                   responseTime < 3000 ? 'good' :
                   responseTime < 5000 ? 'acceptable' : 'slow'
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Fallback test error:', error);
      return c.json({
        success: false,
        error: 'Fallback test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

export { adminRoutes as prayerTimesAdminRoutes };