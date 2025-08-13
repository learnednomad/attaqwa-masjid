import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { PrismaClient } from '../../../db/src/generated/index.js';
import { requireAuth, requireRole } from '../middleware/auth';

const app = new Hono();
const prisma = new PrismaClient();

// Simple validation schemas that match the actual database schema
const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  content: z.string().min(1),
  contentType: z.enum(['LESSON', 'QUIZ', 'VIDEO', 'AUDIO', 'READING', 'INTERACTIVE']),
  subject: z.enum(['QURAN', 'HADITH', 'FIQH', 'AQIDAH', 'SEERAH', 'ISLAMIC_HISTORY', 'ARABIC_LANGUAGE', 'DUA_DHIKR', 'ISLAMIC_ETIQUETTE', 'COMPARATIVE_RELIGION', 'TAFSIR', 'AKHLAQ', 'WORSHIP', 'SIRA', 'HISTORY']),
  ageTier: z.enum(['CHILDREN', 'YOUTH', 'ADULTS', 'SENIORS', 'ALL_AGES']),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'SCHOLAR']),
  estimatedDuration: z.number().positive(),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  mediaUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  arabicContent: z.string().optional(),
  transliteration: z.string().optional(),
  translation: z.string().optional(),
});

const filtersSchema = z.object({
  subject: z.enum(['QURAN', 'HADITH', 'FIQH', 'AQIDAH', 'SEERAH', 'ISLAMIC_HISTORY', 'ARABIC_LANGUAGE', 'DUA_DHIKR', 'ISLAMIC_ETIQUETTE', 'COMPARATIVE_RELIGION', 'TAFSIR', 'AKHLAQ', 'WORSHIP', 'SIRA', 'HISTORY']).optional(),
  ageTier: z.enum(['CHILDREN', 'YOUTH', 'ADULTS', 'SENIORS', 'ALL_AGES']).optional(),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'SCHOLAR']).optional(),
  contentType: z.enum(['LESSON', 'QUIZ', 'VIDEO', 'AUDIO', 'READING', 'INTERACTIVE']).optional(),
  search: z.string().optional(),
  isPublished: z.boolean().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

// Get education content with filters (WORKING VERSION)
app.get('/', zValidator('query', filtersSchema), async (c) => {
  try {
    const {
      subject,
      ageTier,
      difficultyLevel,
      contentType,
      search,
      isPublished,
      page,
      limit,
    } = c.req.valid('query');

    const offset = (page - 1) * limit;

    // Build where conditions that match actual schema
    const where: any = {};

    if (subject) where.subject = subject;
    if (ageTier) where.ageTier = ageTier;
    if (difficultyLevel) where.difficultyLevel = difficultyLevel;
    if (contentType) where.contentType = contentType;
    if (isPublished !== undefined) where.isPublished = isPublished;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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

// Get single education content by ID (WORKING VERSION)
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const content = await prisma.educationContent.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true },
        },
        chapters: {
          orderBy: { order: 'asc' },
        },
        resources: true,
        _count: {
          select: {
            userProgress: true,
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

// Create new education content (Admin only) - SIMPLIFIED VERSION
app.post('/', requireAuth, requireRole('admin'), zValidator('json', createContentSchema), async (c) => {
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

// Update education content (Admin only) - SIMPLIFIED VERSION
app.put('/:id', requireAuth, requireRole('admin'), zValidator('json', createContentSchema.partial()), async (c) => {
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
app.delete('/:id', requireAuth, requireRole('admin'), async (c) => {
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

// Get user progress (SIMPLIFIED VERSION)
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

// Update user progress (SIMPLIFIED VERSION)
app.put('/:id/progress', requireAuth, zValidator('json', z.object({
  progress: z.number().min(0).max(100),
  timeSpent: z.number(),
  notes: z.string().optional(),
})), async (c) => {
  try {
    const user = c.get('user');
    const contentId = c.req.param('id');
    const { progress, timeSpent, notes } = c.req.valid('json');

    const status = progress >= 100 ? 'COMPLETED' : 
                   progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

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

export default app;