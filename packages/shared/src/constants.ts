// Mosque information
export const MOSQUE_INFO = {
  name: 'Masjid At-Taqwa',
  address: 'Your Mosque Address',
  phone: 'Your Phone Number',
  email: 'info@attaqwa.org',
  website: 'https://attaqwa.org',
} as const;

// Prayer names
export const PRAYER_NAMES = {
  FAJR: 'Fajr',
  SUNRISE: 'Sunrise',
  DHUHR: 'Dhuhr',
  ASR: 'Asr',
  MAGHRIB: 'Maghrib',
  ISHA: 'Isha',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  ANNOUNCEMENTS: '/api/announcements',
  EVENTS: '/api/events',
  PRAYER_TIMES: '/api/prayer-times',
  MODULES: '/api/modules',
  LESSONS: '/api/lessons',
  QUESTIONS: '/api/questions',
  PROGRESS: '/api/progress',
} as const;

// External APIs
export const EXTERNAL_APIS = {
  ALADHAN: 'https://api.aladhan.com/v1',
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMMM dd, yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const;

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
} as const;

// Cache configurations
export const CACHE_KEYS = {
  ANNOUNCEMENTS: 'announcements',
  EVENTS: 'events',
  PRAYER_TIMES: 'prayer-times',
  MODULES: 'modules',
  LESSONS: 'lessons',
} as const;

export const CACHE_TTL = {
  ANNOUNCEMENTS: 5 * 60 * 1000, // 5 minutes
  EVENTS: 10 * 60 * 1000, // 10 minutes
  PRAYER_TIMES: 60 * 60 * 1000, // 1 hour
  MODULES: 30 * 60 * 1000, // 30 minutes
  LESSONS: 30 * 60 * 1000, // 30 minutes
} as const;

// Educational content constants
export const AGE_TIER_LABELS = {
  PRIMARY: 'Ages 7-9',
  INTERMEDIATE: 'Ages 10-14',
  HIGHER: 'Ages 14-18',
} as const;

export const CATEGORY_LABELS = {
  TAFSIR: 'Tafsir (Quran Interpretation)',
  SIRA: 'Sira (Prophet\'s Biography)',
  CHARACTER_BUILDING: 'Character Building',
  PRAYER: 'Prayer & Worship',
  QURAN: 'Quran Study',
} as const;

// Quiz configuration
export const QUIZ_CONFIG = {
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 4,
  PASSING_SCORE: 70, // percentage
  MAX_ATTEMPTS: 3,
} as const;

// Progress tracking
export const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// Colors for Islamic design system (HSL values)
export const COLORS = {
  ISLAMIC_GREEN: {
    50: 'hsl(142, 76%, 95%)',
    100: 'hsl(142, 76%, 90%)',
    200: 'hsl(142, 76%, 80%)',
    300: 'hsl(142, 76%, 70%)',
    400: 'hsl(142, 76%, 60%)',
    500: 'hsl(142, 76%, 50%)',
    600: 'hsl(142, 76%, 40%)',
    700: 'hsl(142, 76%, 30%)',
    800: 'hsl(142, 76%, 20%)',
    900: 'hsl(142, 76%, 10%)',
  },
  ISLAMIC_GOLD: {
    50: 'hsl(45, 93%, 95%)',
    100: 'hsl(45, 93%, 90%)',
    200: 'hsl(45, 93%, 80%)',
    300: 'hsl(45, 93%, 70%)',
    400: 'hsl(45, 93%, 60%)',
    500: 'hsl(45, 93%, 50%)',
    600: 'hsl(45, 93%, 40%)',
    700: 'hsl(45, 93%, 30%)',
    800: 'hsl(45, 93%, 20%)',
    900: 'hsl(45, 93%, 10%)',
  },
  ISLAMIC_NAVY: {
    50: 'hsl(220, 50%, 95%)',
    100: 'hsl(220, 50%, 90%)',
    200: 'hsl(220, 50%, 80%)',
    300: 'hsl(220, 50%, 70%)',
    400: 'hsl(220, 50%, 60%)',
    500: 'hsl(220, 50%, 50%)',
    600: 'hsl(220, 50%, 40%)',
    700: 'hsl(220, 50%, 30%)',
    800: 'hsl(220, 50%, 20%)',
    900: 'hsl(220, 50%, 10%)',
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Invalid input data',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network connection error',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in',
  LOGOUT: 'Successfully logged out',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
} as const;