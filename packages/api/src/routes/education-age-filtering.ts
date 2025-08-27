import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { z } from 'zod';
import { PrismaClient, AgeTier, EducationContentType, IslamicSubject, DifficultyLevel } from '@attaqwa/db';

// JWT middleware with proper secret
const jwtAuth = jwt({ secret: process.env.JWT_SECRET || 'default-jwt-secret' });

const prisma = new PrismaClient();
const education = new Hono();

// American Muslim Age Group Mapping
const AGE_GROUP_MAPPING = {
  PRESCHOOL: { minAge: 3, maxAge: 4, grades: ['Pre-K'] },
  ELEMENTARY: { minAge: 5, maxAge: 8, grades: ['K', '1', '2', '3'] },
  MIDDLE_SCHOOL: { minAge: 9, maxAge: 12, grades: ['4', '5', '6', '7'] },
  HIGH_SCHOOL: { minAge: 13, maxAge: 17, grades: ['8', '9', '10', '11', '12'] },
  COLLEGE: { minAge: 18, maxAge: 22, grades: ['Freshman', 'Sophomore', 'Junior', 'Senior'] },
  ADULTS: { minAge: 23, maxAge: 59, grades: ['Adult'] },
  SENIORS: { minAge: 60, maxAge: 120, grades: ['Senior'] }
};

// Validation schemas
const AgeFilterSchema = z.object({
  ageTier: z.nativeEnum(AgeTier).optional(),
  minAge: z.number().min(3).max(120).optional(),
  maxAge: z.number().min(3).max(120).optional(),
  gradeLevel: z.string().optional(),
  subject: z.nativeEnum(IslamicSubject).optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  contentType: z.nativeEnum(EducationContentType).optional(),
  language: z.enum(['en', 'ar', 'bilingual']).default('en'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

// Helper function to calculate age from birthdate
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to determine age tier from age
function getAgeTierFromAge(age: number): AgeTier {
  if (age >= 3 && age <= 4) return 'PRESCHOOL' as AgeTier;
  if (age >= 5 && age <= 8) return 'ELEMENTARY' as AgeTier;
  if (age >= 9 && age <= 12) return 'MIDDLE_SCHOOL' as AgeTier;
  if (age >= 13 && age <= 17) return 'HIGH_SCHOOL' as AgeTier;
  if (age >= 18 && age <= 22) return 'COLLEGE' as AgeTier;
  if (age >= 23 && age <= 59) return 'ADULTS' as AgeTier;
  if (age >= 60) return 'SENIORS' as AgeTier;
  return 'ALL_AGES' as AgeTier;
}

// Get age-appropriate content with smart filtering
education.get('/content/age-appropriate', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const query = AgeFilterSchema.parse(c.req.query());
    
    // Get user's profile including family info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        family: true
      }
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Calculate user's age and appropriate tier
    let userAge: number | null = null;
    let userAgeTier: AgeTier = user.ageTier || 'ALL_AGES' as AgeTier;
    
    if (user.birthDate) {
      userAge = calculateAge(user.birthDate);
      userAgeTier = getAgeTierFromAge(userAge);
    }
    
    // Build content query
    const whereClause: any = {
      isPublished: true,
      AND: []
    };
    
    // Age-based filtering
    if (query.ageTier) {
      whereClause.ageTier = query.ageTier;
    } else if (userAge) {
      // Smart age filtering based on user's actual age
      whereClause.AND.push({
        OR: [
          { ageTier: userAgeTier },
          { ageTier: 'ALL_AGES' },
          {
            AND: [
              { minAge: { lte: userAge } },
              { maxAge: { gte: userAge } }
            ]
          }
        ]
      });
    }
    
    // Additional filters
    if (query.subject) {
      whereClause.subject = query.subject;
    }
    
    if (query.difficulty) {
      whereClause.difficultyLevel = query.difficulty;
    }
    
    if (query.contentType) {
      whereClause.contentType = query.contentType;
    }
    
    // Language filtering for American Muslims
    if (query.language === 'ar') {
      whereClause.arabicContent = { not: null };
    } else if (query.language === 'bilingual') {
      whereClause.AND.push({
        arabicContent: { not: null },
        content: { not: null }
      });
    }
    
    // Check for parental restrictions
    const restrictions = await prisma.contentRestriction.findMany({
      where: { userId },
      select: { contentId: true }
    });
    
    if (restrictions.length > 0) {
      whereClause.id = {
        notIn: restrictions.map(r => r.contentId)
      };
    }
    
    // Fetch content with progress
    const content = await prisma.educationContent.findMany({
      where: whereClause,
      include: {
        userProgress: {
          where: { userId },
          select: {
            progress: true,
            status: true,
            lastAccessed: true
          }
        },
        quizzes: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: query.offset,
      take: query.limit
    });
    
    // Transform for American Muslim context
    const transformedContent = content.map(item => ({
      ...item,
      ageGroup: AGE_GROUP_MAPPING[userAgeTier as keyof typeof AGE_GROUP_MAPPING],
      isAgeAppropriate: true,
      hasParentalGuidance: item.parentalGuidance,
      progress: item.userProgress[0]?.progress || 0,
      status: item.userProgress[0]?.status || 'NOT_STARTED',
      lastAccessed: item.userProgress[0]?.lastAccessed,
      culturalContext: item.culturalContext || 'american_muslim',
      languageOptions: {
        hasEnglish: !!item.content,
        hasArabic: !!item.arabicContent,
        hasTransliteration: !!item.transliteration
      }
    }));
    
    return c.json({
      content: transformedContent,
      userProfile: {
        age: userAge,
        ageTier: userAgeTier,
        gradeLevel: user.gradeLevel,
        preferredLanguage: user.preferredLanguage
      },
      pagination: {
        limit: query.limit,
        offset: query.offset,
        hasMore: content.length === query.limit
      }
    });
    
  } catch (error) {
    console.error('Error fetching age-appropriate content:', error);
    return c.json({ error: 'Failed to fetch content' }, 500);
  }
});

// Family account management
education.post('/family/setup', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const body = await c.req.json();
    
    const schema = z.object({
      familyName: z.string(),
      spouseEmail: z.string().email().optional(),
      children: z.array(z.object({
        name: z.string(),
        email: z.string().email().optional(),
        birthDate: z.string(),
        gradeLevel: z.string()
      }))
    });
    
    const data = schema.parse(body);
    
    // Create family account
    const family = await prisma.familyAccount.create({
      data: {
        familyName: data.familyName,
        primaryParentId: userId,
        secondaryParentId: data.spouseEmail ? 
          (await prisma.user.findUnique({ where: { email: data.spouseEmail } }))?.id : 
          undefined
      }
    });
    
    // Create child accounts
    const childAccounts = await Promise.all(
      data.children.map(async (child) => {
        const age = calculateAge(new Date(child.birthDate));
        const ageTier = getAgeTierFromAge(age);
        
        return prisma.user.create({
          data: {
            name: child.name,
            email: child.email || `${child.name.toLowerCase().replace(/\s/g, '')}_${family.id}@family.local`,
            password: 'temp_password', // Will be set by parent
            birthDate: new Date(child.birthDate),
            gradeLevel: child.gradeLevel,
            ageTier,
            familyId: family.id,
            parentConsent: true,
            role: 'USER'
          }
        });
      })
    );
    
    return c.json({
      family,
      children: childAccounts.map(child => ({
        id: child.id,
        name: child.name,
        ageTier: child.ageTier,
        gradeLevel: child.gradeLevel
      }))
    });
    
  } catch (error) {
    console.error('Error setting up family account:', error);
    return c.json({ error: 'Failed to setup family account' }, 500);
  }
});

// Parent dashboard - monitor children's progress
education.get('/parent/dashboard', jwtAuth, async (c) => {
  try {
    const parentId = c.get('jwtPayload').sub;
    
    // Get family and children
    const family = await prisma.familyAccount.findFirst({
      where: {
        OR: [
          { primaryParentId: parentId },
          { secondaryParentId: parentId }
        ]
      },
      include: {
        users: {
          where: {
            id: { not: parentId }
          },
          include: {
            userProgress: {
              include: {
                content: {
                  select: {
                    title: true,
                    subject: true,
                    contentType: true
                  }
                }
              },
              orderBy: { lastAccessed: 'desc' },
              take: 5
            },
            quizAttempts: {
              orderBy: { completedAt: 'desc' },
              take: 5,
              include: {
                quiz: {
                  select: {
                    title: true
                  }
                }
              }
            },
            achievements: {
              include: {
                achievement: true
              },
              orderBy: { earnedAt: 'desc' },
              take: 5
            }
          }
        }
      }
    });
    
    if (!family) {
      return c.json({ error: 'Family account not found' }, 404);
    }
    
    // Transform data for parent dashboard
    const dashboard = {
      familyName: family.familyName,
      children: family.users.map(child => ({
        id: child.id,
        name: child.name,
        ageTier: child.ageTier,
        gradeLevel: child.gradeLevel,
        recentActivity: child.userProgress.map(progress => ({
          contentTitle: progress.content.title,
          subject: progress.content.subject,
          progress: progress.progress,
          lastAccessed: progress.lastAccessed,
          timeSpent: progress.timeSpent
        })),
        recentQuizzes: child.quizAttempts.map(attempt => ({
          quizTitle: attempt.quiz.title,
          score: attempt.score,
          isPassed: attempt.isPassed,
          completedAt: attempt.completedAt
        })),
        achievements: child.achievements.map(ua => ({
          title: ua.achievement.title,
          description: ua.achievement.description,
          earnedAt: ua.earnedAt,
          points: ua.achievement.points
        })),
        stats: {
          totalContentCompleted: child.userProgress.filter(p => p.status === 'COMPLETED').length,
          averageQuizScore: child.quizAttempts.length > 0 
            ? child.quizAttempts.reduce((acc, a) => acc + a.score, 0) / child.quizAttempts.length 
            : 0,
          totalTimeSpent: child.userProgress.reduce((acc, p) => acc + p.timeSpent, 0),
          currentStreak: 0 // Calculate based on daily activity
        }
      }))
    };
    
    // Log monitoring action
    await prisma.parentMonitoring.create({
      data: {
        parentId,
        childId: family.users[0]?.id || parentId,
        actionType: 'viewed_progress',
        details: { timestamp: new Date() }
      }
    });
    
    return c.json(dashboard);
    
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    return c.json({ error: 'Failed to fetch dashboard' }, 500);
  }
});

// Content restriction by parent
education.post('/parent/restrict-content', jwtAuth, async (c) => {
  try {
    const parentId = c.get('jwtPayload').sub;
    const body = await c.req.json();
    
    const schema = z.object({
      childId: z.string(),
      contentId: z.string(),
      reason: z.string().optional()
    });
    
    const data = schema.parse(body);
    
    // Verify parent-child relationship
    const family = await prisma.familyAccount.findFirst({
      where: {
        OR: [
          { primaryParentId: parentId },
          { secondaryParentId: parentId }
        ],
        users: {
          some: { id: data.childId }
        }
      }
    });
    
    if (!family) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Create restriction
    const restriction = await prisma.contentRestriction.create({
      data: {
        userId: data.childId,
        contentId: data.contentId,
        restrictedBy: parentId,
        reason: data.reason
      }
    });
    
    // Log action
    await prisma.parentMonitoring.create({
      data: {
        parentId,
        childId: data.childId,
        actionType: 'restricted_content',
        details: { contentId: data.contentId, reason: data.reason }
      }
    });
    
    return c.json({ restriction });
    
  } catch (error) {
    console.error('Error restricting content:', error);
    return c.json({ error: 'Failed to restrict content' }, 500);
  }
});

// Weekend Islamic School class enrollment
education.post('/classes/enroll', jwtAuth, async (c) => {
  try {
    const parentId = c.get('jwtPayload').sub;
    const body = await c.req.json();
    
    const schema = z.object({
      classId: z.string(),
      studentId: z.string()
    });
    
    const data = schema.parse(body);
    
    // Verify parent-child relationship
    const family = await prisma.familyAccount.findFirst({
      where: {
        OR: [
          { primaryParentId: parentId },
          { secondaryParentId: parentId }
        ],
        users: {
          some: { id: data.studentId }
        }
      }
    });
    
    if (!family) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    // Check class availability and age appropriateness
    const islamicClass = await prisma.islamicClass.findUnique({
      where: { id: data.classId }
    });
    
    if (!islamicClass || !islamicClass.isActive) {
      return c.json({ error: 'Class not available' }, 404);
    }
    
    if (islamicClass.currentStudents >= islamicClass.maxStudents) {
      return c.json({ error: 'Class is full' }, 400);
    }
    
    // Enroll student
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: data.classId,
        studentId: data.studentId,
        enrolledBy: parentId
      }
    });
    
    // Update class count
    await prisma.islamicClass.update({
      where: { id: data.classId },
      data: {
        currentStudents: { increment: 1 }
      }
    });
    
    return c.json({ enrollment });
    
  } catch (error) {
    console.error('Error enrolling in class:', error);
    return c.json({ error: 'Failed to enroll' }, 500);
  }
});

export default education;