import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { Hono } from 'hono';
import { PrismaClient } from '../../db/src/generated';
import educationRoutes from '../src/routes/education';
import { 
  AgeTier, 
  EducationContentType, 
  IslamicSubject, 
  DifficultyLevel,
  ProgressStatus,
  QuestionType,
  Role 
} from '@attaqwa/shared';

// Mock authentication middleware
const mockAuth = (user: any) => async (c: any, next: any) => {
  c.set('user', user);
  await next();
};

const mockRequireRole = (roles: string[]) => async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || !roles.includes(user.role)) {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }
  await next();
};

describe('Education API Integration Tests', () => {
  let prisma: PrismaClient;
  let app: Hono;
  let testAdmin: any;
  let testUser: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    app = new Hono();
    
    // Setup test app with mocked middleware
    app.use('*', async (c, next) => {
      // Mock authentication and authorization
      const authHeader = c.req.header('Authorization');
      if (authHeader === 'Bearer admin-token') {
        c.set('user', testAdmin);
      } else if (authHeader === 'Bearer user-token') {
        c.set('user', testUser);
      }
      await next();
    });

    app.route('/education', educationRoutes);

    // Create test users
    testAdmin = await prisma.user.create({
      data: {
        email: 'admin@attaqwa.com',
        password: 'hashedpassword',
        name: 'Test Admin',
        role: Role.ADMIN,
        ageTier: AgeTier.ADULTS
      }
    });

    testUser = await prisma.user.create({
      data: {
        email: 'user@attaqwa.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: Role.USER,
        ageTier: AgeTier.YOUTH
      }
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.educationUserProgress.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.lessonChapter.deleteMany();
    await prisma.lessonResource.deleteMany();
    await prisma.educationContent.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean content between tests
    await prisma.educationUserProgress.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.lessonChapter.deleteMany();
    await prisma.lessonResource.deleteMany();
    await prisma.educationContent.deleteMany();
  });

  describe('GET /education', () => {
    beforeEach(async () => {
      // Create test content
      await prisma.educationContent.createMany({
        data: [
          {
            title: 'Introduction to Islam',
            description: 'Basic principles of Islam',
            content: 'Comprehensive introduction content',
            contentType: EducationContentType.LESSON,
            subject: IslamicSubject.AQIDAH,
            ageTier: AgeTier.ALL_AGES,
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 30,
            tags: ['islam', 'basics', 'aqidah'],
            arabicContent: 'الإسلام',
            transliteration: 'Al-Islam',
            translation: 'Islam - Submission to Allah',
            isPublished: true,
            authorId: testAdmin.id
          },
          {
            title: 'Advanced Fiqh',
            description: 'Complex jurisprudence topics',
            content: 'Advanced fiqh content',
            contentType: EducationContentType.LESSON,
            subject: IslamicSubject.FIQH,
            ageTier: AgeTier.ADULTS,
            difficultyLevel: DifficultyLevel.ADVANCED,
            estimatedDuration: 60,
            tags: ['fiqh', 'advanced'],
            isPublished: true,
            authorId: testAdmin.id
          },
          {
            title: 'Youth Islamic Identity',
            description: 'Building Islamic identity in youth',
            content: 'Youth-focused content',
            contentType: EducationContentType.VIDEO,
            subject: IslamicSubject.ISLAMIC_ETIQUETTE,
            ageTier: AgeTier.YOUTH,
            difficultyLevel: DifficultyLevel.INTERMEDIATE,
            estimatedDuration: 20,
            tags: ['youth', 'identity'],
            isPublished: false, // Not published
            authorId: testAdmin.id
          }
        ]
      });
    });

    it('should fetch published content with proper filtering', async () => {
      const req = new Request('http://localhost/education?isPublished=true&limit=10&page=1');
      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(2); // Only published content
      expect(data.pagination.total).toBe(2);
      
      const titles = data.data.map((item: any) => item.title);
      expect(titles).toContain('Introduction to Islam');
      expect(titles).toContain('Advanced Fiqh');
      expect(titles).not.toContain('Youth Islamic Identity'); // unpublished
    });

    it('should filter by age tier', async () => {
      const req = new Request(`http://localhost/education?ageTier=${AgeTier.YOUTH}&isPublished=true`);
      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(1); // Only ALL_AGES content should show for youth
      expect(data.data[0].ageTier).toBe(AgeTier.ALL_AGES);
    });

    it('should filter by subject', async () => {
      const req = new Request(`http://localhost/education?subject=${IslamicSubject.FIQH}&isPublished=true`);
      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].subject).toBe(IslamicSubject.FIQH);
      expect(data.data[0].title).toBe('Advanced Fiqh');
    });

    it('should search content by title and description', async () => {
      const req = new Request('http://localhost/education?search=introduction&isPublished=true');
      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].title).toBe('Introduction to Islam');
    });

    it('should validate Arabic content inclusion', async () => {
      const req = new Request('http://localhost/education?isPublished=true');
      const res = await app.request(req);
      const data = await res.json();

      const islamContent = data.data.find((item: any) => item.title === 'Introduction to Islam');
      expect(islamContent).toBeDefined();
      expect(islamContent._count).toBeDefined();
      expect(islamContent._count.userProgress).toBe(0);
      expect(islamContent._count.quizAttempts).toBe(0);
    });
  });

  describe('GET /education/:id', () => {
    let testContentId: string;

    beforeEach(async () => {
      const content = await prisma.educationContent.create({
        data: {
          title: 'Seerah Study',
          description: 'Life of Prophet Muhammad (ﷺ)',
          content: 'Detailed seerah content with Islamic values',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.SEERAH,
          ageTier: AgeTier.ALL_AGES,
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 45,
          tags: ['seerah', 'prophet', 'muhammad'],
          arabicContent: 'السيرة النبوية',
          transliteration: 'As-Seerah An-Nabawiyyah',
          translation: 'The Prophetic Biography',
          isPublished: true,
          authorId: testAdmin.id
        }
      });
      testContentId = content.id;

      // Create lesson chapters
      await prisma.lessonChapter.createMany({
        data: [
          {
            lessonId: testContentId,
            title: 'Early Life',
            content: 'The Prophet\'s early life in Makkah',
            order: 1,
            estimatedDuration: 15
          },
          {
            lessonId: testContentId,
            title: 'The Call to Prophethood',
            content: 'Receiving the first revelation',
            order: 2,
            estimatedDuration: 20
          }
        ]
      });
    });

    it('should fetch single content with chapters and Islamic context', async () => {
      const req = new Request(`http://localhost/education/${testContentId}`);
      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.content.title).toBe('Seerah Study');
      expect(data.content.subject).toBe(IslamicSubject.SEERAH);
      expect(data.content.arabicContent).toBe('السيرة النبوية');
      expect(data.content.transliteration).toBe('As-Seerah An-Nabawiyyah');
      expect(data.content.lessonChapters).toHaveLength(2);
      expect(data.content.lessonChapters[0].order).toBeLessThan(data.content.lessonChapters[1].order);
    });

    it('should return 404 for non-existent content', async () => {
      const req = new Request('http://localhost/education/non-existent-id');
      const res = await app.request(req);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /education', () => {
    it('should create new education content with Islamic fields', async () => {
      const contentData = {
        title: 'Quranic Arabic',
        description: 'Learning Arabic for Quran understanding',
        content: 'Comprehensive Arabic language course for Quranic studies',
        contentType: EducationContentType.LESSON,
        subject: IslamicSubject.ARABIC_LANGUAGE,
        ageTier: AgeTier.ADULTS,
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        estimatedDuration: 90,
        tags: ['arabic', 'quran', 'language'],
        arabicContent: 'اللغة العربية القرآنية',
        transliteration: 'Al-Lughah Al-Arabiyyah Al-Quraniyyah',
        translation: 'Quranic Arabic Language'
      };

      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(contentData)
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.content.title).toBe('Quranic Arabic');
      expect(data.content.subject).toBe(IslamicSubject.ARABIC_LANGUAGE);
      expect(data.content.arabicContent).toBe('اللغة العربية القرآنية');
      expect(data.content.authorId).toBe(testAdmin.id);
      expect(data.content.author.name).toBe('Test Admin');
    });

    it('should require authentication for content creation', async () => {
      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' })
      });

      const res = await app.request(req);
      expect(res.status).toBe(401);
    });
  });

  describe('Quiz Functionality', () => {
    let quizId: string;
    let questionIds: string[];

    beforeEach(async () => {
      // Create quiz content
      const quiz = await prisma.educationContent.create({
        data: {
          title: 'Islamic History Quiz',
          description: 'Test your knowledge of Islamic history',
          content: 'Quiz covering major Islamic historical events',
          contentType: EducationContentType.QUIZ,
          subject: IslamicSubject.ISLAMIC_HISTORY,
          ageTier: AgeTier.YOUTH,
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 20,
          timeLimit: 1200, // 20 minutes
          passingScore: 70,
          maxAttempts: 3,
          showCorrectAnswers: true,
          isPublished: true,
          authorId: testAdmin.id
        }
      });
      quizId = quiz.id;

      // Create quiz questions with Islamic content
      const questions = await prisma.quizQuestion.createMany({
        data: [
          {
            quizId: quizId,
            question: 'In which year did the Prophet Muhammad (ﷺ) migrate to Madinah?',
            questionType: QuestionType.MULTIPLE_CHOICE,
            options: ['620 CE', '622 CE', '624 CE', '630 CE'],
            correctAnswer: '622 CE',
            explanation: 'The Hijra (migration) occurred in 622 CE, marking the beginning of the Islamic calendar',
            points: 5,
            order: 1,
            arabicText: 'الهجرة النبوية',
            reference: 'Seerah - Historical Records'
          },
          {
            quizId: quizId,
            question: 'The first mosque built by Muslims was in Madinah.',
            questionType: QuestionType.TRUE_FALSE,
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'Masjid an-Nabawi was the first mosque built by the Muslim community',
            points: 3,
            order: 2
          }
        ]
      });

      // Get question IDs for testing
      const createdQuestions = await prisma.quizQuestion.findMany({
        where: { quizId },
        orderBy: { order: 'asc' }
      });
      questionIds = createdQuestions.map(q => q.id);
    });

    it('should submit quiz answers and calculate scores correctly', async () => {
      const submitData = {
        answers: [
          {
            questionId: questionIds[0],
            answer: '622 CE',
            timeSpent: 45
          },
          {
            questionId: questionIds[1],
            answer: 'True',
            timeSpent: 30
          }
        ],
        timeSpent: 15 // minutes
      };

      const req = new Request(`http://localhost/education/${quizId}/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify(submitData)
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.attempt.score).toBe(100); // Both answers correct
      expect(data.attempt.correctAnswers).toBe(2);
      expect(data.attempt.isPassed).toBe(true);
      expect(data.showCorrectAnswers).toBe(true);
      expect(data.correctAnswers).toBeDefined();

      // Verify database state
      const progress = await prisma.educationUserProgress.findFirst({
        where: {
          userId: testUser.id,
          contentId: quizId
        }
      });

      expect(progress?.status).toBe(ProgressStatus.COMPLETED);
      expect(progress?.progress).toBe(100);
      expect(progress?.score).toBe(100);
    });

    it('should handle partial correct answers', async () => {
      const submitData = {
        answers: [
          {
            questionId: questionIds[0],
            answer: '620 CE', // Wrong answer
            timeSpent: 60
          },
          {
            questionId: questionIds[1],
            answer: 'True', // Correct answer
            timeSpent: 30
          }
        ],
        timeSpent: 18
      };

      const req = new Request(`http://localhost/education/${quizId}/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify(submitData)
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.attempt.score).toBe(38); // 3 out of 8 points (rounded)
      expect(data.attempt.correctAnswers).toBe(1);
      expect(data.attempt.isPassed).toBe(false); // Below 70%
    });

    it('should enforce maximum attempts', async () => {
      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        const submitData = {
          answers: [
            { questionId: questionIds[0], answer: '620 CE', timeSpent: 30 },
            { questionId: questionIds[1], answer: 'False', timeSpent: 20 }
          ],
          timeSpent: 10
        };

        const req = new Request(`http://localhost/education/${quizId}/submit-quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer user-token'
          },
          body: JSON.stringify(submitData)
        });

        await app.request(req);
      }

      // Fourth attempt should fail
      const submitData = {
        answers: [
          { questionId: questionIds[0], answer: '622 CE', timeSpent: 30 },
          { questionId: questionIds[1], answer: 'True', timeSpent: 20 }
        ],
        timeSpent: 10
      };

      const req = new Request(`http://localhost/education/${quizId}/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify(submitData)
      });

      const res = await app.request(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('Maximum attempts exceeded');
    });
  });

  describe('Progress Tracking', () => {
    let lessonId: string;

    beforeEach(async () => {
      const lesson = await prisma.educationContent.create({
        data: {
          title: 'Du\'a and Dhikr',
          description: 'Essential Islamic supplications',
          content: 'Collection of important du\'as and dhikr',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.DUA_DHIKR,
          ageTier: AgeTier.ALL_AGES,
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          arabicContent: 'الدعاء والذكر',
          transliteration: 'Ad-Du\'a wa adh-Dhikr',
          isPublished: true,
          authorId: testAdmin.id
        }
      });
      lessonId = lesson.id;
    });

    it('should update user progress correctly', async () => {
      const progressData = {
        progress: 75,
        currentChapter: 3,
        timeSpent: 25,
        notes: 'Memorized 5 new du\'as'
      };

      const req = new Request(`http://localhost/education/${lessonId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify(progressData)
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.progress.progress).toBe(75);
      expect(data.progress.status).toBe(ProgressStatus.IN_PROGRESS);
      expect(data.progress.currentChapter).toBe(3);
      expect(data.progress.notes).toBe('Memorized 5 new du\'as');
    });

    it('should mark as completed when progress reaches 100%', async () => {
      const progressData = {
        progress: 100,
        timeSpent: 30,
        notes: 'Completed all du\'as and practice sessions'
      };

      const req = new Request(`http://localhost/education/${lessonId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify(progressData)
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.progress.progress).toBe(100);
      expect(data.progress.status).toBe(ProgressStatus.COMPLETED);
      expect(data.progress.completedAt).toBeDefined();
    });
  });

  describe('Analytics and Statistics', () => {
    beforeEach(async () => {
      // Create diverse content for analytics
      await prisma.educationContent.createMany({
        data: [
          {
            title: 'Quran Basics',
            description: 'Introduction to Quran',
            content: 'Basic Quran content',
            contentType: EducationContentType.LESSON,
            subject: IslamicSubject.QURAN,
            ageTier: AgeTier.CHILDREN,
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 20,
            isPublished: true,
            authorId: testAdmin.id
          },
          {
            title: 'Hadith Studies',
            description: 'Understanding Hadith',
            content: 'Hadith study content',
            contentType: EducationContentType.LESSON,
            subject: IslamicSubject.HADITH,
            ageTier: AgeTier.ADULTS,
            difficultyLevel: DifficultyLevel.INTERMEDIATE,
            estimatedDuration: 45,
            isPublished: true,
            authorId: testAdmin.id
          }
        ]
      });

      // Create some progress data
      const content = await prisma.educationContent.findFirst();
      if (content) {
        await prisma.educationUserProgress.create({
          data: {
            userId: testUser.id,
            contentId: content.id,
            status: ProgressStatus.COMPLETED,
            progress: 100,
            score: 85,
            timeSpent: 20
          }
        });
      }
    });

    it('should provide comprehensive analytics for admins', async () => {
      const req = new Request('http://localhost/education/analytics', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.totalContents).toBeGreaterThan(0);
      expect(data.totalUsers).toBeGreaterThan(0);
      expect(data.popularSubjects).toBeDefined();
      expect(data.ageDistribution).toBeDefined();
      expect(data.difficultyDistribution).toBeDefined();

      // Check Islamic subjects are properly tracked
      const subjects = data.popularSubjects.map((s: any) => s.subject);
      expect(subjects).toContain(IslamicSubject.QURAN);
      expect(subjects).toContain(IslamicSubject.HADITH);
    });

    it('should provide user-specific statistics', async () => {
      const req = new Request('http://localhost/education/stats/me', {
        headers: { 'Authorization': 'Bearer user-token' }
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.totalContentsCompleted).toBeDefined();
      expect(data.totalTimeSpent).toBeDefined();
      expect(data.averageScore).toBeDefined();
      expect(data.progressBySubject).toBeDefined();
      expect(data.favoriteSubject).toBeDefined();

      // Verify Islamic context
      expect(Object.values(IslamicSubject)).toContain(data.favoriteSubject);
    });
  });
});