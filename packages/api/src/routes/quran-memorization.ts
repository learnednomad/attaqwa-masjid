import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { z } from 'zod';
import { PrismaClient } from '@attaqwa/db';

// JWT middleware with proper secret
const jwtAuth = jwt({ secret: process.env.JWT_SECRET || 'default-jwt-secret' });

const prisma = new PrismaClient();
const quran = new Hono();

// Validation schemas
const MemorizationProgressSchema = z.object({
  surahNumber: z.number().min(1).max(114),
  ayahNumber: z.number().min(1),
  memorizationLevel: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  mistakes: z.number().min(0).optional(),
});

const RecordingSchema = z.object({
  surahNumber: z.number().min(1).max(114),
  ayahNumber: z.number().min(1),
  audioData: z.string(), // Base64 encoded audio
  duration: z.number(),
});

const GoalSchema = z.object({
  title: z.string(),
  goalType: z.enum(['surah', 'juz', 'ayahs', 'pages']),
  targetValue: z.number().min(1),
  deadline: z.string().optional(),
});

// Spaced repetition algorithm (SM-2 inspired)
function calculateNextReviewDate(
  memorizationLevel: number,
  reviewCount: number,
  lastMistakes: number
): Date {
  const baseInterval = [1, 3, 7, 14, 30, 60, 120]; // Days
  let intervalIndex = Math.min(reviewCount, baseInterval.length - 1);
  
  // Adjust based on mistakes
  if (lastMistakes > 2) {
    intervalIndex = Math.max(0, intervalIndex - 2);
  } else if (lastMistakes > 0) {
    intervalIndex = Math.max(0, intervalIndex - 1);
  }
  
  // Adjust based on memorization level
  const levelMultiplier = memorizationLevel / 100;
  const days = Math.ceil(baseInterval[intervalIndex] * levelMultiplier);
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

// Get Quran structure (surahs and ayahs)
quran.get('/structure', async (c) => {
  try {
    const surahs = await prisma.surah.findMany({
      orderBy: { number: 'asc' },
      include: {
        ayahs: {
          select: {
            ayahNumber: true,
            juzNumber: true,
            pageNumber: true,
          },
        },
      },
    });
    
    return c.json({ surahs });
  } catch (error) {
    console.error('Error fetching Quran structure:', error);
    return c.json({ error: 'Failed to fetch Quran structure' }, 500);
  }
});

// Get specific surah with ayahs - Public with optional auth for progress
quran.get('/surah/:number', async (c) => {
  try {
    const surahNumber = parseInt(c.req.param('number'));
    // Optional auth - if user is logged in, show their progress
    const userId = c.get('jwtPayload')?.sub;
    
    const surah = await prisma.surah.findUnique({
      where: { number: surahNumber },
      include: {
        ayahs: {
          orderBy: { ayahNumber: 'asc' },
          include: {
            recordings: {
              include: {
                qari: true,
              },
            },
          },
        },
      },
    });
    
    if (!surah) {
      return c.json({ error: 'Surah not found' }, 404);
    }
    
    // Get user's memorization progress for this surah
    let progress = null;
    if (userId) {
      progress = await prisma.memorizationProgress.findMany({
        where: {
          userId,
          surahNumber,
        },
      });
    }
    
    return c.json({
      surah,
      progress: progress || [],
    });
  } catch (error) {
    console.error('Error fetching surah:', error);
    return c.json({ error: 'Failed to fetch surah' }, 500);
  }
});

// Get available Qaris (reciters)
quran.get('/qaris', async (c) => {
  try {
    const qaris = await prisma.qari.findMany({
      orderBy: [
        { isPopular: 'desc' },
        { name: 'asc' },
      ],
    });
    
    return c.json({ qaris });
  } catch (error) {
    console.error('Error fetching qaris:', error);
    return c.json({ error: 'Failed to fetch qaris' }, 500);
  }
});

// Get audio for specific ayah
quran.get('/audio/:surah/:ayah', async (c) => {
  try {
    const surahNumber = parseInt(c.req.param('surah'));
    const ayahNumber = parseInt(c.req.param('ayah'));
    const qariId = c.req.query('qariId');
    
    const ayah = await prisma.ayah.findFirst({
      where: {
        surahNumber,
        ayahNumber,
      },
      include: {
        recordings: {
          where: qariId ? { qariId } : undefined,
          include: {
            qari: true,
          },
        },
      },
    });
    
    if (!ayah) {
      return c.json({ error: 'Ayah not found' }, 404);
    }
    
    return c.json({
      ayah,
      audioUrls: ayah.recordings.map(r => ({
        qari: r.qari.name,
        url: r.audioUrl,
        duration: r.durationSeconds,
      })),
    });
  } catch (error) {
    console.error('Error fetching audio:', error);
    return c.json({ error: 'Failed to fetch audio' }, 500);
  }
});

// Track memorization progress
quran.post('/progress', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const data = MemorizationProgressSchema.parse(await c.req.json());
    
    // Update or create progress record
    const progress = await prisma.memorizationProgress.upsert({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber: data.surahNumber,
          ayahNumber: data.ayahNumber,
        },
      },
      update: {
        memorizationLevel: data.memorizationLevel,
        lastReviewed: new Date(),
        reviewCount: { increment: 1 },
        mistakesCount: data.mistakes || 0,
        timeSpentMinutes: { increment: data.timeSpent },
        isMemorized: data.memorizationLevel >= 80,
        memorizedDate: data.memorizationLevel >= 80 ? new Date() : undefined,
        nextReviewDate: calculateNextReviewDate(
          data.memorizationLevel,
          0, // Will be fetched from current record
          data.mistakes || 0
        ),
      },
      create: {
        userId,
        surahNumber: data.surahNumber,
        ayahNumber: data.ayahNumber,
        memorizationLevel: data.memorizationLevel,
        lastReviewed: new Date(),
        reviewCount: 1,
        mistakesCount: data.mistakes || 0,
        timeSpentMinutes: data.timeSpent,
        isMemorized: data.memorizationLevel >= 80,
        memorizedDate: data.memorizationLevel >= 80 ? new Date() : undefined,
        nextReviewDate: calculateNextReviewDate(
          data.memorizationLevel,
          0,
          data.mistakes || 0
        ),
      },
    });
    
    // Update streak
    await updateUserStreak(userId);
    
    return c.json({ progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return c.json({ error: 'Failed to update progress' }, 500);
  }
});

// Save user recording
quran.post('/recording', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const data = RecordingSchema.parse(await c.req.json());
    
    // In production, you would:
    // 1. Upload audio to cloud storage (S3, etc.)
    // 2. Process audio for quality analysis
    // 3. Run Tajweed analysis (possibly with AI/ML service)
    
    const recording = await prisma.userRecording.create({
      data: {
        userId,
        surahNumber: data.surahNumber,
        ayahNumber: data.ayahNumber,
        audioUrl: `recordings/${userId}/${Date.now()}.mp3`, // Placeholder
        durationSeconds: data.duration,
        // These would be calculated by audio analysis service
        accuracyScore: Math.random() * 100,
        tajweedScore: Math.random() * 100,
        fluencyScore: Math.random() * 100,
      },
    });
    
    return c.json({ recording });
  } catch (error) {
    console.error('Error saving recording:', error);
    return c.json({ error: 'Failed to save recording' }, 500);
  }
});

// Get user's memorization overview
quran.get('/overview', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    
    // Get overall statistics
    const [totalMemorized, inProgress, goals, streak, recentSessions] = await Promise.all([
      prisma.memorizationProgress.count({
        where: { userId, isMemorized: true },
      }),
      prisma.memorizationProgress.count({
        where: { userId, isMemorized: false, memorizationLevel: { gt: 0 } },
      }),
      prisma.memorizationGoal.findMany({
        where: { userId, isCompleted: false },
        orderBy: { deadline: 'asc' },
      }),
      prisma.memorizationStreak.findUnique({
        where: { userId },
      }),
      prisma.memorizationSession.findMany({
        where: { userId },
        orderBy: { sessionDate: 'desc' },
        take: 5,
      }),
    ]);
    
    // Get ayahs due for review
    const dueForReview = await prisma.memorizationProgress.findMany({
      where: {
        userId,
        nextReviewDate: { lte: new Date() },
        isMemorized: true,
      },
      orderBy: { nextReviewDate: 'asc' },
      take: 10,
      include: {
        surah: true,
      },
    });
    
    return c.json({
      stats: {
        totalMemorized,
        inProgress,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
      },
      goals,
      dueForReview,
      recentSessions,
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    return c.json({ error: 'Failed to fetch overview' }, 500);
  }
});

// Create memorization goal
quran.post('/goals', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const data = GoalSchema.parse(await c.req.json());
    
    const goal = await prisma.memorizationGoal.create({
      data: {
        userId,
        title: data.title,
        goalType: data.goalType,
        targetValue: data.targetValue,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });
    
    return c.json({ goal });
  } catch (error) {
    console.error('Error creating goal:', error);
    return c.json({ error: 'Failed to create goal' }, 500);
  }
});

// Start memorization session
quran.post('/session/start', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const body = await c.req.json();
    
    const session = await prisma.memorizationSession.create({
      data: {
        userId,
        sessionType: body.sessionType || 'new',
        surahNumber: body.surahNumber,
        startAyah: body.startAyah,
        endAyah: body.endAyah,
        durationMinutes: 0,
      },
    });
    
    return c.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error starting session:', error);
    return c.json({ error: 'Failed to start session' }, 500);
  }
});

// End memorization session
quran.put('/session/:id/end', jwtAuth, async (c) => {
  try {
    const sessionId = c.req.param('id');
    const body = await c.req.json();
    
    const session = await prisma.memorizationSession.update({
      where: { id: sessionId },
      data: {
        durationMinutes: body.durationMinutes,
        ayahsMemorized: body.ayahsMemorized,
        ayahsReviewed: body.ayahsReviewed,
        accuracyPercentage: body.accuracyPercentage,
      },
    });
    
    return c.json({ session });
  } catch (error) {
    console.error('Error ending session:', error);
    return c.json({ error: 'Failed to end session' }, 500);
  }
});

// Helper function to update user streak
async function updateUserStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const streak = await prisma.memorizationStreak.findUnique({
    where: { userId },
  });
  
  if (!streak) {
    await prisma.memorizationStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        totalDaysActive: 1,
      },
    });
  } else {
    const lastActivity = new Date(streak.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = streak.currentStreak;
    if (daysDiff === 0) {
      // Already updated today
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak = streak.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
    
    await prisma.memorizationStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastActivityDate: today,
        totalDaysActive: streak.totalDaysActive + 1,
      },
    });
  }
}

export default quran;