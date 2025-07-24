// Jest setup for API package tests
import 'dotenv/config'

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/attaqwa_test'
process.env.REDIS_URL = 'redis://localhost:6379/1'

// Mock fetch globally for API tests
global.fetch = jest.fn()

// Mock Prisma client
jest.mock('@attaqwa/db', () => ({
  PrismaClient: jest.fn(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    announcement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    educationContent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    userProgress: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    quizAttempt: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    educationCertificate: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  })),
}))

// Mock Islamic prayer times API responses
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
        weekday: { en: 'Monday' },
        month: { number: 1, en: 'January' },
        year: '2024',
      },
      hijri: {
        date: '19-06-1445',
        format: 'DD-MM-YYYY',
        day: '19',
        weekday: { en: 'Al Athnayn', ar: 'الاثنين' },
        month: { number: 6, en: 'Jumādā al-thānī', ar: 'جُمادى الثاني' },
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
        params: { Fajr: 15, Isha: 15 },
      },
      latitudeAdjustmentMethod: '3',
      midnightMode: '0',
      school: '0',
      offset: {
        Imsak: 0, Fajr: 0, Sunrise: 0, Dhuhr: 0,
        Asr: 0, Sunset: 0, Maghrib: 0, Isha: 0, Midnight: 0,
      },
    },
  },
  code: 200,
  status: 'OK',
}

// Setup default fetch mock for prayer times
beforeEach(() => {
  fetch.mockClear()
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockPrayerTimesResponse),
  })
})

// Cleanup after each test
afterEach(() => {
  jest.restoreAllMocks()
})

// Global test utilities for Islamic features
global.testUtils = {
  // Mock Islamic dates
  createMockHijriDate: (day, month, year) => ({
    day: String(day).padStart(2, '0'),
    month,
    year: String(year),
    weekday: 'Al Athnayn',
  }),

  // Mock prayer times
  createMockPrayerTimes: (overrides = {}) => ({
    fajr: '05:30',
    dhuhr: '12:45',
    asr: '15:30',
    maghrib: '18:00',
    isha: '19:30',
    ...overrides,
  }),

  // Mock Qibla direction calculation
  calculateQiblaDirection: (lat, lng) => {
    // Simplified calculation for testing
    const meccaLat = 21.4225
    const meccaLng = 39.8262
    const dLng = (meccaLng - lng) * Math.PI / 180
    const lat1 = lat * Math.PI / 180
    const lat2 = meccaLat * Math.PI / 180
    
    const y = Math.sin(dLng) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI
    return (bearing + 360) % 360
  },

  // Islamic content helpers
  createMockEducationContent: (overrides = {}) => ({
    id: 'content-1',
    title: 'Test Islamic Content',
    description: 'Test description',
    subject: 'QURAN',
    ageTier: 'ADULTS',
    difficultyLevel: 'BEGINNER',
    contentType: 'LESSON',
    estimatedDuration: 30,
    isPublished: true,
    tags: ['test'],
    createdAt: new Date('2024-01-01'),
    author: { id: 'author-1', name: 'Test Author' },
    _count: { userProgress: 0, quizAttempts: 0 },
    ...overrides,
  }),

  // Auth helpers
  createMockUser: (overrides = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    isEmailVerified: true,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  }),

  // JWT helpers
  generateMockJWT: (payload = {}) => {
    const defaultPayload = {
      userId: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...payload,
    }
    
    // Simple base64 encoded mock JWT for testing
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
    const payloadStr = Buffer.from(JSON.stringify(defaultPayload)).toString('base64')
    const signature = 'mock-signature'
    
    return `${header}.${payloadStr}.${signature}`
  },
}

// Console configuration for tests
if (process.env.NODE_ENV === 'test') {
  // Suppress console.log in tests unless explicitly needed
  console.log = jest.fn()
  console.info = jest.fn()
  
  // Keep console.error and console.warn for debugging
  // console.error = jest.fn()
  // console.warn = jest.fn()
}