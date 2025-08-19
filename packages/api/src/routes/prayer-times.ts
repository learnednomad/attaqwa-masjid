import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { cache } from 'hono/cache';

const prayerTimes = new Hono();

// Validation schemas
const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  city: z.string().default('Toronto'),
  country: z.string().default('Canada'),
  method: z.string().default('2'), // Islamic Society of North America
  school: z.enum(['1', '2', '3', '4', '5', '7', '8', '9', '10', '11', '12']).optional().default('2'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const qiblaSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const islamicDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adjustment: z.number().int().min(-2).max(2).default(0),
});

// In-memory cache for prayer times
const prayerTimesCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Cache helper functions
function getCacheKey(city: string, country: string, date: string, method: string): string {
  return `${city}-${country}-${date}-${method}`;
}

function getCachedData(key: string) {
  const cached = prayerTimesCache.get(key);
  if (!cached) return null;
  
  const { data, timestamp } = cached;
  if (Date.now() - timestamp > CACHE_TTL) {
    prayerTimesCache.delete(key);
    return null;
  }
  
  return data;
}

function setCachedData(key: string, data: any) {
  prayerTimesCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Islamic calendar helper functions
function getIslamicDate(gregorianDate: Date, adjustment = 0): { day: number; month: number; year: number; monthName: string } {
  // Simplified Islamic date calculation (in production, use a proper Islamic calendar library)
  const islamicEpoch = new Date('622-07-16');
  const daysDiff = Math.floor((gregorianDate.getTime() - islamicEpoch.getTime()) / (1000 * 60 * 60 * 24));
  const islamicDays = daysDiff + adjustment;
  
  // Approximate calculation (354 days per Islamic year)
  const islamicYear = Math.floor(islamicDays / 354) + 1;
  const remainingDays = islamicDays % 354;
  
  // Approximate month calculation (29.5 days per month)
  const islamicMonth = Math.floor(remainingDays / 29.5) + 1;
  const islamicDay = Math.floor(remainingDays % 29.5) + 1;
  
  const monthNames = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
    'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
  ];
  
  return {
    day: Math.max(1, Math.min(30, islamicDay)),
    month: Math.max(1, Math.min(12, islamicMonth)),
    year: islamicYear,
    monthName: monthNames[Math.max(0, Math.min(11, islamicMonth - 1))] || 'Muharram'
  };
}

function calculateQiblaDirection(lat: number, lng: number): number {
  // Kaaba coordinates
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  
  const dLng = (kaabaLng - lng) * Math.PI / 180;
  const lat1 = lat * Math.PI / 180;
  const lat2 = kaabaLat * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

// Mock prayer times data
const mockPrayerTimes: Record<string, {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  qibla: number;
}> = {
  'Toronto-Canada-2024-01-25': {
    date: '2024-01-25',
    fajr: '06:12',
    sunrise: '07:42',
    dhuhr: '12:34',
    asr: '15:02',
    maghrib: '17:26',
    isha: '18:56',
    qibla: 58.5,
  },
  'Toronto-Canada-2024-01-26': {
    date: '2024-01-26',
    fajr: '06:11',
    sunrise: '07:41',
    dhuhr: '12:35',
    asr: '15:03',
    maghrib: '17:27',
    isha: '18:57',
    qibla: 58.5,
  },
};

// Enhanced API integration with caching and better error handling
async function fetchPrayerTimesFromAladhan(
  city: string, 
  country: string, 
  date: string, 
  method: string,
  latitude?: number,
  longitude?: number
) {
  const cacheKey = getCacheKey(city, country, date, method);
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    let url: string;
    
    if (latitude && longitude) {
      url = `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    } else {
      url = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AttaqwaMasjid/1.0',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(`API error: ${data.status || 'Unknown error'}`);
    }
    
    const timings = data.data.timings;
    const meta = data.data.meta;
    const gregorianDate = new Date(date);
    const islamicDate = getIslamicDate(gregorianDate);
    
    // Calculate Qibla direction if coordinates provided
    let qiblaDirection = meta.qibla?.direction || 58.5;
    if (latitude && longitude) {
      qiblaDirection = calculateQiblaDirection(latitude, longitude);
    }
    
    const result = {
      date,
      fajr: timings.Fajr?.split(' ')[0] || timings.Fajr,
      sunrise: timings.Sunrise?.split(' ')[0] || timings.Sunrise,
      dhuhr: timings.Dhuhr?.split(' ')[0] || timings.Dhuhr,
      asr: timings.Asr?.split(' ')[0] || timings.Asr,
      maghrib: timings.Maghrib?.split(' ')[0] || timings.Maghrib,
      isha: timings.Isha?.split(' ')[0] || timings.Isha,
      qibla: Math.round(qiblaDirection * 10) / 10,
      location: {
        city: meta.timezone?.split('/')[1]?.replace('_', ' ') || city,
        country: country,
        timezone: meta.timezone || 'UTC',
        latitude: meta.latitude || latitude,
        longitude: meta.longitude || longitude
      },
      islamicDate: {
        day: islamicDate.day,
        month: islamicDate.month,
        year: islamicDate.year,
        monthName: islamicDate.monthName,
        formatted: `${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year} AH`
      },
      method: {
        id: parseInt(method),
        name: meta.method?.name || 'Unknown Method'
      }
    };
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return result;
    
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    
    // Enhanced fallback logic
    const fallbackKey = `${city}-${country}-${date}`;
    const fallback = mockPrayerTimes[fallbackKey] || mockPrayerTimes['Toronto-Canada-2024-01-25'];
    
    // Add Islamic date to fallback
    const gregorianDate = new Date(date);
    const islamicDate = getIslamicDate(gregorianDate);
    
    return {
      ...fallback,
      location: {
        city,
        country,
        timezone: 'UTC',
        latitude: latitude || null,
        longitude: longitude || null
      },
      islamicDate: {
        day: islamicDate.day,
        month: islamicDate.month,
        year: islamicDate.year,
        monthName: islamicDate.monthName,
        formatted: `${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year} AH`
      },
      method: {
        id: parseInt(method),
        name: 'Fallback Method'
      },
      isFromCache: false,
      isFromFallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// GET /api/prayer-times
prayerTimes.get('/', 
  cache({
    cacheName: 'prayer-times',
    cacheControl: 'max-age=3600, s-maxage=3600', // 1 hour
    vary: ['Accept-Encoding'],
  }),
  zValidator('query', querySchema), 
  async (c) => {
    const { date, city, country, method, school, latitude, longitude } = c.req.valid('query');
    const queryDate = date || new Date().toISOString().split('T')[0];
    const calculationMethod = school || method;
    
    try {
      const prayerData = await fetchPrayerTimesFromAladhan(
        city, 
        country, 
        queryDate, 
        calculationMethod,
        latitude,
        longitude
      );
      
      // Check if this is a mobile request and transform accordingly
      const userAgent = c.req.header('User-Agent') || '';
      const isIslamicApp = c.req.header('X-Islamic-App') === 'AttaqwaMasjid';
      const isMobile = isIslamicApp || ['Mobile', 'Android', 'iPhone', 'iPad'].some(ua => userAgent.includes(ua));
      
      let responseData = prayerData;
      let headers: Record<string, string> = {
        'Cache-Control': 'public, max-age=3600',
        'ETag': `"${Buffer.from(JSON.stringify(prayerData)).toString('base64').slice(0, 16)}"`
      };

      if (isMobile) {
        // Transform for mobile app compatibility
        const prayers = [
          { name: 'Fajr', time: prayerData.fajr, adhan: prayerData.fajr, iqamah: '+10 min' },
          { name: 'Dhuhr', time: prayerData.dhuhr, adhan: prayerData.dhuhr, iqamah: '+10 min' },
          { name: 'Asr', time: prayerData.asr, adhan: prayerData.asr, iqamah: '+10 min' },
          { name: 'Maghrib', time: prayerData.maghrib, adhan: prayerData.maghrib, iqamah: '+5 min' },
          { name: 'Isha', time: prayerData.isha, adhan: prayerData.isha, iqamah: '+10 min' }
        ];

        responseData = {
          ...prayerData,
          hijriDate: prayerData.islamicDate?.formatted || `${prayerData.islamicDate?.day || 1} ${prayerData.islamicDate?.monthName || 'Muharram'} ${prayerData.islamicDate?.year || 1446} AH`,
          sunset: prayerData.maghrib, // Use maghrib for sunset
          prayers,
          _metadata: {
            isOffline: false,
            source: prayerData.isFromFallback ? 'fallback' : (prayerData.isFromCache ? 'cache' : 'api'),
            location: prayerData.location ? `${prayerData.location.city}, ${prayerData.location.country}` : 'Unknown',
            lastUpdated: new Date().toISOString(),
            accuracy: prayerData.isFromFallback ? 'fallback' : 'precise',
            cacheExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }
        };

        // Add mobile-specific headers
        headers['X-Mobile-Optimized'] = 'true';
        headers['X-Islamic-App-Compatible'] = 'true';
        headers['X-Islamic-Content'] = 'prayer-times';
        headers['X-Hijri-Date'] = responseData.hijriDate;
      }
      
      return c.json({
        data: responseData,
        success: true,
        cached: prayerData.isFromCache || false,
        timestamp: new Date().toISOString(),
        ...(isMobile && { _mobile: { optimized: true, version: '1.0', compatibility: 'mobile-optimized' } })
      }, 200, headers);
    } catch (error) {
      console.error('Prayer times error:', error);
      return c.json({
        error: 'Failed to fetch prayer times',
        message: 'Please try again later',
        success: false,
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// GET /api/prayer-times/week
prayerTimes.get('/week', 
  cache({
    cacheName: 'prayer-times-week',
    cacheControl: 'max-age=7200, s-maxage=7200', // 2 hours
  }),
  zValidator('query', querySchema.omit({ date: true })), 
  async (c) => {
    const { city, country, method, school, latitude, longitude } = c.req.valid('query');
    const calculationMethod = school || method;
    
    try {
      const weekPrayerTimes = [];
      const today = new Date();
      
      // Batch fetch with error handling for individual days
      const promises = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        promises.push(
          fetchPrayerTimesFromAladhan(city, country, dateString, calculationMethod, latitude, longitude)
            .catch(error => {
              console.error(`Error fetching prayer times for ${dateString}:`, error);
              return null; // Continue with other days
            })
        );
      }
      
      const results = await Promise.all(promises);
      const validResults = results.filter(result => result !== null);
      
      if (validResults.length === 0) {
        throw new Error('Failed to fetch prayer times for any day this week');
      }
      
      return c.json({
        data: validResults,
        success: true,
        totalDays: 7,
        successfulDays: validResults.length,
        timestamp: new Date().toISOString()
      }, 200, {
        'Cache-Control': 'public, max-age=7200'
      });
    } catch (error) {
      console.error('Weekly prayer times error:', error);
      return c.json({
        error: 'Failed to fetch weekly prayer times',
        message: 'Please try again later',
        success: false,
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// GET /api/prayer-times/month
prayerTimes.get('/month', 
  cache({
    cacheName: 'prayer-times-month',
    cacheControl: 'max-age=86400, s-maxage=86400', // 24 hours
  }),
  zValidator('query', querySchema.extend({
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  })), 
  async (c) => {
    const { city, country, method, school, month, latitude, longitude } = c.req.valid('query');
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const calculationMethod = school || method;
    
    try {
      const [year, monthNum] = targetMonth.split('-').map(Number);
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      
      // Batch fetch with concurrency limit to avoid overwhelming the API
      const batchSize = 5;
      const monthPrayerTimes = [];
      
      for (let startDay = 1; startDay <= daysInMonth; startDay += batchSize) {
        const endDay = Math.min(startDay + batchSize - 1, daysInMonth);
        const promises = [];
        
        for (let day = startDay; day <= endDay; day++) {
          const dateString = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          promises.push(
            fetchPrayerTimesFromAladhan(city, country, dateString, calculationMethod, latitude, longitude)
              .catch(error => {
                console.error(`Error fetching prayer times for ${dateString}:`, error);
                return null;
              })
          );
        }
        
        const batchResults = await Promise.all(promises);
        monthPrayerTimes.push(...batchResults.filter(result => result !== null));
        
        // Small delay between batches to be respectful to the API
        if (endDay < daysInMonth) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (monthPrayerTimes.length === 0) {
        throw new Error('Failed to fetch prayer times for any day this month');
      }
      
      return c.json({
        data: monthPrayerTimes,
        success: true,
        month: targetMonth,
        totalDays: daysInMonth,
        successfulDays: monthPrayerTimes.length,
        timestamp: new Date().toISOString()
      }, 200, {
        'Cache-Control': 'public, max-age=86400'
      });
    } catch (error) {
      console.error('Monthly prayer times error:', error);
      return c.json({
        error: 'Failed to fetch monthly prayer times',
        message: 'Please try again later',
        success: false,
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// GET /api/prayer-times/qibla
prayerTimes.get('/qibla', 
  zValidator('query', qiblaSchema), 
  async (c) => {
    const { latitude, longitude } = c.req.valid('query');
    
    try {
      const qiblaDirection = calculateQiblaDirection(latitude, longitude);
      
      return c.json({
        data: {
          latitude,
          longitude,
          qiblaDirection: Math.round(qiblaDirection * 10) / 10,
          compassBearing: Math.round(qiblaDirection),
          kaaba: {
            latitude: 21.4225,
            longitude: 39.8262
          }
        },
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Qibla calculation error:', error);
      return c.json({
        error: 'Failed to calculate Qibla direction',
        message: 'Please check your coordinates and try again',
        success: false,
        timestamp: new Date().toISOString()
      }, 400);
    }
  }
);

// GET /api/prayer-times/islamic-date
prayerTimes.get('/islamic-date', 
  zValidator('query', islamicDateSchema), 
  async (c) => {
    const { date, adjustment } = c.req.valid('query');
    const queryDate = date ? new Date(date) : new Date();
    
    try {
      const islamicDate = getIslamicDate(queryDate, adjustment);
      
      return c.json({
        data: {
          gregorianDate: queryDate.toISOString().split('T')[0],
          islamicDate: {
            day: islamicDate.day,
            month: islamicDate.month,
            year: islamicDate.year,
            monthName: islamicDate.monthName,
            formatted: islamicDate.formatted
          },
          adjustment
        },
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Islamic date conversion error:', error);
      return c.json({
        error: 'Failed to convert Islamic date',
        message: 'Please check your date format and try again',
        success: false,
        timestamp: new Date().toISOString()
      }, 400);
    }
  }
);

// GET /api/prayer-times/next-prayer
prayerTimes.get('/next-prayer', 
  zValidator('query', querySchema.omit({ date: true })), 
  async (c) => {
    const { city, country, method, school, latitude, longitude } = c.req.valid('query');
    const calculationMethod = school || method;
    
    try {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
      
      const todayPrayers = await fetchPrayerTimesFromAladhan(
        city, 
        country, 
        currentDate, 
        calculationMethod,
        latitude,
        longitude
      );
      
      const prayerNames = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      const prayerTimes = prayerNames.map(name => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        time: todayPrayers[name],
        passed: currentTime > todayPrayers[name]
      }));
      
      // Find next prayer today
      let nextPrayer = prayerTimes.find(prayer => !prayer.passed);
      
      // If no prayer left today, get tomorrow's Fajr
      if (!nextPrayer) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];
        
        const tomorrowPrayers = await fetchPrayerTimesFromAladhan(
          city, 
          country, 
          tomorrowDate, 
          calculationMethod,
          latitude,
          longitude
        );
        
        nextPrayer = {
          name: 'Fajr',
          time: tomorrowPrayers.fajr,
          date: tomorrowDate,
          passed: false
        };
      }
      
      return c.json({
        data: {
          currentTime,
          currentDate,
          nextPrayer,
          allPrayersToday: prayerTimes,
          location: todayPrayers.location,
          islamicDate: todayPrayers.islamicDate
        },
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Next prayer calculation error:', error);
      return c.json({
        error: 'Failed to calculate next prayer',
        message: 'Please try again later',
        success: false,
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
);

// Health check endpoint for prayer times service
prayerTimes.get('/health', async (c) => {
  const cacheSize = prayerTimesCache.size;
  const testCity = 'Toronto';
  const testCountry = 'Canada';
  const testDate = new Date().toISOString().split('T')[0];
  
  try {
    // Test API connectivity
    const testResponse = await fetchPrayerTimesFromAladhan(testCity, testCountry, testDate, '2');
    
    return c.json({
      status: 'healthy',
      service: 'prayer-times',
      cache: {
        size: cacheSize,
        ttl: `${CACHE_TTL / 1000 / 60} minutes`
      },
      externalApi: {
        status: 'operational',
        lastTested: new Date().toISOString()
      },
      features: [
        'daily-prayer-times',
        'weekly-prayer-times', 
        'monthly-prayer-times',
        'qibla-direction',
        'islamic-calendar',
        'next-prayer-calculation'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      status: 'degraded',
      service: 'prayer-times',
      cache: {
        size: cacheSize,
        ttl: `${CACHE_TTL / 1000 / 60} minutes`
      },
      externalApi: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastTested: new Date().toISOString()
      },
      fallback: 'mock-data-available',
      timestamp: new Date().toISOString()
    }, 503);
  }
});

export { prayerTimes as prayerTimeRoutes };