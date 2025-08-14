import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const prayerTimes = new Hono();

// Validation schemas
const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  city: z.string().default('Toronto'),
  country: z.string().default('Canada'),
  method: z.string().default('2'), // Islamic Society of North America
});

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

// External API integration function
async function fetchPrayerTimesFromAladhan(city: string, country: string, date: string, method: string) {
  try {
    const url = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${city}&country=${country}&method=${method}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(`API error: ${data.status}`);
    }
    
    const timings = data.data.timings;
    const meta = data.data.meta;
    
    return {
      date,
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      qibla: meta.qibla?.direction || 58.5,
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    // Fallback to mock data
    const key = `${city}-${country}-${date}`;
    return mockPrayerTimes[key] || mockPrayerTimes['Toronto-Canada-2024-01-25'];
  }
}

// GET /api/prayer-times
prayerTimes.get('/', zValidator('query', querySchema), async (c) => {
  const { date, city, country, method } = c.req.valid('query');
  const queryDate = date || new Date().toISOString().split('T')[0];
  
  try {
    const prayerData = await fetchPrayerTimesFromAladhan(city, country, queryDate, method);
    
    return c.json({
      data: prayerData,
      success: true,
    });
  } catch (error) {
    console.error('Prayer times error:', error);
    return c.json({
      error: 'Failed to fetch prayer times',
      message: 'Please try again later'
    }, 500);
  }
});

// GET /api/prayer-times/week
prayerTimes.get('/week', zValidator('query', querySchema.omit({ date: true })), async (c) => {
  const { city, country, method } = c.req.valid('query');
  
  try {
    const weekPrayerTimes = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const prayerData = await fetchPrayerTimesFromAladhan(city, country, dateString, method);
      weekPrayerTimes.push(prayerData);
    }
    
    return c.json({
      data: weekPrayerTimes,
      success: true,
    });
  } catch (error) {
    console.error('Weekly prayer times error:', error);
    return c.json({
      error: 'Failed to fetch weekly prayer times',
      message: 'Please try again later'
    }, 500);
  }
});

// GET /api/prayer-times/month
prayerTimes.get('/month', zValidator('query', querySchema.extend({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
})), async (c) => {
  const { city, country, method, month } = c.req.valid('query');
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  
  try {
    const [year, monthNum] = targetMonth.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const monthPrayerTimes = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const prayerData = await fetchPrayerTimesFromAladhan(city, country, dateString, method);
      monthPrayerTimes.push(prayerData);
    }
    
    return c.json({
      data: monthPrayerTimes,
      success: true,
    });
  } catch (error) {
    console.error('Monthly prayer times error:', error);
    return c.json({
      error: 'Failed to fetch monthly prayer times',
      message: 'Please try again later'
    }, 500);
  }
});

export { prayerTimes as prayerTimeRoutes };