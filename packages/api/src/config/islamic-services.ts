// Islamic Services Configuration
// 5-Layer Fallback System for 99.9% Uptime

export const ISLAMIC_SERVICES_CONFIG = {
  // Layer 1: Primary API (Aladhan API)
  primaryApi: {
    baseUrl: 'http://api.aladhan.com/v1',
    timeout: 5000,
    retries: 2,
    rateLimit: {
      requests: 1000,
      window: 3600000, // 1 hour
    },
  },

  // Layer 2: Secondary API (IslamicFinder)
  secondaryApi: {
    baseUrl: 'https://www.islamicfinder.us/index.php/api',
    timeout: 7000,
    retries: 2,
    rateLimit: {
      requests: 500,
      window: 3600000,
    },
  },

  // Layer 3: Local Calculation Library
  localCalculation: {
    method: 'MWL', // Muslim World League
    madhab: 'Shafi', // Fiqh method
    adjustments: {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
    highLatitudeRule: 'NightMiddle',
  },

  // Layer 4: Manual Override System
  manualOverride: {
    enabled: true,
    priority: 'HIGH',
    validityDays: 30,
    approvalRequired: true,
  },

  // Layer 5: Offline Schedule
  offlineSchedule: {
    precomputedDays: 365,
    updateFrequency: 'monthly',
    fallbackLocation: {
      latitude: 43.6532,
      longitude: -79.3832,
      timezone: 'America/Toronto',
    },
  },

  // Cache Configuration
  cache: {
    prayerTimes: {
      ttl: 3600000, // 1 hour
      maxAge: 86400000, // 24 hours for fallback
    },
    qibla: {
      ttl: 604800000, // 7 days
    },
    islamicDate: {
      ttl: 43200000, // 12 hours
    },
  },

  // Monitoring Configuration
  monitoring: {
    healthCheckInterval: 60000, // 1 minute
    alertThresholds: {
      apiFailureRate: 0.05, // 5%
      responseTime: 10000, // 10 seconds
      consecutiveFailures: 3,
    },
    notifications: {
      email: ['admin@attaqwamasjid.ca'],
      webhook: process.env.MONITORING_WEBHOOK_URL,
    },
  },

  // Default locations for major cities
  defaultLocations: {
    toronto: { lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
    ottawa: { lat: 45.4215, lng: -75.6972, timezone: 'America/Toronto' },
    montreal: { lat: 45.5017, lng: -73.5673, timezone: 'America/Toronto' },
    vancouver: { lat: 49.2827, lng: -123.1207, timezone: 'America/Vancouver' },
  },
} as const;

export type IslamicServicesConfig = typeof ISLAMIC_SERVICES_CONFIG;