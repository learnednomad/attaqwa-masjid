import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { PrismaClient } from '../../../db/src/generated/index.js';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  EducationContentSchema,
  CreateEducationContentRequest,
  UpdateEducationContentRequest,
  CreateQuizRequest,
  CreateLessonRequest,
  SubmitQuizAnswersRequest,
  UpdateProgressRequest,
  EducationContentFilters,
  AgeTier,
  IslamicSubject,
  DifficultyLevel,
  EducationContentType,
  ProgressStatus,
  QuestionType,
} from '@attaqwa/shared';

const app = new Hono();
const prisma = new PrismaClient();

// Validation schemas for API requests
const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  content: z.string().min(1),
  contentType: z.nativeEnum(EducationContentType),
  subject: z.nativeEnum(IslamicSubject),
  ageTier: z.nativeEnum(AgeTier),
  difficultyLevel: z.nativeEnum(DifficultyLevel),
  estimatedDuration: z.number().positive(),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  mediaUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  arabicContent: z.string().optional(),
  transliteration: z.string().optional(),
  translation: z.string().optional(),
});

const updateContentSchema = createContentSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

const filtersSchema = z.object({
  subject: z.nativeEnum(IslamicSubject).optional(),
  ageTier: z.nativeEnum(AgeTier).optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
  contentType: z.nativeEnum(EducationContentType).optional(),
  tags: z.string().optional(), // comma-separated
  search: z.string().optional(),
  isPublished: z.boolean().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

const submitQuizSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    timeSpent: z.number(),
  })),
  timeSpent: z.number(),
});

const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  currentChapter: z.number().optional(),
  timeSpent: z.number(),
  notes: z.string().optional(),
});

// List education content with filters and pagination
app.get('/', zValidator('query', filtersSchema), async (c) => {
  try {
    const {
      subject,
      ageTier,
      difficultyLevel,
      contentType,
      tags,
      search,
      isPublished,
      page,
      limit,
    } = c.req.valid('query');

    const offset = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    if (subject) where.subject = subject;
    if (ageTier) where.ageTier = ageTier;
    if (difficultyLevel) where.difficultyLevel = difficultyLevel;
    if (contentType) where.contentType = contentType;
    if (isPublished !== undefined) where.isPublished = isPublished;

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = {
        hasSome: tagArray,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const [contents, total] = await Promise.all([
      prisma.educationContent.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              userProgress: true,
              quizAttempts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.educationContent.count({ where }),
    ]);

    return c.json({
      data: contents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching education content:', error);
    return c.json({ error: 'Failed to fetch education content' }, 500);
  }
});

// Get single education content by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const content = await prisma.educationContent.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true },
        },
        quizQuestions: {
          orderBy: { order: 'asc' },
        },
        lessonChapters: {
          orderBy: { order: 'asc' },
        },
        lessonResources: true,
        _count: {
          select: {
            userProgress: true,
            quizAttempts: true,
          },
        },
      },
    });

    if (!content) {
      return c.json({ error: 'Content not found' }, 404);
    }

    return c.json({ content });
  } catch (error) {
    console.error('Error fetching education content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Create new education content (Admin/Moderator only)
app.post('/', requireAuth, requireRole(['ADMIN', 'MODERATOR']), zValidator('json', createContentSchema), async (c) => {
  try {
    const user = c.get('user');
    const data = c.req.valid('json');

    const content = await prisma.educationContent.create({
      data: {
        ...data,
        authorId: user.id,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    return c.json({ content }, 201);
  } catch (error) {
    console.error('Error creating education content:', error);
    return c.json({ error: 'Failed to create content' }, 500);
  }
});

// Update education content (Admin/Moderator only)
app.put('/:id', requireAuth, requireRole(['ADMIN', 'MODERATOR']), zValidator('json', updateContentSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    const content = await prisma.educationContent.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    return c.json({ content });
  } catch (error) {
    console.error('Error updating education content:', error);
    return c.json({ error: 'Failed to update content' }, 500);
  }
});

// Delete education content (Admin only)
app.delete('/:id', requireAuth, requireRole(['ADMIN']), async (c) => {
  try {
    const id = c.req.param('id');

    await prisma.educationContent.delete({
      where: { id },
    });

    return c.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting education content:', error);
    return c.json({ error: 'Failed to delete content' }, 500);
  }
});

// Submit quiz answers
app.post('/:id/submit-quiz', requireAuth, zValidator('json', submitQuizSchema), async (c) => {
  try {
    const user = c.get('user');
    const quizId = c.req.param('id');
    const { answers, timeSpent } = c.req.valid('json');

    // Get quiz with questions
    const quiz = await prisma.educationContent.findUnique({
      where: { id: quizId, contentType: 'QUIZ' },
      include: {
        quizQuestions: true,
      },
    });

    if (!quiz) {
      return c.json({ error: 'Quiz not found' }, 404);
    }

    // Check if user has exceeded max attempts
    const attemptCount = await prisma.quizAttempt.count({
      where: { userId: user.id, quizId },
    });

    if (quiz.maxAttempts && attemptCount >= quiz.maxAttempts) {
      return c.json({ error: 'Maximum attempts exceeded' }, 400);
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = answers.map(answer => {
      const question = quiz.quizQuestions.find(q => q.id === answer.questionId);
      const isCorrect = question ? question.correctAnswer === answer.answer : false;
      if (isCorrect) correctAnswers++;

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        timeSpent: answer.timeSpent,
      };
    });

    const score = Math.round((correctAnswers / quiz.quizQuestions.length) * 100);
    const isPassed = score >= (quiz.passingScore || 70);

    // Save quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        answers: processedAnswers,
        score,
        totalQuestions: quiz.quizQuestions.length,
        correctAnswers,
        timeSpent,
        startedAt: new Date(Date.now() - timeSpent * 60 * 1000),
        completedAt: new Date(),
        isPassed,
      },
    });

    // Update or create user progress
    await prisma.userProgress.upsert({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId: quizId,
        },
      },
      update: {
        status: isPassed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        progress: isPassed ? 100 : Math.max(score, 0),
        score,
        attempts: { increment: 1 },
        lastAccessed: new Date(),
        completedAt: isPassed ? new Date() : undefined,
        timeSpent: { increment: timeSpent },
      },
      create: {
        userId: user.id,
        contentId: quizId,
        status: isPassed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        progress: isPassed ? 100 : Math.max(score, 0),
        score,
        attempts: 1,
        lastAccessed: new Date(),
        completedAt: isPassed ? new Date() : undefined,
        timeSpent,
      },
    });

    return c.json({
      attempt: {
        id: attempt.id,
        score,
        totalQuestions: quiz.quizQuestions.length,
        correctAnswers,
        isPassed,
        timeSpent,
      },
      showCorrectAnswers: quiz.showCorrectAnswers,
      correctAnswers: quiz.showCorrectAnswers ? processedAnswers : undefined,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return c.json({ error: 'Failed to submit quiz' }, 500);
  }
});

// Update user progress
app.put('/:id/progress', requireAuth, zValidator('json', updateProgressSchema), async (c) => {
  try {
    const user = c.get('user');
    const contentId = c.req.param('id');
    const { progress, currentChapter, timeSpent, notes } = c.req.valid('json');

    const status = progress >= 100 ? ProgressStatus.COMPLETED : 
                   progress > 0 ? ProgressStatus.IN_PROGRESS : ProgressStatus.NOT_STARTED;

    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId,
        },
      },
      update: {
        status,
        progress,
        currentChapter,
        timeSpent: { increment: timeSpent },
        notes,
        lastAccessed: new Date(),
        completedAt: progress >= 100 ? new Date() : undefined,
      },
      create: {
        userId: user.id,
        contentId,
        status,
        progress,
        currentChapter,
        timeSpent,
        notes,
        lastAccessed: new Date(),
        completedAt: progress >= 100 ? new Date() : undefined,
      },
    });

    return c.json({ progress: userProgress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return c.json({ error: 'Failed to update progress' }, 500);
  }
});

// Get user's progress for all content
app.get('/progress/me', requireAuth, async (c) => {
  try {
    const user = c.get('user');

    const progress = await prisma.userProgress.findMany({
      where: { userId: user.id },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            subject: true,
            contentType: true,
            estimatedDuration: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { lastAccessed: 'desc' },
    });

    return c.json({ progress });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return c.json({ error: 'Failed to fetch progress' }, 500);
  }
});

// Get user's quiz attempts
app.get('/quiz-attempts/me', requireAuth, async (c) => {
  try {
    const user = c.get('user');

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            passingScore: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    return c.json({ attempts });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return c.json({ error: 'Failed to fetch quiz attempts' }, 500);
  }
});

// Get education analytics (Admin only)
app.get('/analytics', requireAuth, requireRole(['ADMIN']), async (c) => {
  try {
    const [
      totalContents,
      totalUsers,
      totalProgress,
      contentStats,
      subjectStats,
      ageStats,
      difficultyStats,
    ] = await Promise.all([
      prisma.educationContent.count(),
      prisma.user.count(),
      prisma.userProgress.count(),
      prisma.userProgress.aggregate({
        _avg: { progress: true, score: true },
      }),
      prisma.educationContent.groupBy({
        by: ['subject'],
        _count: { id: true },
      }),
      prisma.educationContent.groupBy({
        by: ['ageTier'],
        _count: { id: true },
      }),
      prisma.educationContent.groupBy({
        by: ['difficultyLevel'],
        _count: { id: true },
      }),
    ]);

    const completionRate = contentStats._avg.progress || 0;
    const averageScore = contentStats._avg.score || 0;

    return c.json({
      totalContents,
      totalUsers,
      totalProgress,
      completionRate: Math.round(completionRate),
      averageScore: Math.round(averageScore),
      popularSubjects: subjectStats.map(stat => ({
        subject: stat.subject,
        count: stat._count.id,
      })),
      ageDistribution: ageStats.map(stat => ({
        ageTier: stat.ageTier,
        count: stat._count.id,
      })),
      difficultyDistribution: difficultyStats.map(stat => ({
        level: stat.difficultyLevel,
        count: stat._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching education analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Get user education statistics
app.get('/stats/me', requireAuth, async (c) => {
  try {
    const user = c.get('user');

    const [
      completedContents,
      progressStats,
      certificates,
      subjectProgress,
    ] = await Promise.all([
      prisma.userProgress.count({
        where: { userId: user.id, status: ProgressStatus.COMPLETED },
      }),
      prisma.userProgress.aggregate({
        where: { userId: user.id },
        _sum: { timeSpent: true },
        _avg: { score: true },
      }),
      prisma.educationCertificate.count({
        where: { userId: user.id },
      }),
      prisma.userProgress.findMany({
        where: { userId: user.id },
        include: {
          content: {
            select: { subject: true },
          },
        },
      }),
    ]);

    // Calculate subject progress
    const subjectMap = new Map();
    subjectProgress.forEach(progress => {
      const subject = progress.content.subject;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, { completed: 0, total: 0 });
      }
      const stats = subjectMap.get(subject);
      stats.total++;
      if (progress.status === ProgressStatus.COMPLETED) {
        stats.completed++;
      }
    });

    const progressBySubject = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      completed: stats.completed,
      total: stats.total,
    }));

    // Find favorite subject (most completed content)
    const favoriteSubject = progressBySubject.reduce((prev, current) => 
      (current.completed > prev.completed) ? current : prev
    )?.subject || IslamicSubject.QURAN;

    return c.json({
      totalContentsCompleted: completedContents,
      totalTimeSpent: progressStats._sum.timeSpent || 0,
      averageScore: Math.round(progressStats._avg.score || 0),
      certificates,
      currentStreak: 0, // TODO: Implement streak calculation
      longestStreak: 0, // TODO: Implement streak calculation
      favoriteSubject,
      progressBySubject,
    });
  } catch (error) {
    console.error('Error fetching user education stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export default app;