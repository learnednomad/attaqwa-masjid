import { Context, Next } from 'hono';

/**
 * Mobile API Response Transformer Middleware
 * Transforms API responses to be compatible with mobile app expectations
 */

interface MobilePrayerTime {
  name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  time: string;
  adhan: string;
  iqamah: string;
}

interface MobileDailyPrayerTimes {
  date: string;
  hijriDate: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sunset: string;
  qibla: number;
  prayers: MobilePrayerTime[];
  _metadata?: {
    isOffline: boolean;
    source: 'api' | 'fallback' | 'cache';
    location: string;
    lastUpdated: string;
    accuracy: 'precise' | 'approximate' | 'fallback';
    cacheExpiry?: string;
  };
}

/**
 * Check if the request is from a mobile app
 */
function isMobileRequest(c: Context): boolean {
  const userAgent = c.req.header('User-Agent') || '';
  const isIslamicApp = c.req.header('X-Islamic-App') === 'AttaqwaMasjid';
  const mobileIndicators = [
    'AttaqwaMasjid-Mobile',
    'Mobile',
    'Android',
    'iPhone',
    'iPad',
    'react-native'
  ];
  
  return isIslamicApp || mobileIndicators.some(indicator => 
    userAgent.includes(indicator)
  );
}

/**
 * Transform prayer times response for mobile compatibility
 */
function transformPrayerTimesForMobile(data: any): MobileDailyPrayerTimes {
  // Create prayers array as expected by mobile app
  const prayers: MobilePrayerTime[] = [
    {
      name: 'Fajr',
      time: data.fajr,
      adhan: data.fajr,
      iqamah: '+10 min'
    },
    {
      name: 'Dhuhr',
      time: data.dhuhr,
      adhan: data.dhuhr,
      iqamah: '+10 min'
    },
    {
      name: 'Asr',
      time: data.asr,
      adhan: data.asr,
      iqamah: '+10 min'
    },
    {
      name: 'Maghrib',
      time: data.maghrib,
      adhan: data.maghrib,
      iqamah: '+5 min'
    },
    {
      name: 'Isha',
      time: data.isha,
      adhan: data.isha,
      iqamah: '+10 min'
    }
  ];

  // Transform Islamic date format
  const hijriDate = data.islamicDate?.formatted || 
    `${data.islamicDate?.day || 1} ${data.islamicDate?.monthName || 'Muharram'} ${data.islamicDate?.year || 1446} AH`;

  // Create mobile-compatible response
  const mobileResponse: MobileDailyPrayerTimes = {
    date: data.date,
    hijriDate,
    fajr: data.fajr,
    sunrise: data.sunrise,
    dhuhr: data.dhuhr,
    asr: data.asr,
    maghrib: data.maghrib,
    isha: data.isha,
    sunset: data.maghrib, // Use maghrib time for sunset
    qibla: data.qibla,
    prayers,
    _metadata: {
      isOffline: false,
      source: data.isFromFallback ? 'fallback' : (data.isFromCache ? 'cache' : 'api'),
      location: data.location ? `${data.location.city}, ${data.location.country}` : 'Unknown',
      lastUpdated: new Date().toISOString(),
      accuracy: data.isFromFallback ? 'fallback' : 'precise',
      cacheExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    }
  };

  return mobileResponse;
}

/**
 * Transform general response for mobile optimization
 */
function transformGeneralResponse(data: any): any {
  // Add mobile-specific metadata to all responses
  return {
    ...data,
    _mobile: {
      optimized: true,
      version: '1.0',
      timestamp: new Date().toISOString(),
      compressible: true
    }
  };
}

/**
 * Main mobile transformer middleware
 */
export async function mobileTransformer(c: Context, next: Next) {
  // Only transform for mobile requests
  if (!isMobileRequest(c)) {
    await next();
    return;
  }

  await next();

  // Get the response body by cloning to avoid stream conflicts
  try {
    const response = c.res.clone();
    const originalBody = await response.json();
    
    if (!originalBody) {
      return;
    }

  // Check if this is a prayer times endpoint
  const url = c.req.url;
  const isPrayerTimesEndpoint = url.includes('/prayer-times') && !url.includes('/week') && !url.includes('/month');

  let transformedData;

  if (isPrayerTimesEndpoint && originalBody.data) {
    // Transform prayer times specifically for mobile
    transformedData = {
      ...originalBody,
      data: transformPrayerTimesForMobile(originalBody.data),
      _mobile: {
        transformedAt: new Date().toISOString(),
        compatibility: 'mobile-optimized',
        version: '1.0'
      }
    };
  } else {
    // Transform general response
    transformedData = transformGeneralResponse(originalBody);
  }

  // Add mobile-optimized headers
  c.res.headers.set('X-Mobile-Optimized', 'true');
  c.res.headers.set('X-Islamic-App-Compatible', 'true');
  c.res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  
  // For prayer times, add Islamic context headers
  if (isPrayerTimesEndpoint) {
    c.res.headers.set('X-Islamic-Content', 'prayer-times');
    c.res.headers.set('X-Hijri-Date', transformedData.data.hijriDate);
  }

    // Return transformed response
    return c.json(transformedData, 200);
  } catch (error) {
    console.error('Mobile transformer error:', error);
    // Return original response if transformation fails
    return;
  }
}

/**
 * Mobile-specific error transformer
 */
export function mobileErrorTransformer(error: any, context: string): any {
  const mobileError = {
    error: error.message || 'An error occurred',
    success: false,
    islamicContext: {
      message: 'We\'re experiencing technical difficulties. Please try again, In Sha Allah.',
      arabicDua: 'حسبنا الله ونعم الوكيل', // Allah is sufficient for us
      fallbackAvailable: true
    },
    _mobile: {
      context,
      timestamp: new Date().toISOString(),
      retryRecommended: true,
      fallbackData: context === 'prayer-times'
    }
  };

  return mobileError;
}

/**
 * Middleware for applying mobile-specific CORS headers
 */
export async function mobileCorsMiddleware(c: Context, next: Next) {
  // Set mobile-friendly CORS headers
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Islamic-App, X-Request-Context');
  c.res.headers.set('Access-Control-Expose-Headers', 'X-Mobile-Optimized, X-Islamic-App-Compatible, X-Islamic-Content, X-Hijri-Date');
  c.res.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }

  await next();
}