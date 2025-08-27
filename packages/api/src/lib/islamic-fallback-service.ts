// Islamic Services Fallback System
// 5-Layer Architecture for 99.9% Uptime

import { IslamicCalculations } from './islamic-calculations';
import { ISLAMIC_SERVICES_CONFIG } from '../config/islamic-services';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PrayerTimesRequest {
  date?: string;
  latitude?: number;
  longitude?: number;
  method?: string;
  adjustment?: string;
}

interface PrayerTimesResponse {
  success: boolean;
  data?: {
    date: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    qibla: number;
    hijriDate?: {
      day: number;
      month: number;
      year: number;
      monthName: string;
      formatted: string;
    };
    islamicDate?: {
      day: number;
      month: number;
      year: number;
      monthName: string;
      formatted: string;
    };
    location?: {
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
    };
    source: 'aladhan' | 'islamicfinder' | 'local' | 'manual' | 'offline';
    method: string;
  };
  error?: string;
  fallbackUsed?: boolean;
  responseTime?: number;
}

interface ServiceHealth {
  service: string;
  healthy: boolean;
  responseTime?: number;
  lastChecked: Date;
  consecutiveFailures: number;
}

interface ManualOverride {
  id: string;
  date: string;
  location: Coordinates;
  prayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  createdBy: string;
  validUntil: Date;
  approved: boolean;
}

export class IslamicFallbackService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private serviceHealth = new Map<string, ServiceHealth>();
  private manualOverrides = new Map<string, ManualOverride>();
  private offlineSchedules = new Map<string, any>();

  constructor() {
    this.initializeHealthMonitoring();
    this.preloadOfflineSchedules();
  }

  /**
   * Main entry point - Get prayer times with 5-layer fallback
   */
  async getPrayerTimes(request: PrayerTimesRequest): Promise<PrayerTimesResponse> {
    const startTime = Date.now();
    const coordinates = this.getCoordinates(request);
    const date = request.date || new Date().toISOString().split('T')[0];
    const cacheKey = `prayer-${date}-${coordinates.latitude}-${coordinates.longitude}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        success: true,
        data: { ...cached, source: cached.source || 'cache' },
        responseTime: Date.now() - startTime
      };
    }

    // Layer 4: Manual Override (Highest Priority)
    const manualOverride = this.getManualOverride(date, coordinates);
    if (manualOverride) {
      const result = await this.buildResponseFromManual(manualOverride, coordinates, date);
      this.setCache(cacheKey, result, ISLAMIC_SERVICES_CONFIG.cache.prayerTimes.ttl);
      return {
        success: true,
        data: { ...result, source: 'manual' },
        fallbackUsed: true,
        responseTime: Date.now() - startTime
      };
    }

    // Layer 1: Primary API (Aladhan)
    try {
      const aladhanResult = await this.fetchFromAladhan(request);
      if (aladhanResult.success && aladhanResult.data) {
        const enhancedData = await this.enhanceWithLocalCalculations(aladhanResult.data, coordinates);
        this.setCache(cacheKey, enhancedData, ISLAMIC_SERVICES_CONFIG.cache.prayerTimes.ttl);
        this.updateServiceHealth('aladhan', true, Date.now() - startTime);
        return {
          success: true,
          data: { ...enhancedData, source: 'aladhan' },
          responseTime: Date.now() - startTime
        };
      }
    } catch (error) {
      this.updateServiceHealth('aladhan', false);
      console.warn('Aladhan API failed, trying secondary:', error);
    }

    // Layer 2: Secondary API (IslamicFinder)
    try {
      const islamicFinderResult = await this.fetchFromIslamicFinder(request);
      if (islamicFinderResult.success && islamicFinderResult.data) {
        const enhancedData = await this.enhanceWithLocalCalculations(islamicFinderResult.data, coordinates);
        this.setCache(cacheKey, enhancedData, ISLAMIC_SERVICES_CONFIG.cache.prayerTimes.ttl);
        this.updateServiceHealth('islamicfinder', true, Date.now() - startTime);
        return {
          success: true,
          data: { ...enhancedData, source: 'islamicfinder' },
          fallbackUsed: true,
          responseTime: Date.now() - startTime
        };
      }
    } catch (error) {
      this.updateServiceHealth('islamicfinder', false);
      console.warn('IslamicFinder API failed, using local calculation:', error);
    }

    // Layer 3: Local Calculation Library
    try {
      const localResult = await this.calculateLocally(coordinates, new Date(date), request);
      this.setCache(cacheKey, localResult, ISLAMIC_SERVICES_CONFIG.cache.prayerTimes.ttl);
      return {
        success: true,
        data: { ...localResult, source: 'local' },
        fallbackUsed: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      console.warn('Local calculation failed, using offline schedule:', error);
    }

    // Layer 5: Offline Schedule (Last Resort)
    const offlineResult = this.getFromOfflineSchedule(date, coordinates);
    if (offlineResult) {
      return {
        success: true,
        data: { ...offlineResult, source: 'offline' },
        fallbackUsed: true,
        responseTime: Date.now() - startTime
      };
    }

    // Complete failure
    return {
      success: false,
      error: 'All prayer time services failed',
      responseTime: Date.now() - startTime
    };
  }

  /**
   * Get Qibla direction with fallback
   */
  async getQiblaDirection(coordinates: Coordinates): Promise<{ direction: number; distance: number }> {
    const cacheKey = `qibla-${coordinates.latitude}-${coordinates.longitude}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Always use local calculation for Qibla (most reliable)
    const direction = IslamicCalculations.calculateQiblaDirection(coordinates);
    const distance = IslamicCalculations.getDistanceToMakkah(coordinates);

    const result = { direction, distance };
    this.setCache(cacheKey, result, ISLAMIC_SERVICES_CONFIG.cache.qibla.ttl);
    return result;
  }

  /**
   * Get Islamic date with fallback
   */
  async getIslamicDate(date: Date = new Date()) {
    const cacheKey = `hijri-${date.toISOString().split('T')[0]}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Use local calculation for Hijri date
    const hijriDate = IslamicCalculations.gregorianToHijri(date);
    this.setCache(cacheKey, hijriDate, ISLAMIC_SERVICES_CONFIG.cache.islamicDate.ttl);
    return hijriDate;
  }

  /**
   * Add manual override (Admin/Moderator feature)
   */
  async addManualOverride(override: Omit<ManualOverride, 'id'>): Promise<string> {
    const id = `override-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const manualOverride: ManualOverride = { ...override, id };
    
    this.manualOverrides.set(id, manualOverride);
    
    // Clear affected cache entries
    const cacheKey = `prayer-${override.date}-${override.location.latitude}-${override.location.longitude}`;
    this.cache.delete(cacheKey);
    
    // TODO: Persist to database
    console.log('Manual override added:', id);
    
    return id;
  }

  /**
   * Get service health status
   */
  getServiceHealth(): ServiceHealth[] {
    return Array.from(this.serviceHealth.values());
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    return {
      cacheSize: this.cache.size,
      serviceHealth: this.getServiceHealth(),
      manualOverrides: this.manualOverrides.size,
      offlineSchedules: this.offlineSchedules.size,
      uptime: process.uptime(),
    };
  }

  // Private Methods

  private async fetchFromAladhan(request: PrayerTimesRequest): Promise<PrayerTimesResponse> {
    const { latitude = 43.6532, longitude = -79.3832 } = request;
    const date = request.date || new Date().toISOString().split('T')[0];
    const method = this.mapCalculationMethod(request.method || 'MWL');

    const url = `${ISLAMIC_SERVICES_CONFIG.primaryApi.baseUrl}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ISLAMIC_SERVICES_CONFIG.primaryApi.timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error(`API Error: ${data.status}`);
      }

      return {
        success: true,
        data: {
          date: data.data.date.gregorian.date,
          fajr: data.data.timings.Fajr.split(' ')[0],
          sunrise: data.data.timings.Sunrise.split(' ')[0],
          dhuhr: data.data.timings.Dhuhr.split(' ')[0],
          asr: data.data.timings.Asr.split(' ')[0],
          maghrib: data.data.timings.Maghrib.split(' ')[0],
          isha: data.data.timings.Isha.split(' ')[0],
          qibla: parseFloat(data.data.meta.qibla_direction || '0'),
          hijriDate: {
            day: parseInt(data.data.date.hijri.day),
            month: parseInt(data.data.date.hijri.month.number),
            year: parseInt(data.data.date.hijri.year),
            monthName: data.data.date.hijri.month.en,
            formatted: `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year} AH`
          },
          islamicDate: {
            day: parseInt(data.data.date.hijri.day),
            month: parseInt(data.data.date.hijri.month.number),
            year: parseInt(data.data.date.hijri.year),
            monthName: data.data.date.hijri.month.en,
            formatted: `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year} AH`
          },
          location: {
            latitude,
            longitude,
            city: data.data.meta.location?.city,
            country: data.data.meta.location?.country
          },
          method: data.data.meta.method.name
        }
      };
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private async fetchFromIslamicFinder(request: PrayerTimesRequest): Promise<PrayerTimesResponse> {
    const { latitude = 43.6532, longitude = -79.3832 } = request;
    const date = request.date || new Date().toISOString().split('T')[0];

    // IslamicFinder API implementation would go here
    // For now, we'll simulate the response structure
    throw new Error('IslamicFinder API not implemented yet');
  }

  private async calculateLocally(coordinates: Coordinates, date: Date, request: PrayerTimesRequest) {
    const prayerTimes = IslamicCalculations.calculatePrayerTimes(coordinates, date, {
      method: request.method as any || 'MWL',
      madhab: 'Shafi'
    });

    const qibla = IslamicCalculations.calculateQiblaDirection(coordinates);
    const hijriDate = IslamicCalculations.gregorianToHijri(date);

    return {
      date: prayerTimes.date,
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      qibla,
      hijriDate,
      islamicDate: hijriDate,
      location: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      },
      method: prayerTimes.method
    };
  }

  private async enhanceWithLocalCalculations(data: any, coordinates: Coordinates) {
    // Add Qibla direction if missing
    if (!data.qibla) {
      data.qibla = IslamicCalculations.calculateQiblaDirection(coordinates);
    }

    // Add Islamic date if missing
    if (!data.hijriDate && !data.islamicDate) {
      const hijriDate = IslamicCalculations.gregorianToHijri(new Date(data.date));
      data.hijriDate = hijriDate;
      data.islamicDate = hijriDate;
    }

    return data;
  }

  private getCoordinates(request: PrayerTimesRequest): Coordinates {
    return {
      latitude: request.latitude || ISLAMIC_SERVICES_CONFIG.offlineSchedule.fallbackLocation.latitude,
      longitude: request.longitude || ISLAMIC_SERVICES_CONFIG.offlineSchedule.fallbackLocation.longitude
    };
  }

  private getManualOverride(date: string, coordinates: Coordinates): ManualOverride | null {
    for (const override of this.manualOverrides.values()) {
      if (override.date === date && 
          override.approved &&
          override.validUntil > new Date() &&
          Math.abs(override.location.latitude - coordinates.latitude) < 0.1 &&
          Math.abs(override.location.longitude - coordinates.longitude) < 0.1) {
        return override;
      }
    }
    return null;
  }

  private async buildResponseFromManual(override: ManualOverride, coordinates: Coordinates, date: string) {
    const qibla = IslamicCalculations.calculateQiblaDirection(coordinates);
    const hijriDate = IslamicCalculations.gregorianToHijri(new Date(date));

    return {
      date,
      fajr: override.prayerTimes.fajr,
      sunrise: '06:30', // Default sunrise
      dhuhr: override.prayerTimes.dhuhr,
      asr: override.prayerTimes.asr,
      maghrib: override.prayerTimes.maghrib,
      isha: override.prayerTimes.isha,
      qibla,
      hijriDate,
      islamicDate: hijriDate,
      location: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      },
      method: 'Manual Override'
    };
  }

  private getFromOfflineSchedule(date: string, coordinates: Coordinates) {
    const key = `${coordinates.latitude.toFixed(2)}-${coordinates.longitude.toFixed(2)}`;
    const schedule = this.offlineSchedules.get(key);
    
    if (schedule && schedule[date]) {
      return schedule[date];
    }

    // Generate basic fallback if no offline schedule exists
    const fallbackData = IslamicCalculations.calculatePrayerTimes(coordinates, new Date(date));
    return {
      date: fallbackData.date,
      fajr: fallbackData.fajr,
      sunrise: fallbackData.sunrise,
      dhuhr: fallbackData.dhuhr,
      asr: fallbackData.asr,
      maghrib: fallbackData.maghrib,
      isha: fallbackData.isha,
      qibla: IslamicCalculations.calculateQiblaDirection(coordinates),
      hijriDate: IslamicCalculations.gregorianToHijri(new Date(date)),
      location: coordinates,
      method: 'Offline Fallback'
    };
  }

  private initializeHealthMonitoring() {
    // Initialize service health tracking
    ['aladhan', 'islamicfinder', 'local', 'offline'].forEach(service => {
      this.serviceHealth.set(service, {
        service,
        healthy: true,
        lastChecked: new Date(),
        consecutiveFailures: 0
      });
    });

    // Start health check interval
    setInterval(() => this.performHealthChecks(), ISLAMIC_SERVICES_CONFIG.monitoring.healthCheckInterval);
  }

  private preloadOfflineSchedules() {
    // Preload prayer times for major locations
    Object.entries(ISLAMIC_SERVICES_CONFIG.defaultLocations).forEach(([city, coords]) => {
      const schedule: Record<string, any> = {};
      
      // Generate 30 days of prayer times
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const times = IslamicCalculations.calculatePrayerTimes(coords, date);
        schedule[dateStr] = {
          ...times,
          qibla: IslamicCalculations.calculateQiblaDirection(coords),
          hijriDate: IslamicCalculations.gregorianToHijri(date),
          location: coords
        };
      }
      
      this.offlineSchedules.set(`${coords.lat.toFixed(2)}-${coords.lng.toFixed(2)}`, schedule);
    });
  }

  private async performHealthChecks() {
    // Check primary API health
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${ISLAMIC_SERVICES_CONFIG.primaryApi.baseUrl}/status`, {
        signal: controller.signal
      });
      
      this.updateServiceHealth('aladhan', response.ok);
    } catch (error) {
      this.updateServiceHealth('aladhan', false);
    }
  }

  private updateServiceHealth(service: string, healthy: boolean, responseTime?: number) {
    const current = this.serviceHealth.get(service);
    if (current) {
      current.healthy = healthy;
      current.lastChecked = new Date();
      current.responseTime = responseTime;
      current.consecutiveFailures = healthy ? 0 : current.consecutiveFailures + 1;
      
      // Alert if service is consistently failing
      if (current.consecutiveFailures >= ISLAMIC_SERVICES_CONFIG.monitoring.alertThresholds.consecutiveFailures) {
        this.sendAlert(service, current);
      }
    }
  }

  private sendAlert(service: string, health: ServiceHealth) {
    console.error(`ALERT: Service ${service} has failed ${health.consecutiveFailures} consecutive times`);
    // TODO: Implement actual alerting (email, webhook, etc.)
  }

  private mapCalculationMethod(method: string): number {
    const methodMap: Record<string, number> = {
      'MWL': 3,
      'ISNA': 2,
      'Egypt': 5,
      'Makkah': 4,
      'Karachi': 1,
      'Tehran': 7,
      'Jafari': 0
    };
    return methodMap[method] || 3;
  }

  private getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

// Export singleton instance
export const islamicFallbackService = new IslamicFallbackService();