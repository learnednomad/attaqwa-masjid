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

// API request types
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

export type RoleType = typeof Role[keyof typeof Role];
export type CategoryType = typeof Category[keyof typeof Category];
export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];