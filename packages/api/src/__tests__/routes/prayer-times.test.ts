import { Hono } from 'hono'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { prayerTimeRoutes } from '../../routes/prayer-times'

// Mock external API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Prayer Times API Routes', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.route('/prayer-times', prayerTimeRoutes)
    jest.clearAllMocks()
  })

  describe('GET /prayer-times', () => {
    const mockPrayerTimesResponse = {
      data: {
        timings: {
          Fajr: '05:30',
          Sunrise: '06:45',
          Dhuhr: '12:45',
          Asr: '15:30',
          Sunset: '18:00',
          Maghrib: '18:00',
          Isha: '19:30',
          Imsak: '05:20',
          Midnight: '00:45',
        },
        date: {
          readable: '01 Jan 2024',
          timestamp: '1704067200',
          gregorian: {
            date: '01-01-2024',
            format: 'DD-MM-YYYY',
            day: '01',
            weekday: {
              en: 'Monday',
            },
            month: {
              number: 1,
              en: 'January',
            },
            year: '2024',
          },
          hijri: {
            date: '19-06-1445',
            format: 'DD-MM-YYYY',
            day: '19',
            weekday: {
              en: 'Al Athnayn',
              ar: 'الاثنين',
            },
            month: {
              number: 6,
              en: 'Jumādā al-thānī',
              ar: 'جُمادى الثاني',
            },
            year: '1445',
          },
        },
        meta: {
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
          method: {
            id: 2,
            name: 'Islamic Society of North America (ISNA)',
            params: {
              Fajr: 15,
              Isha: 15,
            },
          },
          latitudeAdjustmentMethod: '3',
          midnightMode: '0',
          school: '0',
          offset: {
            Imsak: 0,
            Fajr: 0,
            Sunrise: 0,
            Dhuhr: 0,
            Asr: 0,
            Sunset: 0,
            Maghrib: 0,
            Isha: 0,
            Midnight: 0,
          },
        },
      },
      code: 200,
      status: 'OK',
    }

    it('returns prayer times for given coordinates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.prayerTimes).toEqual({
        fajr: '05:30',
        sunrise: '06:45',
        dhuhr: '12:45',
        asr: '15:30',
        maghrib: '18:00',
        isha: '19:30',
      })
      expect(data.location).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      })
      expect(data.hijriDate).toEqual({
        day: '19',
        month: 'Jumādā al-thānī',
        year: '1445',
        weekday: 'Al Athnayn',
      })
    })

    it('calculates qibla direction correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.qiblaDirection).toBeCloseTo(58.48, 1) // Qibla from NYC to Mecca
    })

    it('uses custom calculation method when specified', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060&method=3')
      
      expect(res.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('method=3')
      )
    })

    it('supports different schools of jurisprudence', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060&school=1')
      
      expect(res.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('school=1')
      )
    })

    it('handles custom date parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060&date=01-01-2024')
      
      expect(res.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date=01-01-2024')
      )
    })

    it('returns 400 for missing latitude', async () => {
      const res = await app.request('/prayer-times?longitude=-74.0060')
      
      expect(res.status).toBe(400)
      
      const data = await res.json()
      expect(data.error).toContain('latitude')
    })

    it('returns 400 for missing longitude', async () => {
      const res = await app.request('/prayer-times?latitude=40.7128')
      
      expect(res.status).toBe(400)
      
      const data = await res.json()
      expect(data.error).toContain('longitude')
    })

    it('returns 400 for invalid latitude range', async () => {
      const res = await app.request('/prayer-times?latitude=100&longitude=-74.0060')
      
      expect(res.status).toBe(400)
      
      const data = await res.json()
      expect(data.error).toContain('latitude')
    })

    it('returns 400 for invalid longitude range', async () => {
      const res = await app.request('/prayer-times?latitude=40.7128&longitude=200')
      
      expect(res.status).toBe(400)
      
      const data = await res.json()
      expect(data.error).toContain('longitude')
    })

    it('handles API service errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'API service unavailable' }),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(500)
      
      const data = await res.json()
      expect(data.error).toBe('Failed to fetch prayer times')
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(500)
      
      const data = await res.json()
      expect(data.error).toBe('Failed to fetch prayer times')
    })

    it('includes next prayer calculation', async () => {
      // Mock current time to be 10:00 AM
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-01T10:00:00Z'))

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.nextPrayer).toEqual({
        name: 'Dhuhr',
        time: '12:45',
        timeRemaining: expect.any(String),
      })

      jest.useRealTimers()
    })

    it('provides Islamic calendar information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.hijriDate).toEqual({
        day: '19',
        month: 'Jumādā al-thānī',
        year: '1445',
        weekday: 'Al Athnayn',
      })
    })
  })

  describe('GET /prayer-times/qibla', () => {
    it('returns qibla direction for given coordinates', async () => {
      const res = await app.request('/prayer-times/qibla?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.qiblaDirection).toBeCloseTo(58.48, 1)
      expect(data.location).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
      })
    })

    it('calculates correct direction from different locations', async () => {
      // Test from London
      const londonRes = await app.request('/prayer-times/qibla?latitude=51.5074&longitude=-0.1278')
      const londonData = await londonRes.json()
      expect(londonData.qiblaDirection).toBeCloseTo(118.99, 1)

      // Test from Tokyo
      const tokyoRes = await app.request('/prayer-times/qibla?latitude=35.6762&longitude=139.6503')
      const tokyoData = await tokyoRes.json()
      expect(tokyoData.qiblaDirection).toBeCloseTo(293.02, 1)
    })

    it('returns 400 for missing coordinates', async () => {
      const res = await app.request('/prayer-times/qibla?latitude=40.7128')
      
      expect(res.status).toBe(400)
    })
  })

  describe('GET /prayer-times/monthly', () => {
    const mockMonthlyResponse = {
      data: Array.from({ length: 31 }, (_, i) => ({
        timings: {
          Fajr: '05:30',
          Dhuhr: '12:45',
          Asr: '15:30',
          Maghrib: '18:00',
          Isha: '19:30',
        },
        date: {
          gregorian: {
            date: `${String(i + 1).padStart(2, '0')}-01-2024`,
            day: String(i + 1).padStart(2, '0'),
          },
          hijri: {
            date: `${String(i + 19).padStart(2, '0')}-06-1445`,
            day: String(i + 19).padStart(2, '0'),
          },
        },
      })),
      code: 200,
      status: 'OK',
    }

    it('returns monthly prayer times', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMonthlyResponse),
      })

      const res = await app.request('/prayer-times/monthly?latitude=40.7128&longitude=-74.0060&month=1&year=2024')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.month).toBe(1)
      expect(data.year).toBe(2024)
      expect(data.prayerTimes).toHaveLength(31)
      expect(data.prayerTimes[0]).toEqual({
        date: '01-01-2024',
        hijriDate: '19-06-1445',
        prayers: {
          fajr: '05:30',
          dhuhr: '12:45',
          asr: '15:30',
          maghrib: '18:00',
          isha: '19:30',
        },
      })
    })

    it('handles different months correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ...mockMonthlyResponse,
          data: mockMonthlyResponse.data.slice(0, 28), // February
        }),
      })

      const res = await app.request('/prayer-times/monthly?latitude=40.7128&longitude=-74.0060&month=2&year=2024')
      
      expect(res.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('month/2/2024')
      )
    })

    it('validates month parameter', async () => {
      const res = await app.request('/prayer-times/monthly?latitude=40.7128&longitude=-74.0060&month=13&year=2024')
      
      expect(res.status).toBe(400)
      
      const data = await res.json()
      expect(data.error).toContain('month')
    })

    it('validates year parameter', async () => {
      const res = await app.request('/prayer-times/monthly?latitude=40.7128&longitude=-74.0060&month=1&year=1900')
      
      expect(res.status).toBe(400)
      
      const data = await res.json()
      expect(data.error).toContain('year')
    })
  })

  describe('Islamic Prayer Time Features', () => {
    it('includes Islamic calendar information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=21.4225&longitude=39.8262') // Mecca
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.hijriDate).toBeDefined()
      expect(data.hijriDate.year).toBe('1445')
      expect(data.hijriDate.month).toBe('Jumādā al-thānī')
    })

    it('provides calculation method information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.calculationMethod).toEqual({
        id: 2,
        name: 'Islamic Society of North America (ISNA)',
        params: {
          Fajr: 15,
          Isha: 15,
        },
      })
    })

    it('calculates time remaining to next prayer', async () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-01T10:00:00Z'))

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPrayerTimesResponse),
      })

      const res = await app.request('/prayer-times?latitude=40.7128&longitude=-74.0060')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.nextPrayer.timeRemaining).toMatch(/\d+ hours? \d+ minutes?/)

      jest.useRealTimers()
    })

    it('handles prayer times in different time zones', async () => {
      const dubaiResponse = {
        ...mockPrayerTimesResponse,
        data: {
          ...mockPrayerTimesResponse.data,
          meta: {
            ...mockPrayerTimesResponse.data.meta,
            timezone: 'Asia/Dubai',
          },
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(dubaiResponse),
      })

      const res = await app.request('/prayer-times?latitude=25.2048&longitude=55.2708') // Dubai
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.location.timezone).toBe('Asia/Dubai')
    })
  })
})