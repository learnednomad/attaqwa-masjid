export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date;
  time?: string;
  imageUrl?: string;
  imageAlt?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  prayerTimes?: PrayerTime[];
  zakatInfo?: ZakatInfo;
  imageUrl?: string;
  imageAlt?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrayerTime {
  name: string;
  time: string;
  location?: string;
}

export interface ZakatInfo {
  amount: number;
  currency: string;
  description?: string;
}

export interface Calendar {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  year: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyPrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  qibla: number;
}

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  type: 'zakat' | 'sadaqah' | 'general';
  donorName?: string;
  email?: string;
  isAnonymous: boolean;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: Date;
  isPublished: boolean;
  tags: string[];
  imageUrl?: string;
  imageAlt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactForm {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
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
  statusCode: number;
  success: false;
}

export type EventType = 'eid' | 'ramadan' | 'graduation' | 'general';
export type AnnouncementType = 'general' | 'urgent' | 'event' | 'reminder';
export type UserRole = 'admin' | 'user';
export type DonationType = 'zakat' | 'sadaqah' | 'general';
export type PaymentStatus = 'pending' | 'completed' | 'failed';