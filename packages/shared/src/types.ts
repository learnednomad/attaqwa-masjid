// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'user';
  ageTier?: AgeTier;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'user';
  ageTier?: AgeTier;
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
  location?: {
    city: string;
    country: string;
    timezone: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  islamicDate?: {
    day: number;
    month: number;
    year: number;
    monthName: string;
    formatted: string;
  };
  method?: {
    id: number;
    name: string;
  };
  isFromCache?: boolean;
  isFromFallback?: boolean;
  error?: string;
}

export interface PrayerTimesQuery {
  date?: string;
  city?: string;
  country?: string;
  method?: string;
  school?: string;
  latitude?: number;
  longitude?: number;
}

export interface QiblaDirection {
  latitude: number;
  longitude: number;
  qiblaDirection: number;
  compassBearing: number;
  kaaba: {
    latitude: number;
    longitude: number;
  };
}

export interface IslamicDate {
  gregorianDate: string;
  islamicDate: {
    day: number;
    month: number;
    year: number;
    monthName: string;
    formatted: string;
  };
  adjustment: number;
}

export interface NextPrayerInfo {
  currentTime: string;
  currentDate: string;
  nextPrayer: {
    name: string;
    time: string;
    date?: string;
    passed: boolean;
  };
  allPrayersToday: Array<{
    name: string;
    time: string;
    passed: boolean;
  }>;
  location: PrayerTimes['location'];
  islamicDate: PrayerTimes['islamicDate'];
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
  timestamp?: string;
}

// Enhanced API response types
export interface PrayerTimesResponse extends ApiResponse<PrayerTimes> {
  cached?: boolean;
  timestamp: string;
}

export interface WeeklyPrayerTimesResponse extends ApiResponse<PrayerTimes[]> {
  totalDays: number;
  successfulDays: number;
  timestamp: string;
}

export interface MonthlyPrayerTimesResponse extends ApiResponse<PrayerTimes[]> {
  month: string;
  totalDays: number;
  successfulDays: number;
  timestamp: string;
}

export interface NotificationHistoryResponse extends PaginatedResponse<Notification> {
  // Additional notification-specific metadata can go here
}

export interface DonationHistoryResponse extends PaginatedResponse<Donation> {
  summary: {
    yearlyTotal: number;
    totalDonations: number;
    recurringDonations: number;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  features?: string[];
  statistics?: Record<string, any>;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  success: false;
  timestamp?: string;
}

// Enums as const assertions for better TypeScript support
export const Role = {
  ADMIN: 'admin',
  USER: 'user',
  STUDENT: 'student',
  TEACHER: 'teacher',
  INSTRUCTOR: 'instructor',
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

// Educational system enums
export enum AgeTier {
  CHILDREN = 'CHILDREN', // 5-12 years
  YOUTH = 'YOUTH',       // 13-17 years
  ADULTS = 'ADULTS',     // 18+ years
  SENIORS = 'SENIORS',   // 60+ years
  ALL_AGES = 'ALL_AGES'
}

export enum IslamicSubject {
  WORSHIP = 'WORSHIP',
  QURAN = 'QURAN',
  HADITH = 'HADITH',
  FIQH = 'FIQH',
  HISTORY = 'HISTORY',
  AKHLAQ = 'AKHLAQ',
  TAFSIR = 'TAFSIR',
  SIRA = 'SIRA'
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum EducationContentType {
  LESSON = 'LESSON',
  QUIZ = 'QUIZ',
  VIDEO = 'VIDEO',
  READING = 'READING'
}

export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

// Educational content interfaces
export interface EducationContent {
  id: string;
  title: string;
  description: string;
  content: string;
  contentType: EducationContentType;
  subject: IslamicSubject;
  ageTier: AgeTier;
  difficultyLevel: DifficultyLevel;
  isActive: boolean;
  estimatedMinutes: number;
  prerequisites: string[];
  learningObjectives: string[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: User;
  quizzes?: Quiz[];
  userProgress?: UserProgress[];
}

export interface Quiz {
  id: string;
  contentId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  answers: QuizAnswer[];
  completedAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  points: number;
}

// Enhanced API request types
export interface CreateEducationContentRequest {
  title: string;
  description: string;
  content: string;
  contentType: EducationContentType;
  subject: IslamicSubject;
  ageTier: AgeTier;
  difficultyLevel: DifficultyLevel;
  estimatedMinutes: number;
  prerequisites?: string[];
  learningObjectives: string[];
}

export interface CreateQuizRequest {
  contentId: string;
  title: string;
  description: string;
  questions: CreateQuizQuestionRequest[];
  passingScore: number;
  timeLimit?: number;
}

export interface CreateQuizQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  options: { text: string; isCorrect: boolean }[];
  explanation?: string;
  points: number;
  order: number;
}

export interface CreateLessonRequest {
  title: string;
  content: string;
  moduleId: string;
  sortOrder: number;
}

export interface SubmitQuizAnswersRequest {
  quizId: string;
  answers: { questionId: string; selectedAnswer: string }[];
  timeSpent: number;
}

export interface UpdateProgressRequest {
  contentId: string;
  completed: boolean;
  timeSpent: number;
  score?: number;
}

export interface EducationContentFilters {
  ageTier?: AgeTier;
  subject?: IslamicSubject;
  difficultyLevel?: DifficultyLevel;
  contentType?: EducationContentType;
  search?: string;
  authorId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// Notification types
export interface NotificationPreferences {
  prayerReminders?: {
    enabled: boolean;
    beforeMinutes: number[];
    prayers: Array<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>;
  };
  announcements?: {
    enabled: boolean;
    categories: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
  };
  islamicEvents?: {
    enabled: boolean;
    events: Array<'ramadan' | 'eid' | 'hajj' | 'ashura' | 'mawlid'>;
    beforeDays: number;
  };
  methods?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface PushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
  registeredAt: string;
  active: boolean;
}

export interface NotificationData {
  title: string;
  body: string;
  type: 'prayer' | 'announcement' | 'islamic_event' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  scheduledFor?: string;
  recipients?: {
    userIds?: string[];
    roles?: Array<'admin' | 'moderator' | 'user'>;
    ageTiers?: string[];
    all?: boolean;
  };
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'prayer' | 'announcement' | 'islamic_event' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'scheduled' | 'sent' | 'failed';
  createdBy: string;
  createdAt: string;
  scheduledFor?: string;
  results?: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface Webhook {
  id: string;
  url: string;
  events: Array<'prayer_time' | 'announcement' | 'islamic_event'>;
  secret?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

// Donation types
export interface DonationType {
  id: string;
  name: string;
  description: string;
  rate?: number;
  minimumAmount: number;
  suggestedAmounts?: number[];
  nisab?: {
    gold: number;
    silver: number;
  };
}

export interface Donation {
  id: string;
  userId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP';
  type: 'zakat' | 'sadaqah' | 'fidya' | 'kaffarah' | 'general' | 'masjid_fund' | 'ramadan_iftar' | 'hajj_fund';
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  anonymousDonation: boolean;
  dedicatedTo?: string;
  message?: string;
  paymentIntentId: string;
  paymentResult?: any;
  status: 'pending' | 'completed' | 'failed';
  receiptId?: string;
  customerId?: string;
  subscriptionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ZakatCalculationInput {
  assets: {
    cash: number;
    savings: number;
    gold?: {
      weight: number;
      purity: number;
      currentPrice?: number;
    };
    silver?: {
      weight: number;
      currentPrice?: number;
    };
    stocks: number;
    bonds: number;
    businessAssets: number;
    cryptocurrency: number;
    otherInvestments: number;
  };
  liabilities: {
    debt: number;
    mortgages: number;
    loans: number;
    creditCards: number;
    otherLiabilities: number;
  };
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP';
  goldSilverPrices?: {
    goldPerGram?: number;
    silverPerGram?: number;
  };
}

export interface ZakatCalculationResult {
  calculationId: string;
  totalAssets: number;
  totalLiabilities: number;
  netWealth: number;
  nisabThreshold: number;
  goldNisab: number;
  silverNisab: number;
  isEligible: boolean;
  zakatAmount: number;
  zakatRate: number;
  currency: string;
  calculatedAt: string;
}

export interface Receipt {
  id: string;
  donationId: string;
  donorName: string;
  amount: number;
  currency: string;
  type: string;
  typeName: string;
  date: string;
  paymentMethod: string;
  transactionId: string;
  taxDeductible: boolean;
  organizationInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    charitableNumber: string;
  };
  islamicInfo: {
    hijriDate: string;
    duaForDonor: string;
    verse: string;
  };
  includeDetails: boolean;
}

export interface DonationStatistics {
  totalRaised: number;
  yearlyTotal: number;
  monthlyTotal: number;
  totalDonations: number;
  uniqueDonors: number;
  donationsByType: Record<string, number>;
  recurringDonations: {
    total: number;
    monthly: number;
    quarterly: number;
    annually: number;
  };
  averageDonation: number;
}

export interface NisabRates {
  currency: string;
  nisab: {
    gold: number;
    silver: number;
  };
  currentPrices: {
    gold: number;
    silver: number;
  };
  zakatRate: number;
  lastUpdated: string;
}

// Mobile API optimization types
export interface MobileApiOptions {
  fields?: string;
  exclude?: string;
  format?: 'full' | 'mobile';
  compress?: boolean;
  v?: string; // API version
}

export interface ApiVersion {
  version: string;
  supportedVersions: string[];
  deprecated?: boolean;
  deprecationDate?: string;
  features: string[];
}

export interface MobileOptimizedResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
  apiVersion?: string;
  optimizations?: {
    fieldsApplied?: boolean;
    mobileOptimized?: boolean;
    compressed?: boolean;
    cacheHit?: boolean;
  };
  performance?: {
    responseSize: number;
    processingTime: string;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Enhanced error types
export interface ApiError {
  error: string;
  message?: string;
  success: false;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  rateLimitInfo?: RateLimitInfo;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  details: {
    field: string;
    message: string;
    value?: any;
  }[];
}

export interface AuthError extends ApiError {
  code: 'AUTH_ERROR';
  details: {
    reason: 'invalid_token' | 'expired_token' | 'insufficient_permissions' | 'account_disabled';
    requiredRole?: string;
  };
}

// Request/Response wrapper types
export interface CreateDonationRequest {
  amount: number;
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP';
  type: 'zakat' | 'sadaqah' | 'fidya' | 'kaffarah' | 'general' | 'masjid_fund' | 'ramadan_iftar' | 'hajj_fund';
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  anonymousDonation?: boolean;
  dedicatedTo?: string;
  message?: string;
  paymentMethodId?: string;
}

export interface CreateNotificationRequest {
  title: string;
  body: string;
  type: 'prayer' | 'announcement' | 'islamic_event' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: Record<string, any>;
  scheduledFor?: string;
  recipients?: {
    userIds?: string[];
    roles?: Array<'admin' | 'moderator' | 'user'>;
    ageTiers?: string[];
    all?: boolean;
  };
}

export interface UpdateNotificationPreferencesRequest {
  prayerReminders?: {
    enabled?: boolean;
    beforeMinutes?: number[];
    prayers?: Array<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>;
  };
  announcements?: {
    enabled?: boolean;
    categories?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
  islamicEvents?: {
    enabled?: boolean;
    events?: Array<'ramadan' | 'eid' | 'hajj' | 'ashura' | 'mawlid'>;
    beforeDays?: number;
  };
  methods?: {
    push?: boolean;
    email?: boolean;
    sms?: boolean;
  };
}

export interface RegisterPushTokenRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: Array<'prayer_time' | 'announcement' | 'islamic_event'>;
  secret?: string;
  active?: boolean;
}

// Type guards
export function isApiError(obj: any): obj is ApiError {
  return obj && typeof obj === 'object' && obj.success === false && 'error' in obj;
}

export function isValidationError(obj: any): obj is ValidationError {
  return isApiError(obj) && obj.code === 'VALIDATION_ERROR';
}

export function isAuthError(obj: any): obj is AuthError {
  return isApiError(obj) && obj.code === 'AUTH_ERROR';
}

export type RoleType = typeof Role[keyof typeof Role];
export type CategoryType = typeof Category[keyof typeof Category];
export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];