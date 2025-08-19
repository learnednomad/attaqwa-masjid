import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { jwt } from 'hono/jwt';
import { requireAuth as authMiddleware } from '../middleware/auth.js';

const notifications = new Hono();

// Validation schemas
const notificationPreferencesSchema = z.object({
  prayerReminders: z.object({
    enabled: z.boolean().default(true),
    beforeMinutes: z.array(z.number().min(1).max(60)).default([5, 15]),
    prayers: z.array(z.enum(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'])).default(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']),
  }).optional(),
  announcements: z.object({
    enabled: z.boolean().default(true),
    categories: z.array(z.string()).default(['general', 'events', 'education']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  }).optional(),
  islamicEvents: z.object({
    enabled: z.boolean().default(true),
    events: z.array(z.enum(['ramadan', 'eid', 'hajj', 'ashura', 'mawlid'])).default(['ramadan', 'eid']),
    beforeDays: z.number().min(1).max(30).default(3),
  }).optional(),
  methods: z.object({
    push: z.boolean().default(true),
    email: z.boolean().default(false),
    sms: z.boolean().default(false),
  }).optional(),
});

const pushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().optional(),
});

const sendNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  type: z.enum(['prayer', 'announcement', 'islamic_event', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  data: z.record(z.any()).optional(),
  scheduledFor: z.string().datetime().optional(),
  recipients: z.object({
    userIds: z.array(z.string()).optional(),
    roles: z.array(z.enum(['admin', 'moderator', 'user'])).optional(),
    ageTiers: z.array(z.string()).optional(),
    all: z.boolean().default(false),
  }).optional(),
});

const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['prayer_time', 'announcement', 'islamic_event'])),
  secret: z.string().min(10).optional(),
  active: z.boolean().default(true),
});

// In-memory storage (in production, use Redis or database)
const userPreferences = new Map<string, any>();
const pushTokens = new Map<string, any[]>();
const scheduledNotifications = new Map<string, any>();
const webhooks = new Map<string, any>();
const notificationQueue = new Map<string, any>();

// Notification service class
class NotificationService {
  static async sendPushNotification(tokens: string[], notification: any) {
    // In production, integrate with Firebase Cloud Messaging, AWS SNS, or similar
    console.log(`Sending push notification to ${tokens.length} devices:`, notification);
    
    const results = tokens.map(token => ({
      token,
      success: Math.random() > 0.1, // 90% success rate simulation
      error: Math.random() > 0.1 ? null : 'Invalid token'
    }));
    
    return results;
  }

  static async sendEmail(emails: string[], notification: any) {
    // In production, integrate with SendGrid, AWS SES, or similar
    console.log(`Sending email to ${emails.length} addresses:`, notification);
    
    return emails.map(email => ({
      email,
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }));
  }

  static async sendSMS(phones: string[], notification: any) {
    // In production, integrate with Twilio, AWS SNS, or similar
    console.log(`Sending SMS to ${phones.length} numbers:`, notification);
    
    return phones.map(phone => ({
      phone,
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }));
  }

  static async sendWebhook(webhook: any, data: any) {
    try {
      const payload = {
        event: data.type,
        timestamp: new Date().toISOString(),
        data
      };

      // Add signature if secret provided
      let headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'AttaqwaMasjid-Webhook/1.0'
      };

      if (webhook.secret) {
        const crypto = await import('crypto');
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        headers['X-Signature'] = `sha256=${signature}`;
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      console.error('Webhook delivery failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// GET /api/notifications/preferences
notifications.get('/preferences', authMiddleware, async (c) => {
  const user = c.get('user');
  
  try {
    const preferences = userPreferences.get(user.id) || {
      prayerReminders: {
        enabled: true,
        beforeMinutes: [5, 15],
        prayers: ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
      },
      announcements: {
        enabled: true,
        categories: ['general', 'events', 'education'],
        priority: 'medium'
      },
      islamicEvents: {
        enabled: true,
        events: ['ramadan', 'eid'],
        beforeDays: 3
      },
      methods: {
        push: true,
        email: false,
        sms: false
      }
    };
    
    return c.json({
      data: preferences,
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return c.json({
      error: 'Failed to get notification preferences',
      message: 'Please try again later',
      success: false
    }, 500);
  }
});

// PUT /api/notifications/preferences
notifications.put('/preferences', 
  authMiddleware,
  zValidator('json', notificationPreferencesSchema),
  async (c) => {
    const user = c.get('user');
    const preferences = c.req.valid('json');
    
    try {
      userPreferences.set(user.id, preferences);
      
      return c.json({
        data: preferences,
        success: true,
        message: 'Notification preferences updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return c.json({
        error: 'Failed to update notification preferences',
        message: 'Please try again later',
        success: false
      }, 500);
    }
  }
);

// POST /api/notifications/push-token
notifications.post('/push-token',
  authMiddleware,
  zValidator('json', pushTokenSchema),
  async (c) => {
    const user = c.get('user');
    const { token, platform, deviceId } = c.req.valid('json');
    
    try {
      const userTokens = pushTokens.get(user.id) || [];
      
      // Remove existing token if it exists
      const filteredTokens = userTokens.filter(t => t.token !== token);
      
      // Add new token
      filteredTokens.push({
        token,
        platform,
        deviceId,
        registeredAt: new Date().toISOString(),
        active: true
      });
      
      pushTokens.set(user.id, filteredTokens);
      
      return c.json({
        data: { token, platform, registered: true },
        success: true,
        message: 'Push token registered successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
      return c.json({
        error: 'Failed to register push token',
        message: 'Please try again later',
        success: false
      }, 500);
    }
  }
);

// DELETE /api/notifications/push-token/:token
notifications.delete('/push-token/:token', authMiddleware, async (c) => {
  const user = c.get('user');
  const token = c.req.param('token');
  
  try {
    const userTokens = pushTokens.get(user.id) || [];
    const filteredTokens = userTokens.filter(t => t.token !== token);
    
    pushTokens.set(user.id, filteredTokens);
    
    return c.json({
      success: true,
      message: 'Push token removed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to remove push token:', error);
    return c.json({
      error: 'Failed to remove push token',
      message: 'Please try again later',
      success: false
    }, 500);
  }
});

// POST /api/notifications/send (Admin/Moderator only)
notifications.post('/send',
  authMiddleware,
  zValidator('json', sendNotificationSchema),
  async (c) => {
    const user = c.get('user');
    
    if (user.role !== 'admin' && user.role !== 'moderator') {
      return c.json({
        error: 'Insufficient permissions',
        message: 'Only admins and moderators can send notifications',
        success: false
      }, 403);
    }
    
    const notificationData = c.req.valid('json');
    
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // If scheduled, add to queue
      if (notificationData.scheduledFor) {
        scheduledNotifications.set(notificationId, {
          ...notificationData,
          id: notificationId,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          status: 'scheduled'
        });
        
        return c.json({
          data: { notificationId, scheduled: true },
          success: true,
          message: 'Notification scheduled successfully',
          timestamp: new Date().toISOString()
        });
      }
      
      // Send immediately
      const results = await NotificationService.sendPushNotification(
        Array.from(pushTokens.values()).flat().map(t => t.token),
        notificationData
      );
      
      const notification = {
        id: notificationId,
        ...notificationData,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        status: 'sent',
        results: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };
      
      notificationQueue.set(notificationId, notification);
      
      return c.json({
        data: notification,
        success: true,
        message: 'Notification sent successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      return c.json({
        error: 'Failed to send notification',
        message: 'Please try again later',
        success: false
      }, 500);
    }
  }
);

// POST /api/notifications/prayer-reminder
notifications.post('/prayer-reminder', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({
      error: 'Insufficient permissions',
      success: false
    }, 403);
  }
  
  try {
    // This would typically be called by a cron job or scheduler
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // Get prayer times for today (simplified)
    const prayerTimes = {
      fajr: '05:30',
      dhuhr: '12:30',
      asr: '15:30',
      maghrib: '17:30',
      isha: '19:30'
    };
    
    const upcomingPrayers = Object.entries(prayerTimes).filter(([name, time]) => {
      const prayerTime = new Date(`${now.toDateString()} ${time}`);
      const timeDiff = (prayerTime.getTime() - now.getTime()) / (1000 * 60); // minutes
      return timeDiff > 0 && timeDiff <= 15; // Within next 15 minutes
    });
    
    if (upcomingPrayers.length === 0) {
      return c.json({
        message: 'No upcoming prayers in the next 15 minutes',
        success: true
      });
    }
    
    const results = [];
    
    for (const [prayerName, prayerTime] of upcomingPrayers) {
      const notification = {
        title: `${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} Prayer Time`,
        body: `It's time for ${prayerName} prayer at ${prayerTime}`,
        type: 'prayer' as const,
        priority: 'high' as const,
        data: {
          prayer: prayerName,
          time: prayerTime
        }
      };
      
      const tokens = Array.from(pushTokens.values()).flat().map(t => t.token);
      const result = await NotificationService.sendPushNotification(tokens, notification);
      
      results.push({
        prayer: prayerName,
        time: prayerTime,
        sent: result.filter(r => r.success).length,
        failed: result.filter(r => !r.success).length
      });
    }
    
    return c.json({
      data: results,
      success: true,
      message: 'Prayer reminders sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send prayer reminders:', error);
    return c.json({
      error: 'Failed to send prayer reminders',
      message: 'Please try again later',
      success: false
    }, 500);
  }
});

// Webhook management endpoints

// POST /api/notifications/webhooks
notifications.post('/webhooks',
  authMiddleware,
  zValidator('json', webhookSchema),
  async (c) => {
    const user = c.get('user');
    
    if (user.role !== 'admin') {
      return c.json({
        error: 'Insufficient permissions',
        message: 'Only admins can manage webhooks',
        success: false
      }, 403);
    }
    
    const webhookData = c.req.valid('json');
    
    try {
      const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const webhook = {
        id: webhookId,
        ...webhookData,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };
      
      webhooks.set(webhookId, webhook);
      
      return c.json({
        data: webhook,
        success: true,
        message: 'Webhook created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to create webhook:', error);
      return c.json({
        error: 'Failed to create webhook',
        message: 'Please try again later',
        success: false
      }, 500);
    }
  }
);

// GET /api/notifications/webhooks
notifications.get('/webhooks', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (user.role !== 'admin') {
    return c.json({
      error: 'Insufficient permissions',
      success: false
    }, 403);
  }
  
  try {
    const allWebhooks = Array.from(webhooks.values());
    
    return c.json({
      data: allWebhooks,
      success: true,
      total: allWebhooks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get webhooks:', error);
    return c.json({
      error: 'Failed to get webhooks',
      success: false
    }, 500);
  }
});

// DELETE /api/notifications/webhooks/:id
notifications.delete('/webhooks/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  const webhookId = c.req.param('id');
  
  if (user.role !== 'admin') {
    return c.json({
      error: 'Insufficient permissions',
      success: false
    }, 403);
  }
  
  try {
    const deleted = webhooks.delete(webhookId);
    
    if (!deleted) {
      return c.json({
        error: 'Webhook not found',
        success: false
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Webhook deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to delete webhook:', error);
    return c.json({
      error: 'Failed to delete webhook',
      success: false
    }, 500);
  }
});

// GET /api/notifications/history
notifications.get('/history', authMiddleware, async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  const offset = (page - 1) * limit;
  
  try {
    let userNotifications = [];
    
    if (user.role === 'admin' || user.role === 'moderator') {
      // Admins and moderators can see all notifications they created
      userNotifications = Array.from(notificationQueue.values())
        .filter(n => n.createdBy === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Regular users see notifications that were sent to them (simplified)
      userNotifications = Array.from(notificationQueue.values())
        .filter(n => n.recipients?.all || n.recipients?.userIds?.includes(user.id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    const paginatedNotifications = userNotifications.slice(offset, offset + limit);
    
    return c.json({
      data: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: userNotifications.length,
        totalPages: Math.ceil(userNotifications.length / limit)
      },
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to get notification history:', error);
    return c.json({
      error: 'Failed to get notification history',
      success: false
    }, 500);
  }
});

// Health check endpoint
notifications.get('/health', async (c) => {
  try {
    const stats = {
      activeUsers: userPreferences.size,
      registeredTokens: Array.from(pushTokens.values()).reduce((total, tokens) => total + tokens.length, 0),
      scheduledNotifications: scheduledNotifications.size,
      activeWebhooks: Array.from(webhooks.values()).filter(w => w.active).length,
      sentNotifications: notificationQueue.size
    };
    
    return c.json({
      status: 'healthy',
      service: 'notifications',
      statistics: stats,
      features: [
        'push-notifications',
        'prayer-reminders',
        'announcement-notifications',
        'islamic-event-notifications',
        'email-notifications',
        'sms-notifications',
        'webhook-integrations'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      status: 'error',
      service: 'notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export { notifications as notificationRoutes };