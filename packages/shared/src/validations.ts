import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Announcement validations
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  imageAlt: z.string().optional(),
  pdfUrl: z.string().url('Invalid PDF URL').optional(),
  isEvent: z.boolean().default(false),
  eventDate: z.string().datetime().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

// Event validations
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime('Invalid date format'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  isIndoor: z.boolean().default(false),
  isOutdoor: z.boolean().default(false),
  imageUrl: z.string().url('Invalid image URL').optional(),
  imageAlt: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

// Prayer times validations
export const prayerTimesQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  city: z.string().default('Toronto'),
  country: z.string().default('Canada'),
  method: z.string().default('2'),
});

// Educational content validations
export const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['TAFSIR', 'SIRA', 'CHARACTER_BUILDING', 'PRAYER', 'QURAN']),
  ageTier: z.enum(['PRIMARY', 'INTERMEDIATE', 'HIGHER']),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateModuleSchema = createModuleSchema.partial();

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  moduleId: z.string().cuid('Invalid module ID'),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateLessonSchema = createLessonSchema.partial();

export const createQuestionSchema = z.object({
  lessonId: z.string().cuid('Invalid lesson ID'),
  questionText: z.string().min(1, 'Question text is required'),
  options: z.object({
    options: z.array(z.object({
      text: z.string().min(1, 'Option text is required'),
      isCorrect: z.boolean(),
    })).min(2, 'At least 2 options required').max(4, 'Maximum 4 options allowed'),
  }),
  explanation: z.string().min(1, 'Explanation is required'),
  sortOrder: z.number().int().min(0).default(0),
});

// Pagination validations
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default('10'),
});

// Common query filters
export const activeFilterSchema = z.object({
  isActive: z.string().transform(val => val === 'true').optional(),
});

export const eventFilterSchema = z.object({
  isEvent: z.string().transform(val => val === 'true').optional(),
  upcoming: z.string().transform(val => val === 'true').optional(),
});

export const ageTierFilterSchema = z.object({
  ageTier: z.enum(['PRIMARY', 'INTERMEDIATE', 'HIGHER']).optional(),
});

export const categoryFilterSchema = z.object({
  category: z.enum(['TAFSIR', 'SIRA', 'CHARACTER_BUILDING', 'PRAYER', 'QURAN']).optional(),
});

// Combined schemas for common use cases
export const announcementQuerySchema = paginationSchema
  .merge(activeFilterSchema)
  .merge(eventFilterSchema);

export const eventQuerySchema = paginationSchema
  .merge(activeFilterSchema)
  .merge(eventFilterSchema);

export const moduleQuerySchema = paginationSchema
  .merge(activeFilterSchema)
  .merge(ageTierFilterSchema)
  .merge(categoryFilterSchema);

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type PrayerTimesQueryInput = z.infer<typeof prayerTimesQuerySchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type AnnouncementQuery = z.infer<typeof announcementQuerySchema>;
export type EventQuery = z.infer<typeof eventQuerySchema>;
export type ModuleQuery = z.infer<typeof moduleQuerySchema>;