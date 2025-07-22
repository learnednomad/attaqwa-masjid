// Remove clsx dependency for now - we'll add it later
export type ClassValue = 
  | string 
  | number 
  | boolean 
  | undefined 
  | null
  | { [key: string]: any }
  | ClassValue[];

// Utility function for conditional class names (similar to shadcn/ui)
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object' && !Array.isArray(input)) {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    } else if (Array.isArray(input)) {
      classes.push(cn(...input));
    }
  }
  
  return classes.join(' ');
}

// Date utilities
export function formatDate(date: Date | string, format: string = 'MMMM dd, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Simple date formatting (you might want to use date-fns for more complex formatting)
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'MMMM dd, yyyy':
      options.year = 'numeric';
      options.month = 'long';
      options.day = '2-digit';
      break;
    case 'yyyy-MM-dd':
      return d.toISOString().split('T')[0];
    case 'HH:mm':
      return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    default:
      return d.toLocaleDateString();
  }
  
  return d.toLocaleDateString('en-US', options);
}

export function formatTime(time: string): string {
  // Convert 24-hour time to 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// API utilities
export function createApiUrl(baseUrl: string, endpoint: string, params?: Record<string, string>): string {
  const url = new URL(endpoint, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }
  return url.toString();
}

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

// Number utilities
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Array utilities
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Storage utilities (for browser environment)
export function getStorageItem(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Handle storage errors silently
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Handle storage errors silently
  }
}

// Islamic utilities
export function getNextPrayerTime(prayerTimes: Record<string, string>): { name: string; time: string } | null {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha },
  ];
  
  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    
    if (prayerTime > currentTime) {
      return prayer;
    }
  }
  
  // If no prayer is found today, return Fajr of tomorrow
  return { name: 'Fajr', time: prayerTimes.fajr };
}

export function getAgeGroup(ageTier: string): string {
  switch (ageTier) {
    case 'PRIMARY':
      return 'Ages 7-9';
    case 'INTERMEDIATE':
      return 'Ages 10-14';
    case 'HIGHER':
      return 'Ages 14-18';
    default:
      return 'All Ages';
  }
}

// Validation utilities
export function validateRequired(value: unknown, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email address');
  }
}

export function validateMinLength(value: string, minLength: number, fieldName: string): void {
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }
}