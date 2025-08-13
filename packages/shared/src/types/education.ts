import { z } from 'zod';

// Age tiers for Islamic education
export enum AgeTier {
  CHILDREN = 'CHILDREN', // 5-12 years
  YOUTH = 'YOUTH', // 13-17 years
  ADULTS = 'ADULTS', // 18+ years
  SENIORS = 'SENIORS', // 60+ years
  ALL_AGES = 'ALL_AGES', // Suitable for all ages
}

// Education content types
export enum EducationContentType {
  LESSON = 'LESSON',
  QUIZ = 'QUIZ',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  READING = 'READING',
  INTERACTIVE = 'INTERACTIVE',
}

// Islamic subject categories
export enum IslamicSubject {
  QURAN = 'QURAN',
  HADITH = 'HADITH',
  FIQH = 'FIQH',
  AQIDAH = 'AQIDAH',
  SEERAH = 'SEERAH',
  ISLAMIC_HISTORY = 'ISLAMIC_HISTORY',
  ARABIC_LANGUAGE = 'ARABIC_LANGUAGE',
  DUA_DHIKR = 'DUA_DHIKR',
  ISLAMIC_ETIQUETTE = 'ISLAMIC_ETIQUETTE',
  COMPARATIVE_RELIGION = 'COMPARATIVE_RELIGION',
}

// Difficulty levels
export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  SCHOLAR = 'SCHOLAR',
}

// Progress status
export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

// Question types for quizzes
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  MATCHING = 'MATCHING',
  FILL_BLANK = 'FILL_BLANK',
}

// Validation schemas
export const EducationContentSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  content: z.string().min(1),
  contentType: z.nativeEnum(EducationContentType),
  subject: z.nativeEnum(IslamicSubject),
  ageTier: z.nativeEnum(AgeTier),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  estimatedDuration: z.number().positive(), // in minutes
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  mediaUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  arabicContent: z.string().optional(),
  transliteration: z.string().optional(),
  translation: z.string().optional(),
  isPublished: z.boolean().default(false),
  authorId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LessonSchema = EducationContentSchema.extend({
  contentType: z.literal(EducationContentType.LESSON),
  chapters: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    order: z.number(),
    estimatedDuration: z.number(),
  })).default([]),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    type: z.enum(['PDF', 'VIDEO', 'AUDIO', 'LINK']),
  })).default([]),
});

export const QuizQuestionSchema = z.object({
  id: z.string().cuid(),
  question: z.string().min(1),
  questionType: z.nativeEnum(QuestionType),
  options: z.array(z.string()).optional(), // For multiple choice, matching
  correctAnswer: z.string().min(1),
  explanation: z.string().optional(),
  points: z.number().positive().default(1),
  order: z.number(),
  arabicText: z.string().optional(),
  reference: z.string().optional(), // Quran/Hadith reference
});

export const QuizSchema = EducationContentSchema.extend({
  contentType: z.literal(EducationContentType.QUIZ),
  questions: z.array(QuizQuestionSchema),
  timeLimit: z.number().positive().optional(), // in minutes
  passingScore: z.number().min(0).max(100).default(70),
  maxAttempts: z.number().positive().default(3),
  showCorrectAnswers: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
});

export const UserProgressSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  contentId: z.string().cuid(),
  status: z.nativeEnum(ProgressStatus),
  progress: z.number().min(0).max(100).default(0), // percentage
  currentChapter: z.number().optional(),
  timeSpent: z.number().default(0), // in minutes
  lastAccessed: z.date(),
  completedAt: z.date().optional(),
  score: z.number().min(0).max(100).optional(),
  attempts: z.number().default(0),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const QuizAttemptSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  quizId: z.string().cuid(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    isCorrect: z.boolean(),
    timeSpent: z.number(), // in seconds
  })),
  score: z.number().min(0).max(100),
  totalQuestions: z.number().positive(),
  correctAnswers: z.number().min(0),
  timeSpent: z.number(), // in minutes
  startedAt: z.date(),
  completedAt: z.date(),
  isPassed: z.boolean(),
});

export const EducationCertificateSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  courseId: z.string().cuid().optional(),
  contentId: z.string().cuid().optional(),
  title: z.string(),
  description: z.string(),
  issuedAt: z.date(),
  expiresAt: z.date().optional(),
  certificateUrl: z.string().url().optional(),
  verificationCode: z.string(),
  issuerName: z.string().default('Masjid At-Taqwa'),
  issuerSignature: z.string().optional(),
});

export const LearningPathSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  subject: z.nativeEnum(IslamicSubject),
  ageTier: z.nativeEnum(AgeTier),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  estimatedDuration: z.number().positive(), // total duration in hours
  contents: z.array(z.object({
    contentId: z.string().cuid(),
    order: z.number(),
    isRequired: z.boolean().default(true),
  })),
  prerequisites: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  authorId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type definitions
export type EducationContent = z.infer<typeof EducationContentSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type UserProgress = z.infer<typeof UserProgressSchema>;
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;
export type EducationCertificate = z.infer<typeof EducationCertificateSchema>;
export type LearningPath = z.infer<typeof LearningPathSchema>;

// API request/response types
export interface CreateEducationContentRequest {
  title: string;
  description: string;
  content: string;
  contentType: EducationContentType;
  subject: IslamicSubject;
  ageTier: AgeTier;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  prerequisites?: string[];
  tags?: string[];
  mediaUrl?: string;
  thumbnailUrl?: string;
  arabicContent?: string;
  transliteration?: string;
  translation?: string;
}

export interface UpdateEducationContentRequest extends Partial<CreateEducationContentRequest> {
  isPublished?: boolean;
}

export interface CreateQuizRequest extends CreateEducationContentRequest {
  questions: Omit<QuizQuestion, 'id'>[];
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  showCorrectAnswers?: boolean;
  shuffleQuestions?: boolean;
}

export interface CreateLessonRequest extends CreateEducationContentRequest {
  chapters: Array<{
    title: string;
    content: string;
    estimatedDuration: number;
  }>;
  resources?: Array<{
    title: string;
    url: string;
    type: 'PDF' | 'VIDEO' | 'AUDIO' | 'LINK';
  }>;
}

export interface SubmitQuizAnswersRequest {
  quizId: string;
  answers: Array<{
    questionId: string;
    answer: string;
    timeSpent: number;
  }>;
  timeSpent: number;
}

export interface UpdateProgressRequest {
  contentId: string;
  progress: number;
  currentChapter?: number;
  timeSpent: number;
  notes?: string;
}

export interface EducationAnalytics {
  totalContents: number;
  totalUsers: number;
  totalProgress: number;
  completionRate: number;
  averageScore: number;
  popularSubjects: Array<{
    subject: IslamicSubject;
    count: number;
  }>;
  ageDistribution: Array<{
    ageTier: AgeTier;
    count: number;
  }>;
  difficultyDistribution: Array<{
    level: DifficultyLevel;
    count: number;
  }>;
}

export interface UserEducationStats {
  totalContentsCompleted: number;
  totalTimeSpent: number; // in minutes
  averageScore: number;
  certificates: number;
  currentStreak: number; // days
  longestStreak: number; // days
  favoriteSubject: IslamicSubject;
  progressBySubject: Array<{
    subject: IslamicSubject;
    completed: number;
    total: number;
  }>;
}

// Content filtering and search
export interface EducationContentFilters {
  subject?: IslamicSubject;
  ageTier?: AgeTier;
  difficultyLevel?: DifficultyLevel;
  contentType?: EducationContentType;
  tags?: string[];
  search?: string;
  isPublished?: boolean;
}

export interface EducationContentSort {
  field: 'title' | 'createdAt' | 'updatedAt' | 'estimatedDuration' | 'difficulty';
  direction: 'asc' | 'desc';
}

export interface PaginatedEducationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Islamic education specific types
export interface QuranicVerse {
  surah: number;
  ayah: number;
  arabicText: string;
  transliteration: string;
  translation: string;
  tafsir?: string;
}

export interface HadithReference {
  collection: string; // Bukhari, Muslim, etc.
  book: string;
  number: string;
  arabicText: string;
  translation: string;
  grade: string; // Sahih, Hasan, etc.
}

export interface IslamicContent {
  quranVerses?: QuranicVerse[];
  hadithReferences?: HadithReference[];
  duas?: Array<{
    title: string;
    arabicText: string;
    transliteration: string;
    translation: string;
    occasion?: string;
  }>;
}

// Achievement system
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: {
    type: 'COMPLETION' | 'SCORE' | 'STREAK' | 'TIME_SPENT' | 'QUIZ_ATTEMPTS';
    value: number;
    subject?: IslamicSubject;
  };
  points: number;
  isRare: boolean;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
  progress: number; // 0-100
}