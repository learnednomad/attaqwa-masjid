/**
 * Seerah Course & Quiz Management API
 * Comprehensive LMS endpoints for the authentic Seerah curriculum
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { PrismaClient } from '../../../db/src/generated/index.js';
import { requireAuth, requireRole } from '../middleware/auth';

const app = new Hono();
const prisma = new PrismaClient();

// ============================================
// SEERAH MODULE ENDPOINTS
// ============================================

/**
 * GET /api/seerah/modules
 * Get all Seerah modules with progress
 */
app.get('/modules', async (c) => {
  try {
    const user = c.get('user');
    const userId = user?.id;

    const modules = await prisma.educationContent.findMany({
      where: {
        subject: 'SEERAH',
        contentType: 'LESSON',
        isPublished: true,
      },
      include: {
        chapters: {
          select: {
            id: true,
            title: true,
            order: true,
            estimatedDuration: true,
          },
          orderBy: { order: 'asc' },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            _count: {
              select: { questions: true },
            },
          },
        },
        ...(userId ? {
          userProgress: {
            where: { userId },
            select: {
              progress: true,
              status: true,
              completedAt: true,
              score: true,
              attempts: true,
            },
          },
        } : {}),
      },
      orderBy: [
        { title: 'asc' }, // Orders Module 1-8
      ],
    });

    // Calculate overall progress if user is authenticated
    let overallProgress = null;
    if (userId) {
      const totalModules = modules.length;
      const completedModules = modules.filter(m => 
        m.userProgress?.[0]?.status === 'COMPLETED'
      ).length;
      
      overallProgress = {
        totalModules,
        completedModules,
        progressPercentage: totalModules > 0 
          ? Math.round((completedModules / totalModules) * 100) 
          : 0,
      };
    }

    return c.json({
      modules: modules.map(module => ({
        ...module,
        userProgress: module.userProgress?.[0] || null,
      })),
      overallProgress,
    });
  } catch (error) {
    console.error('Error fetching Seerah modules:', error);
    return c.json({ error: 'Failed to fetch Seerah modules' }, 500);
  }
});

/**
 * GET /api/seerah/modules/:moduleId
 * Get specific module with chapters and quiz
 */
app.get('/modules/:moduleId', requireAuth, async (c) => {
  try {
    const moduleId = c.req.param('moduleId');
    const user = c.get('user');

    const module = await prisma.educationContent.findUnique({
      where: { id: moduleId },
      include: {
        author: {
          select: { id: true, name: true },
        },
        chapters: {
          orderBy: { order: 'asc' },
        },
        resources: {
          orderBy: { order: 'asc' },
        },
        quizzes: {
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
        islamicReferences: true,
      },
    });

    if (!module) {
      return c.json({ error: 'Module not found' }, 404);
    }

    // Get or create user progress
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId: moduleId,
        },
      },
      update: {
        lastAccessed: new Date(),
      },
      create: {
        userId: user.id,
        contentId: moduleId,
        status: 'IN_PROGRESS',
        progress: 0,
      },
    });

    // Get quiz attempts if any
    const quizAttempts = module.quizzes[0] 
      ? await prisma.quizAttempt.findMany({
          where: {
            userId: user.id,
            quizId: module.quizzes[0].id,
          },
          orderBy: { startedAt: 'desc' },
          take: 5,
        })
      : [];

    // Increment view count
    await prisma.educationContent.update({
      where: { id: moduleId },
      data: { viewCount: { increment: 1 } },
    });

    return c.json({
      module,
      userProgress,
      quizAttempts,
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    return c.json({ error: 'Failed to fetch module' }, 500);
  }
});

/**
 * GET /api/seerah/modules/:moduleId/chapters/:chapterId
 * Get specific chapter with navigation
 */
app.get('/modules/:moduleId/chapters/:chapterId', requireAuth, async (c) => {
  try {
    const { moduleId, chapterId } = c.req.param();
    const user = c.get('user');

    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        contentId: moduleId,
      },
      include: {
        educationContent: {
          select: {
            title: true,
            chapters: {
              select: {
                id: true,
                title: true,
                order: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!chapter) {
      return c.json({ error: 'Chapter not found' }, 404);
    }

    // Update progress
    const totalChapters = chapter.educationContent.chapters.length;
    const progressPercentage = Math.floor((chapter.order / totalChapters) * 100);

    await prisma.userProgress.update({
      where: {
        userId_contentId: {
          userId: user.id,
          contentId: moduleId,
        },
      },
      data: {
        currentChapter: chapter.order,
        progress: progressPercentage,
        lastAccessed: new Date(),
        status: progressPercentage === 100 ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: progressPercentage === 100 ? new Date() : undefined,
      },
    });

    // Navigation
    const navigation = {
      previous: chapter.educationContent.chapters.find(ch => ch.order === chapter.order - 1),
      next: chapter.educationContent.chapters.find(ch => ch.order === chapter.order + 1),
      current: chapter.order,
      total: totalChapters,
    };

    return c.json({
      chapter,
      navigation,
      progressPercentage,
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return c.json({ error: 'Failed to fetch chapter' }, 500);
  }
});

// ============================================
// QUIZ ENDPOINTS
// ============================================

/**
 * GET /api/seerah/quizzes/:quizId
 * Get quiz questions (without answers for active attempt)
 */
app.get('/quizzes/:quizId', requireAuth, async (c) => {
  try {
    const quizId = c.req.param('quizId');
    const user = c.get('user');

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: {
              select: {
                id: true,
                text: true,
                order: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        content: {
          select: {
            id: true,
            title: true,
            subject: true,
          },
        },
      },
    });

    if (!quiz) {
      return c.json({ error: 'Quiz not found' }, 404);
    }

    // Check attempts
    const attempts = await prisma.quizAttempt.count({
      where: {
        userId: user.id,
        quizId,
        completedAt: { not: null },
      },
    });

    const canAttempt = attempts < quiz.maxAttempts;

    // Shuffle questions if enabled
    let questions = [...quiz.questions];
    if (quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    return c.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        questions: questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          arabicText: q.arabicText,
          questionType: q.questionType,
          points: q.points,
          options: q.options,
        })),
      },
      moduleInfo: quiz.content,
      attemptInfo: {
        attemptsUsed: attempts,
        attemptsRemaining: quiz.maxAttempts - attempts,
        canAttempt,
      },
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return c.json({ error: 'Failed to fetch quiz' }, 500);
  }
});

/**
 * POST /api/seerah/quizzes/:quizId/start
 * Start a quiz attempt
 */
app.post('/quizzes/:quizId/start', requireAuth, async (c) => {
  try {
    const quizId = c.req.param('quizId');
    const user = c.get('user');

    // Check for active attempt
    const activeAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: user.id,
        quizId,
        completedAt: null,
      },
    });

    if (activeAttempt) {
      return c.json({
        attemptId: activeAttempt.id,
        message: 'Resuming active attempt',
      });
    }

    // Check attempt limit
    const completedAttempts = await prisma.quizAttempt.count({
      where: {
        userId: user.id,
        quizId,
        completedAt: { not: null },
      },
    });

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: { select: { questions: true } },
      },
    });

    if (!quiz) {
      return c.json({ error: 'Quiz not found' }, 404);
    }

    if (completedAttempts >= quiz.maxAttempts) {
      return c.json({ error: 'No attempts remaining' }, 403);
    }

    // Create new attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        score: 0,
        totalQuestions: quiz._count.questions,
        correctAnswers: 0,
        timeSpent: 0,
        isPassed: false,
      },
    });

    return c.json({
      attemptId: attempt.id,
      timeLimit: quiz.timeLimit,
      totalQuestions: quiz._count.questions,
      startedAt: attempt.startedAt,
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return c.json({ error: 'Failed to start quiz' }, 500);
  }
});

/**
 * POST /api/seerah/quizzes/submit
 * Submit quiz answers and get results
 */
const submitQuizSchema = z.object({
  attemptId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionId: z.string().optional(),
    textAnswer: z.string().optional(),
    timeSpent: z.number().default(0),
  })),
  totalTimeSpent: z.number(),
});

app.post('/quizzes/submit', requireAuth, zValidator('json', submitQuizSchema), async (c) => {
  try {
    const user = c.get('user');
    const { attemptId, answers, totalTimeSpent } = c.req.valid('json');

    // Verify attempt
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId: user.id,
        completedAt: null,
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true,
              },
              orderBy: { order: 'asc' },
            },
            content: true,
          },
        },
      },
    });

    if (!attempt) {
      return c.json({ error: 'Invalid or completed attempt' }, 400);
    }

    // Grade the quiz
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const results = [];

    for (const answer of answers) {
      const question = attempt.quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      totalPoints += question.points;
      let isCorrect = false;
      let correctAnswer = '';

      if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') {
        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = selectedOption?.isCorrect || false;
        correctAnswer = correctOption?.text || '';
      } else if (question.questionType === 'SHORT_ANSWER' && answer.textAnswer) {
        // For Seerah short answers, check key terms
        // This is simplified - in production, use more sophisticated matching
        const keyTerms = {
          'Halimah': ['halimah', 'sa\'diyyah'],
          'Waraqah': ['waraqah', 'nawfal'],
          'Zayd': ['zayd', 'amr', 'nufayl'],
          'Abdullah': ['abdullah', 'urayqit'],
        };
        
        const lowerAnswer = answer.textAnswer.toLowerCase();
        for (const [correct, terms] of Object.entries(keyTerms)) {
          if (terms.some(term => lowerAnswer.includes(term))) {
            isCorrect = true;
            correctAnswer = correct;
            break;
          }
        }
      }

      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      results.push({
        questionId: question.id,
        isCorrect,
        earnedPoints: isCorrect ? question.points : 0,
        correctAnswer,
        explanation: question.explanation,
        reference: question.reference,
      });

      // Save answer
      await prisma.quizAnswer.create({
        data: {
          attemptId,
          questionId: answer.questionId,
          selectedAnswer: answer.selectedOptionId || answer.textAnswer || '',
          isCorrect,
          points: isCorrect ? question.points : 0,
          timeSpent: answer.timeSpent,
        },
      });
    }

    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = scorePercentage >= attempt.quiz.passingScore;

    // Update attempt
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score: scorePercentage,
        correctAnswers: correctCount,
        timeSpent: totalTimeSpent,
        isPassed,
        completedAt: new Date(),
      },
    });

    // Update module progress if quiz passed
    if (isPassed && attempt.quiz.contentId) {
      const currentProgress = await prisma.userProgress.findUnique({
        where: {
          userId_contentId: {
            userId: user.id,
            contentId: attempt.quiz.contentId,
          },
        },
      });

      if (currentProgress && currentProgress.progress < 100) {
        await prisma.userProgress.update({
          where: {
            userId_contentId: {
              userId: user.id,
              contentId: attempt.quiz.contentId,
            },
          },
          data: {
            progress: 100,
            status: 'COMPLETED',
            completedAt: new Date(),
            score: scorePercentage,
            attempts: { increment: 1 },
          },
        });
      }
    }

    // Check for achievements
    const newAchievements = await checkSeerahAchievements(user.id, scorePercentage, attempt.quiz.contentId);

    // Check if eligible for certificate
    const certificate = await checkForCertificate(user.id);

    return c.json({
      results: {
        score: scorePercentage,
        isPassed,
        correctAnswers: correctCount,
        totalQuestions: attempt.totalQuestions,
        passingScore: attempt.quiz.passingScore,
        timeSpent: totalTimeSpent,
      },
      detailedResults: attempt.quiz.showCorrectAnswers ? results : undefined,
      achievements: newAchievements,
      certificate,
      nextModule: await getNextModule(attempt.quiz.contentId),
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return c.json({ error: 'Failed to submit quiz' }, 500);
  }
});

// ============================================
// PROGRESS & ACHIEVEMENTS
// ============================================

/**
 * GET /api/seerah/progress
 * Get user's Seerah learning progress
 */
app.get('/progress', requireAuth, async (c) => {
  try {
    const user = c.get('user');

    const progress = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        content: {
          subject: 'SEERAH',
        },
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            estimatedDuration: true,
            chapters: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { lastAccessed: 'desc' },
    });

    // Calculate statistics
    const stats = {
      modulesStarted: progress.filter(p => p.status === 'IN_PROGRESS').length,
      modulesCompleted: progress.filter(p => p.status === 'COMPLETED').length,
      totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
      averageScore: progress
        .filter(p => p.score !== null)
        .reduce((sum, p, _, arr) => sum + (p.score! / (arr.length || 1)), 0),
      currentStreak: await calculateStreak(user.id),
    };

    // Get achievements
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId: user.id,
        achievement: {
          subject: 'SEERAH',
        },
      },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    // Get certificates
    const certificates = await prisma.educationCertificate.findMany({
      where: {
        userId: user.id,
        title: { contains: 'Seerah' },
      },
      orderBy: { issuedAt: 'desc' },
    });

    // Learning path progress
    const learningPath = await prisma.userLearningPath.findFirst({
      where: {
        userId: user.id,
        path: {
          subject: 'SEERAH',
        },
      },
      include: {
        path: {
          include: {
            items: {
              include: {
                content: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return c.json({
      moduleProgress: progress,
      statistics: stats,
      achievements,
      certificates,
      learningPath: learningPath ? {
        pathTitle: learningPath.path.title,
        totalModules: learningPath.path.items.length,
        completedModules: progress.filter(p => p.status === 'COMPLETED').length,
        currentModule: learningPath.currentItemId,
        progressPercentage: learningPath.progress,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return c.json({ error: 'Failed to fetch progress' }, 500);
  }
});

/**
 * GET /api/seerah/certificates/:code/verify
 * Verify certificate authenticity
 */
app.get('/certificates/:code/verify', async (c) => {
  try {
    const code = c.req.param('code');

    const certificate = await prisma.educationCertificate.findUnique({
      where: { verificationCode: code },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!certificate) {
      return c.json({ error: 'Invalid certificate' }, 404);
    }

    const isValid = !certificate.expiresAt || certificate.expiresAt > new Date();

    return c.json({
      valid: isValid,
      certificate: {
        title: certificate.title,
        studentName: certificate.user.name,
        issuedAt: certificate.issuedAt,
        issuer: certificate.issuerName,
        description: certificate.description,
      },
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return c.json({ error: 'Failed to verify certificate' }, 500);
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkSeerahAchievements(userId: string, score: number, contentId: string | null) {
  const newAchievements = [];

  // Check quiz score achievements
  if (score >= 90) {
    const quizMaster = await prisma.achievement.findFirst({
      where: {
        title: 'Quiz Master',
        subject: 'SEERAH',
      },
    });

    if (quizMaster) {
      const exists = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: quizMaster.id,
          },
        },
      });

      if (!exists) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: quizMaster.id,
          },
        });
        newAchievements.push(quizMaster);
      }
    }
  }

  // Check module completion achievements
  if (contentId) {
    const completedCount = await prisma.userProgress.count({
      where: {
        userId,
        status: 'COMPLETED',
        content: {
          subject: 'SEERAH',
        },
      },
    });

    const achievements = await prisma.achievement.findMany({
      where: {
        criteriaType: 'COMPLETION',
        criteriaValue: { lte: completedCount },
        subject: 'SEERAH',
      },
    });

    for (const achievement of achievements) {
      const exists = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (!exists) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });
        newAchievements.push(achievement);
      }
    }
  }

  return newAchievements;
}

async function checkForCertificate(userId: string) {
  // Check if all 8 Seerah modules are complete
  const seerahModules = await prisma.educationContent.count({
    where: {
      subject: 'SEERAH',
      contentType: 'LESSON',
      isPublished: true,
    },
  });

  const completedModules = await prisma.userProgress.count({
    where: {
      userId,
      status: 'COMPLETED',
      content: {
        subject: 'SEERAH',
        contentType: 'LESSON',
      },
    },
  });

  if (completedModules >= seerahModules && seerahModules > 0) {
    // Check if certificate already exists
    const existingCert = await prisma.educationCertificate.findFirst({
      where: {
        userId,
        title: { contains: 'Seerah Curriculum' },
      },
    });

    if (!existingCert) {
      // Generate certificate
      const verificationCode = `SEERAH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

      const certificate = await prisma.educationCertificate.create({
        data: {
          userId,
          title: 'Certificate of Completion - Authentic Seerah Curriculum',
          description: 'This certifies the successful completion of all 8 modules of the authentic Seerah curriculum based on The Sealed Nectar, Ibn Kathir, and Al-Baghawi, with all assessments passed.',
          verificationCode,
          issuerName: 'Masjid At-Taqwa Education Department',
          issuerSignature: 'Islamic Education Board',
        },
      });

      return certificate;
    }
  }

  return null;
}

async function getNextModule(currentModuleId: string | null) {
  if (!currentModuleId) return null;

  const currentModule = await prisma.educationContent.findUnique({
    where: { id: currentModuleId },
    select: { title: true },
  });

  if (!currentModule) return null;

  // Extract module number (assumes "Module X:" format)
  const match = currentModule.title.match(/Module (\d+):/);
  if (!match) return null;

  const currentNumber = parseInt(match[1]);
  const nextNumber = currentNumber + 1;

  const nextModule = await prisma.educationContent.findFirst({
    where: {
      title: { contains: `Module ${nextNumber}:` },
      subject: 'SEERAH',
      contentType: 'LESSON',
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  });

  return nextModule;
}

async function calculateStreak(userId: string) {
  const activities = await prisma.userProgress.findMany({
    where: {
      userId,
      content: {
        subject: 'SEERAH',
      },
    },
    orderBy: { lastAccessed: 'desc' },
    take: 30,
  });

  if (activities.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    const hasActivity = activities.some(a => {
      const activityDate = new Date(a.lastAccessed);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === checkDate.getTime();
    });

    if (hasActivity) {
      streak++;
    } else if (i > 0) {
      break; // Streak broken
    }
  }

  return streak;
}

export default app;