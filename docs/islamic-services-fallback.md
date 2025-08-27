# Islamic Services Fallback Procedures
## Prayer Times & Islamic Feature Resilience Strategy

**Document Version:** 1.0  
**Created:** January 2025  
**Priority:** CRITICAL - Islamic features must never fail  
**Owner:** Islamic Advisory Board + Technical Team

---

## Executive Summary

This document outlines comprehensive fallback procedures for all Islamic services to ensure uninterrupted access to prayer times, Qibla direction, and Islamic calendar features. Given the critical nature of these services for the Muslim community, multiple redundancy layers are implemented.

## 1. Prayer Times Fallback Strategy

### 1.1 Current Implementation Analysis

**Primary Service:** Aladhan API (https://api.aladhan.com/v1)
```typescript
// Current prayer times implementation
ALADHAN_API_URL: https://api.aladhan.com/v1

// Existing caching (good foundation)
- Cache TTL: 1 hour
- Cache location: Database (PrayerSchedule table)
- Error handling: Basic API error responses
```

### 1.2 Multi-Layer Fallback Architecture

```yaml
Prayer Times Fallback Layers:
  Layer 1: Aladhan API (Primary)
  Layer 2: IslamicFinder API (Secondary) 
  Layer 3: Local Calculation Library (Tertiary)
  Layer 4: Manual Override System (Emergency)
  Layer 5: Offline Static Schedule (Critical Backup)
```

#### Layer 1: Aladhan API (Primary)
```typescript
// Enhanced primary API with retry logic
const fetchPrayerTimesAladhan = async (date: string, location: LocationConfig) => {
  const maxRetries = 3;
  const retryDelay = [1000, 2000, 4000]; // Progressive backoff

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${ALADHAN_API_URL}/timings/${date}`, {
        params: { 
          latitude: location.lat, 
          longitude: location.lng,
          method: location.calculationMethod || 2 // Islamic Society of North America
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Aladhan API attempt ${attempt + 1} failed:`, error);
      if (attempt < maxRetries - 1) {
        await delay(retryDelay[attempt]);
      }
    }
  }
  
  throw new Error('Aladhan API completely unavailable');
};
```

#### Layer 2: IslamicFinder API (Secondary)
```typescript
// Secondary API implementation
const fetchPrayerTimesIslamicFinder = async (date: string, location: LocationConfig) => {
  try {
    const response = await fetch('https://api.islamicfinder.us/v1/prayer-times', {
      params: {
        date: date,
        latitude: location.lat,
        longitude: location.lng,
        juristic_method: location.juristicMethod || 1,
        calculation_method: location.calculationMethod || 2
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      return convertIslamicFinderFormat(data); // Convert to standard format
    }
  } catch (error) {
    console.warn('IslamicFinder API failed:', error);
    throw new Error('Secondary API unavailable');
  }
};
```

#### Layer 3: Local Calculation Library
```typescript
// Local calculation using astronomical algorithms
import { calculatePrayerTimes } from 'prayer-times-calculator';

const calculatePrayerTimesLocally = (date: Date, location: LocationConfig) => {
  const prayerTimes = calculatePrayerTimes(date, {
    latitude: location.lat,
    longitude: location.lng,
    elevation: location.elevation || 0,
    calculationMethod: 'ISNA', // Islamic Society of North America
    asrMethod: 'Standard', // Standard Asr calculation
    juristicMethod: 'Shafi' // Default to Shafi methodology
  });
  
  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha
  };
};
```

#### Layer 4: Manual Override System
```typescript
// Emergency manual override capability
interface ManualPrayerOverride {
  date: string;
  location: string;
  times: PrayerTimes;
  authorizedBy: string; // Islamic authority or admin
  reason: string;
  expiresAt: Date;
}

const applyManualOverride = async (override: ManualPrayerOverride) => {
  // Store in high-priority cache with Islamic authority validation
  await prisma.prayerSchedule.upsert({
    where: { date: new Date(override.date) },
    create: {
      ...override.times,
      date: new Date(override.date),
      location: override.location,
      isManualOverride: true,
      authorizedBy: override.authorizedBy,
      createdAt: new Date()
    },
    update: {
      ...override.times,
      isManualOverride: true,
      authorizedBy: override.authorizedBy,
      updatedAt: new Date()
    }
  });
};
```

#### Layer 5: Offline Static Schedule
```typescript
// Pre-calculated annual prayer schedule for emergencies
interface AnnualPrayerSchedule {
  year: number;
  location: string;
  schedule: Array<{
    date: string;
    times: PrayerTimes;
    calculationMethod: string;
    islamicDate: string;
  }>;
  calculatedBy: string;
  islamicAuthorityApproved: boolean;
}

// Load pre-calculated schedule for complete API failure
const loadOfflineSchedule = async (date: string, location: string) => {
  const year = new Date(date).getFullYear();
  const offlineSchedule = await loadAnnualSchedule(year, location);
  
  if (offlineSchedule && offlineSchedule.islamicAuthorityApproved) {
    const daySchedule = offlineSchedule.schedule.find(s => s.date === date);
    return daySchedule?.times || null;
  }
  
  return null;
};
```

### 1.3 Integrated Fallback Implementation

```typescript
// Master prayer times function with complete fallback
export const getPrayerTimes = async (date: string, location: LocationConfig): Promise<PrayerTimes> => {
  // Check for manual override first (highest priority)
  const manualOverride = await checkManualOverride(date, location);
  if (manualOverride) {
    return manualOverride;
  }

  // Check cache (unexpired)
  const cached = await getCachedPrayerTimes(date, location);
  if (cached && !isCacheExpired(cached, 1)) { // 1 hour TTL
    return cached.times;
  }

  // Try fallback layers in sequence
  const fallbackMethods = [
    () => fetchPrayerTimesAladhan(date, location),
    () => fetchPrayerTimesIslamicFinder(date, location),
    () => calculatePrayerTimesLocally(new Date(date), location),
    () => loadOfflineSchedule(date, location.name)
  ];

  for (const [index, method] of fallbackMethods.entries()) {
    try {
      const result = await method();
      if (result) {
        // Cache successful result
        await cachePrayerTimes(date, location, result, `fallback_layer_${index + 1}`);
        
        // Log fallback usage for monitoring
        await logPrayerTimeFallback(date, location, index + 1);
        
        return result;
      }
    } catch (error) {
      console.warn(`Prayer times fallback layer ${index + 1} failed:`, error);
    }
  }

  // Complete failure - should never happen with proper offline schedule
  throw new Error('All prayer time sources failed - contact Islamic authority');
};
```

## 2. Qibla Direction Fallback

### 2.1 Multi-Source Qibla Calculation
```typescript
const getQiblaDirection = async (location: LocationConfig): Promise<number> => {
  const methods = [
    () => calculateQiblaAstronomically(location), // Primary: Astronomical calculation
    () => fetchQiblaFromAPI(location),            // Secondary: External API
    () => getQiblaFromStaticTable(location)       // Tertiary: Pre-calculated table
  ];

  for (const method of methods) {
    try {
      const direction = await method();
      if (direction && direction >= 0 && direction <= 360) {
        return direction;
      }
    } catch (error) {
      console.warn('Qibla calculation method failed:', error);
    }
  }

  // Default to Mecca bearing (approximate for major cities)
  return getApproximateQibla(location);
};

const calculateQiblaAstronomically = (location: LocationConfig): number => {
  const meccaLat = 21.4225;  // Kaaba latitude
  const meccaLng = 39.8262;  // Kaaba longitude
  
  const deltaLng = meccaLng - location.lng;
  const qibla = Math.atan2(
    Math.sin(deltaLng * Math.PI / 180),
    Math.cos(location.lat * Math.PI / 180) * Math.tan(meccaLat * Math.PI / 180) - 
    Math.sin(location.lat * Math.PI / 180) * Math.cos(deltaLng * Math.PI / 180)
  );
  
  return (qibla * 180 / Math.PI + 360) % 360;
};
```

## 3. Islamic Calendar Fallback

### 3.1 Hijri Date Calculation Resilience
```typescript
const getIslamicDate = async (gregorianDate: Date): Promise<HijriDate> => {
  const methods = [
    () => calculateHijriAstronomically(gregorianDate), // Primary: Astronomical
    () => fetchHijriFromAPI(gregorianDate),           // Secondary: External API  
    () => getHijriFromLookupTable(gregorianDate)      // Tertiary: Pre-calculated
  ];

  for (const method of methods) {
    try {
      const hijriDate = await method();
      if (hijriDate && validateHijriDate(hijriDate)) {
        return hijriDate;
      }
    } catch (error) {
      console.warn('Hijri date calculation failed:', error);
    }
  }

  throw new Error('Unable to determine Islamic date');
};
```

## 4. Monitoring & Alerting

### 4.1 Fallback Monitoring System
```typescript
// Monitor fallback usage and alert on patterns
const monitorIslamicServices = async () => {
  const metrics = await gatherServiceMetrics();
  
  // Alert conditions
  if (metrics.primaryAPIFailureRate > 0.1) { // 10% failure rate
    await sendAlert('Islamic Services', 'Primary API degraded', 'HIGH');
  }
  
  if (metrics.fallbackLayerUsage.layer_3 > 0.05) { // Using local calculation > 5%
    await sendAlert('Islamic Services', 'External APIs struggling', 'MEDIUM');
  }
  
  if (metrics.manualOverridesActive > 0) {
    await sendAlert('Islamic Services', 'Manual overrides active', 'INFO');
  }
};

// Islamic feature health check
const islamicServicesHealthCheck = async (): Promise<ServiceHealthStatus> => {
  const checks = [
    testPrayerTimeCalculation(),
    testQiblaCalculation(), 
    testHijriDateCalculation(),
    validateIslamicContentAccuracy()
  ];
  
  const results = await Promise.allSettled(checks);
  return aggregateHealthStatus(results);
};
```

## 5. Emergency Response Procedures

### 5.1 Critical Islamic Service Failure Protocol

**Immediate Response (0-15 minutes):**
1. Activate manual override system
2. Contact Islamic advisory board 
3. Notify community via all available channels
4. Switch to offline prayer schedule

**Short-term Response (15 minutes - 2 hours):**
1. Islamic authority validates manual prayer times
2. Technical team investigates root cause
3. Alternative API sources activated
4. Community updated on resolution timeline

**Recovery Procedures:**
1. Validate all Islamic calculations with authority
2. Test fallback systems under load
3. Update community with accurate information
4. Document incident for future improvement

### 5.2 Islamic Authority Contact Information
```yaml
Primary Islamic Authority:
  Name: [Imam/Scholar Name]
  Role: Islamic Advisory Board Chairman
  Contact: [Phone/Email - CONFIDENTIAL]
  Response Time: 15 minutes during prayer times
  
Secondary Contacts:
  - Islamic Center Leadership
  - Local Muslim Scholars
  - Islamic Organizations
```

## 6. Testing & Validation

### 6.1 Fallback Testing Procedures
```typescript
// Automated fallback testing
const testIslamicServiceFallbacks = async () => {
  const tests = [
    testPrimaryAPIFailure(),
    testSecondaryAPIFailure(), 
    testCompleteAPIFailure(),
    testManualOverrideSystem(),
    testOfflineScheduleLoading(),
    validateIslamicAccuracy()
  ];
  
  const results = await Promise.all(tests);
  return generateFallbackTestReport(results);
};

// Monthly Islamic accuracy validation
const validateIslamicAccuracy = async () => {
  const referenceDate = new Date();
  const location = { lat: 40.7128, lng: -74.0060, name: "New York" }; // Example
  
  const [calculated, authoritative] = await Promise.all([
    getPrayerTimes(referenceDate.toISOString(), location),
    getAuthoritativePrayerTimes(referenceDate, location) // Manual validation
  ]);
  
  return compareIslamicAccuracy(calculated, authoritative);
};
```

## 7. Implementation Checklist

### 7.1 Technical Implementation
- [ ] Install prayer-times-calculator library
- [ ] Implement IslamicFinder API integration  
- [ ] Create manual override admin interface
- [ ] Generate annual offline prayer schedules
- [ ] Set up fallback monitoring and alerting
- [ ] Test all fallback layers under failure conditions

### 7.2 Islamic Authority Validation
- [ ] Islamic advisory board reviews all calculation methods
- [ ] Prayer time accuracy validated for local timezone
- [ ] Qibla direction verified for community location
- [ ] Hijri calendar calculations approved
- [ ] Emergency contact protocols established
- [ ] Manual override authorization procedures defined

### 7.3 Community Communication
- [ ] Fallback procedures explained in user documentation
- [ ] Emergency notification system tested
- [ ] Community expectations set for service reliability
- [ ] Islamic feature accuracy guarantees documented

---

**Critical Success Criteria:**
1. **99.9% Islamic service uptime** - Prayer times always available
2. **<1 minute accuracy** - Prayer times within Islamic acceptable variance  
3. **<30 second failover** - Transparent fallback activation
4. **Islamic authority approval** - All calculations verified by religious authority
5. **Community trust maintained** - Zero disruption to daily Islamic practices

This fallback system ensures that Islamic features remain available and accurate even during complete external service failures, maintaining the trust and religious obligations of the Muslim community.