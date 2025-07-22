// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  ageTier?: 'PRIMARY' | 'INTERMEDIATE' | 'HIGHER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  pdfUrl?: string;
  isEvent: boolean;
  eventDate?: Date;
  isActive: boolean;
  isArchived: boolean;
  authorId: string;
  author?: User;
  createdAt: Date;
  updatedAt: Date;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  isIndoor?: boolean;
  isOutdoor?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Prayer times
export interface PrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  qibla: number;
}

// Educational content
export interface ContentModule {
  id: string;
  title: string;
  description: string;
  category: 'TAFSIR' | 'SIRA' | 'CHARACTER_BUILDING' | 'PRAYER' | 'QURAN';
  ageTier: 'PRIMARY' | 'INTERMEDIATE' | 'HIGHER';
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  moduleId: string;
  module?: ContentModule;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  questions?: Question[];
}

export interface Question {
  id: string;
  lessonId: string;
  questionText: string;
  options: {
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  };
  explanation: string;
  sortOrder: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  lesson?: Lesson;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  success: false;
}

// Enums as const assertions for better TypeScript support
export const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const AgeTier = {
  PRIMARY: 'PRIMARY',
  INTERMEDIATE: 'INTERMEDIATE', 
  HIGHER: 'HIGHER',
} as const;

export const Category = {
  TAFSIR: 'TAFSIR',
  SIRA: 'SIRA',
  CHARACTER_BUILDING: 'CHARACTER_BUILDING',
  PRAYER: 'PRAYER',
  QURAN: 'QURAN',
} as const;

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type RoleType = typeof Role[keyof typeof Role];
export type AgeTierType = typeof AgeTier[keyof typeof AgeTier];
export type CategoryType = typeof Category[keyof typeof Category];
export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];