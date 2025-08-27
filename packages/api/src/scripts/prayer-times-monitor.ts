#!/usr/bin/env node

// Prayer Times Monitoring Script
// Continuous monitoring and alerting for Islamic services

import { islamicFallbackService } from '../lib/islamic-fallback-service';

interface MonitoringConfig {
  checkInterval: number;
  alertThresholds: {
    responseTime: number;
    failureRate: number;
    consecutiveFailures: number;
  };
  notifications: {
    email?: string[];
    webhook?: string;
    slack?: string;
  };
}

class PrayerTimesMonitor {
  private config: MonitoringConfig;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private lastAlerts = new Map<string, number>();

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async start() {
    if (this.isRunning) {
      console.log('Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🕌 Prayer Times Monitor Started');
    console.log(`Monitoring interval: ${this.config.checkInterval / 1000}s`);
    console.log(`Alert thresholds: Response time: ${this.config.alertThresholds.responseTime}ms, Failure rate: ${this.config.alertThresholds.failureRate}%, Consecutive failures: ${this.config.alertThresholds.consecutiveFailures}`);

    // Perform initial health check
    await this.performHealthCheck();

    // Start continuous monitoring
    this.intervalId = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error('Health check failed:', error);
      });
    }, this.config.checkInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('Prayer Times Monitor Stopped');
    process.exit(0);
  }

  private async performHealthCheck() {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] Performing health check...`);

    try {
      // Get system statistics
      const stats = islamicFallbackService.getSystemStats();
      const serviceHealth = islamicFallbackService.getServiceHealth();

      // Calculate overall system health
      const healthyServices = serviceHealth.filter(s => s.healthy).length;
      const totalServices = serviceHealth.length;
      const systemHealth = (healthyServices / totalServices) * 100;

      console.log(`System Health: ${systemHealth.toFixed(1)}% (${healthyServices}/${totalServices} services healthy)`);
      console.log(`Cache Size: ${stats.cacheSize} entries`);
      console.log(`Manual Overrides: ${stats.manualOverrides}`);
      console.log(`Uptime: ${Math.floor(stats.uptime / 60)} minutes`);

      // Check each service
      const alerts: string[] = [];
      for (const service of serviceHealth) {
        const status = service.healthy ? '✅' : '❌';
        const responseTime = service.responseTime ? `${service.responseTime}ms` : 'N/A';
        const failures = service.consecutiveFailures;

        console.log(`  ${status} ${service.service}: ${responseTime} (${failures} consecutive failures)`);

        // Check for alert conditions
        if (failures >= this.config.alertThresholds.consecutiveFailures) {
          const alertKey = `${service.service}-failures`;
          const lastAlert = this.lastAlerts.get(alertKey) || 0;
          const alertCooldown = 5 * 60 * 1000; // 5 minutes

          if (Date.now() - lastAlert > alertCooldown) {
            alerts.push(`🚨 CRITICAL: ${service.service} has ${failures} consecutive failures`);
            this.lastAlerts.set(alertKey, Date.now());
          }
        }

        if (service.responseTime && service.responseTime > this.config.alertThresholds.responseTime) {
          const alertKey = `${service.service}-slow`;
          const lastAlert = this.lastAlerts.get(alertKey) || 0;
          const alertCooldown = 10 * 60 * 1000; // 10 minutes

          if (Date.now() - lastAlert > alertCooldown) {
            alerts.push(`⚠️  WARNING: ${service.service} response time is ${service.responseTime}ms (threshold: ${this.config.alertThresholds.responseTime}ms)`);
            this.lastAlerts.set(alertKey, Date.now());
          }
        }
      }

      // Test actual prayer time retrieval
      const testStart = Date.now();
      const testResponse = await islamicFallbackService.getPrayerTimes({
        latitude: 43.6532,
        longitude: -79.3832
      });
      const testDuration = Date.now() - testStart;

      if (testResponse.success) {
        console.log(`✅ Prayer times test successful (${testDuration}ms) - Source: ${testResponse.data?.source}`);
        if (testResponse.fallbackUsed) {
          console.log(`ℹ️  Fallback was used: ${testResponse.data?.source}`);
        }
      } else {
        alerts.push(`❌ CRITICAL: Prayer times retrieval failed - ${testResponse.error}`);
      }

      // Send alerts if any
      if (alerts.length > 0) {
        await this.sendAlerts(alerts);
      }

      // Log system recommendations
      if (systemHealth < 100) {
        console.log('\n📋 System Recommendations:');
        if (systemHealth < 50) {
          console.log('  • URGENT: Multiple services are down - investigate immediately');
          console.log('  • Consider enabling emergency mode');
        }
        if (stats.cacheSize === 0) {
          console.log('  • Cache is empty - performance may be degraded');
        }
        if (stats.manualOverrides === 0) {
          console.log('  • No manual overrides configured - consider adding fallback data');
        }
      }

    } catch (error) {
      const alertMessage = `❌ CRITICAL: Health check system failure - ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(alertMessage);
      await this.sendAlerts([alertMessage]);
    }
  }

  private async sendAlerts(alerts: string[]) {
    const timestamp = new Date().toISOString();
    const alertMessage = `🕌 Attaqwa Masjid Prayer Times Alert - ${timestamp}\n\n${alerts.join('\n')}`;

    console.log('\n🚨 SENDING ALERTS:');
    alerts.forEach(alert => console.log(`  ${alert}`));

    // Send webhook notification
    if (this.config.notifications.webhook) {
      try {
        await fetch(this.config.notifications.webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: alertMessage,
            timestamp,
            alerts,
            service: 'prayer-times-monitor'
          }),
        });
        console.log('✅ Webhook notification sent');
      } catch (error) {
        console.error('❌ Failed to send webhook notification:', error);
      }
    }

    // Send Slack notification
    if (this.config.notifications.slack) {
      try {
        await fetch(this.config.notifications.slack, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: alertMessage,
            channel: '#prayer-times-alerts',
            username: 'Prayer Times Monitor',
            icon_emoji: ':mosque:'
          }),
        });
        console.log('✅ Slack notification sent');
      } catch (error) {
        console.error('❌ Failed to send Slack notification:', error);
      }
    }

    // Email notifications would require additional email service integration
    if (this.config.notifications.email && this.config.notifications.email.length > 0) {
      console.log(`📧 Email alerts would be sent to: ${this.config.notifications.email.join(', ')}`);
      // TODO: Implement email notifications using service like SendGrid or Nodemailer
    }
  }
}

// Configuration
const monitoringConfig: MonitoringConfig = {
  checkInterval: parseInt(process.env.PRAYER_MONITOR_INTERVAL || '60000'), // 1 minute
  alertThresholds: {
    responseTime: parseInt(process.env.PRAYER_ALERT_RESPONSE_TIME || '5000'), // 5 seconds
    failureRate: parseInt(process.env.PRAYER_ALERT_FAILURE_RATE || '50'), // 50%
    consecutiveFailures: parseInt(process.env.PRAYER_ALERT_CONSECUTIVE_FAILURES || '3'), // 3 failures
  },
  notifications: {
    webhook: process.env.PRAYER_WEBHOOK_URL,
    slack: process.env.PRAYER_SLACK_WEBHOOK,
    email: process.env.PRAYER_ALERT_EMAILS?.split(',').map(email => email.trim()),
  },
};

// CLI handling
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'start':
    case undefined:
      const monitor = new PrayerTimesMonitor(monitoringConfig);
      monitor.start();
      break;

    case 'test':
      const testMonitor = new PrayerTimesMonitor(monitoringConfig);
      testMonitor['performHealthCheck']().then(() => {
        console.log('✅ Test completed successfully');
        process.exit(0);
      }).catch(error => {
        console.error('❌ Test failed:', error);
        process.exit(1);
      });
      break;

    case 'status':
      islamicFallbackService.getSystemStats();
      const stats = islamicFallbackService.getSystemStats();
      const health = islamicFallbackService.getServiceHealth();
      
      console.log('🕌 Prayer Times System Status');
      console.log('================================');
      console.log(`Uptime: ${Math.floor(stats.uptime / 60)} minutes`);
      console.log(`Cache entries: ${stats.cacheSize}`);
      console.log(`Manual overrides: ${stats.manualOverrides}`);
      console.log(`Offline schedules: ${stats.offlineSchedules}`);
      
      console.log('\nService Health:');
      health.forEach(service => {
        const status = service.healthy ? '✅ Healthy' : '❌ Unhealthy';
        const responseTime = service.responseTime ? `(${service.responseTime}ms)` : '';
        console.log(`  ${service.service}: ${status} ${responseTime}`);
      });
      
      process.exit(0);
      break;

    default:
      console.log('🕌 Prayer Times Monitor');
      console.log('Usage:');
      console.log('  npm run monitor:prayer-times [command]');
      console.log('');
      console.log('Commands:');
      console.log('  start    Start continuous monitoring (default)');
      console.log('  test     Run a single health check');
      console.log('  status   Show current system status');
      console.log('');
      console.log('Environment Variables:');
      console.log('  PRAYER_MONITOR_INTERVAL      Monitoring interval in ms (default: 60000)');
      console.log('  PRAYER_ALERT_RESPONSE_TIME   Response time alert threshold in ms (default: 5000)');
      console.log('  PRAYER_ALERT_FAILURE_RATE    Failure rate alert threshold % (default: 50)');
      console.log('  PRAYER_ALERT_CONSECUTIVE_FAILURES  Consecutive failures threshold (default: 3)');
      console.log('  PRAYER_WEBHOOK_URL           Webhook URL for alerts');
      console.log('  PRAYER_SLACK_WEBHOOK         Slack webhook URL for alerts');
      console.log('  PRAYER_ALERT_EMAILS          Comma-separated email addresses for alerts');
      process.exit(0);
  }
}

export { PrayerTimesMonitor, monitoringConfig };