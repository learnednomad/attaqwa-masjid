import { PrismaClient } from '../src/generated';
import { 
  AgeTier, 
  EducationContentType, 
  IslamicSubject, 
  DifficultyLevel,
  ProgressStatus,
  QuestionType,
  Role 
} from '../src/generated';

describe('Database Schema Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Schema Validation', () => {
    it('should validate AgeTier enum values match shared types', () => {
      const dbAgeTiers = Object.values(AgeTier);
      const expectedTiers = ['CHILDREN', 'YOUTH', 'ADULTS', 'SENIORS', 'ALL_AGES'];
      
      expect(dbAgeTiers.sort()).toEqual(expectedTiers.sort());
    });

    it('should validate EducationContentType enum values', () => {
      const dbContentTypes = Object.values(EducationContentType);
      const expectedTypes = ['LESSON', 'QUIZ', 'VIDEO', 'AUDIO', 'READING', 'INTERACTIVE'];
      
      expect(dbContentTypes.sort()).toEqual(expectedTypes.sort());
    });

    it('should validate IslamicSubject enum values', () => {
      const dbSubjects = Object.values(IslamicSubject);
      const expectedSubjects = [
        'QURAN', 'HADITH', 'FIQH', 'AQIDAH', 'SEERAH', 
        'ISLAMIC_HISTORY', 'ARABIC_LANGUAGE', 'DUA_DHIKR', 
        'ISLAMIC_ETIQUETTE', 'COMPARATIVE_RELIGION'
      ];
      
      expect(dbSubjects.sort()).toEqual(expectedSubjects.sort());
    });

    it('should validate DifficultyLevel enum values', () => {
      const dbLevels = Object.values(DifficultyLevel);
      const expectedLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'SCHOLAR'];
      
      expect(dbLevels.sort()).toEqual(expectedLevels.sort());
    });

    it('should validate QuestionType enum values', () => {
      const dbQuestionTypes = Object.values(QuestionType);
      const expectedTypes = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'MATCHING', 'FILL_BLANK'];
      
      expect(dbQuestionTypes.sort()).toEqual(expectedTypes.sort());
    });
  });

  describe('Education Content Model Tests', () => {
    let testUser: any;
    let testContent: any;

    beforeEach(async () => {
      // Create test user
      testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          password: 'hashedpassword',
          name: 'Test User',
          role: Role.ADMIN,
          ageTier: AgeTier.ADULTS
        }
      });
    });

    afterEach(async () => {
      // Clean up test data
      await prisma.educationUserProgress.deleteMany();
      await prisma.quizAttempt.deleteMany();
      await prisma.quizQuestion.deleteMany();
      await prisma.lessonChapter.deleteMany();
      await prisma.lessonResource.deleteMany();
      await prisma.educationContent.deleteMany();
      await prisma.user.deleteMany();
    });

    it('should create education content with all required fields', async () => {
      const content = await prisma.educationContent.create({
        data: {
          title: 'Introduction to Quran',
          description: 'Basic understanding of the Quran',
          content: 'Detailed lesson content here...',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.QURAN,
          ageTier: AgeTier.ADULTS,
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          tags: ['quran', 'basics'],
          arabicContent: 'القرآن الكريم',
          transliteration: 'Al-Quran Al-Kareem',
          translation: 'The Noble Quran',
          isPublished: true,
          authorId: testUser.id
        }
      });

      expect(content).toBeDefined();
      expect(content.title).toBe('Introduction to Quran');
      expect(content.contentType).toBe(EducationContentType.LESSON);
      expect(content.subject).toBe(IslamicSubject.QURAN);
      expect(content.ageTier).toBe(AgeTier.ADULTS);
      expect(content.arabicContent).toBe('القرآن الكريم');
    });

    it('should create quiz with questions and validate relationships', async () => {
      // Create quiz content
      const quiz = await prisma.educationContent.create({
        data: {
          title: 'Quran Quiz',
          description: 'Test your knowledge of the Quran',
          content: 'Quiz content',
          contentType: EducationContentType.QUIZ,
          subject: IslamicSubject.QURAN,
          ageTier: AgeTier.ADULTS,
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 15,
          timeLimit: 900, // 15 minutes
          passingScore: 70,
          maxAttempts: 3,
          showCorrectAnswers: true,
          authorId: testUser.id
        }
      });

      // Create quiz questions
      await prisma.quizQuestion.createMany({
        data: [
          {
            quizId: quiz.id,
            question: 'How many chapters are in the Quran?',
            questionType: QuestionType.MULTIPLE_CHOICE,
            options: ['110', '112', '114', '116'],
            correctAnswer: '114',
            explanation: 'The Quran has 114 chapters called Surahs',
            points: 5,
            order: 1,
            reference: 'General Knowledge'
          },
          {
            quizId: quiz.id,
            question: 'The Quran was revealed over a period of 23 years.',
            questionType: QuestionType.TRUE_FALSE,
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'The Quran was revealed over approximately 23 years',
            points: 3,
            order: 2
          }
        ]
      });

      const quizWithQuestions = await prisma.educationContent.findUnique({
        where: { id: quiz.id },
        include: { quizQuestions: { orderBy: { order: 'asc' } } }
      });

      expect(quizWithQuestions?.quizQuestions).toHaveLength(2);
      expect(quizWithQuestions?.quizQuestions[0].question).toContain('chapters');
      expect(quizWithQuestions?.timeLimit).toBe(900);
      expect(quizWithQuestions?.passingScore).toBe(70);
    });

    it('should track user progress correctly', async () => {
      // Create lesson content
      const lesson = await prisma.educationContent.create({
        data: {
          title: 'Basic Fiqh',
          description: 'Introduction to Islamic Jurisprudence',
          content: 'Fiqh lesson content',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.FIQH,
          ageTier: AgeTier.ADULTS,
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 45,
          authorId: testUser.id
        }
      });

      // Track user progress
      const progress = await prisma.educationUserProgress.create({
        data: {
          userId: testUser.id,
          contentId: lesson.id,
          status: ProgressStatus.IN_PROGRESS,
          progress: 50,
          currentChapter: 2,
          timeSpent: 20,
          notes: 'Good progress so far'
        }
      });

      expect(progress.progress).toBe(50);
      expect(progress.status).toBe(ProgressStatus.IN_PROGRESS);
      expect(progress.timeSpent).toBe(20);

      // Update progress to completed
      const updatedProgress = await prisma.educationUserProgress.update({
        where: { id: progress.id },
        data: {
          status: ProgressStatus.COMPLETED,
          progress: 100,
          completedAt: new Date(),
          timeSpent: 45
        }
      });

      expect(updatedProgress.status).toBe(ProgressStatus.COMPLETED);
      expect(updatedProgress.progress).toBe(100);
      expect(updatedProgress.completedAt).toBeDefined();
    });

    it('should handle Arabic content validation', async () => {
      const arabicContent = await prisma.educationContent.create({
        data: {
          title: 'Surah Al-Fatiha',
          description: 'The Opening Chapter',
          content: 'Explanation of Surah Al-Fatiha',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.QURAN,
          ageTier: AgeTier.ALL_AGES,
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 25,
          arabicContent: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
          transliteration: 'Bismillahi Ar-Rahmani Ar-Raheem',
          translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
          authorId: testUser.id
        }
      });

      expect(arabicContent.arabicContent).toBe('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ');
      expect(arabicContent.transliteration).toContain('Bismillahi');
      expect(arabicContent.translation).toContain('Allah');
    });

    it('should validate quiz attempt workflow', async () => {
      // Create quiz
      const quiz = await prisma.educationContent.create({
        data: {
          title: 'Hadith Quiz',
          description: 'Test knowledge of Hadith',
          content: 'Quiz about Hadith',
          contentType: EducationContentType.QUIZ,
          subject: IslamicSubject.HADITH,
          ageTier: AgeTier.YOUTH,
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 10,
          passingScore: 75,
          maxAttempts: 2,
          authorId: testUser.id
        }
      });

      // Create quiz attempt
      const attempt = await prisma.quizAttempt.create({
        data: {
          userId: testUser.id,
          quizId: quiz.id,
          answers: [
            {
              questionId: 'q1',
              answer: 'option2',
              isCorrect: true,
              timeSpent: 30
            },
            {
              questionId: 'q2',
              answer: 'option1',
              isCorrect: false,
              timeSpent: 25
            }
          ],
          score: 50,
          totalQuestions: 2,
          correctAnswers: 1,
          timeSpent: 8,
          startedAt: new Date(Date.now() - 8 * 60 * 1000),
          completedAt: new Date(),
          isPassed: false
        }
      });

      expect(attempt.score).toBe(50);
      expect(attempt.isPassed).toBe(false);
      expect(attempt.correctAnswers).toBe(1);

      // Verify relationship
      const attemptWithQuiz = await prisma.quizAttempt.findUnique({
        where: { id: attempt.id },
        include: { quiz: true, user: true }
      });

      expect(attemptWithQuiz?.quiz.title).toBe('Hadith Quiz');
      expect(attemptWithQuiz?.user.name).toBe('Test User');
    });
  });

  describe('Learning Path Tests', () => {
    let testUser: any;
    let testContents: any[];

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `pathtest-${Date.now()}@example.com`,
          password: 'hashedpassword',
          name: 'Path Test User',
          role: Role.ADMIN
        }
      });

      // Create test contents
      testContents = await Promise.all([
        prisma.educationContent.create({
          data: {
            title: 'Islamic Ethics 1',
            description: 'Introduction to Islamic Ethics',
            content: 'Ethics content 1',
            contentType: EducationContentType.LESSON,
            subject: IslamicSubject.ISLAMIC_ETIQUETTE,
            ageTier: AgeTier.ADULTS,
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 30,
            authorId: testUser.id
          }
        }),
        prisma.educationContent.create({
          data: {
            title: 'Islamic Ethics Quiz',
            description: 'Test your ethics knowledge',
            content: 'Ethics quiz',
            contentType: EducationContentType.QUIZ,
            subject: IslamicSubject.ISLAMIC_ETIQUETTE,
            ageTier: AgeTier.ADULTS,
            difficultyLevel: DifficultyLevel.INTERMEDIATE,
            estimatedDuration: 15,
            authorId: testUser.id
          }
        })
      ]);
    });

    afterEach(async () => {
      await prisma.learningPathContent.deleteMany();
      await prisma.learningPath.deleteMany();
      await prisma.educationContent.deleteMany();
      await prisma.user.deleteMany();
    });

    it('should create learning path with ordered content', async () => {
      const learningPath = await prisma.learningPath.create({
        data: {
          title: 'Islamic Ethics Pathway',
          description: 'Complete course on Islamic Ethics',
          subject: IslamicSubject.ISLAMIC_ETIQUETTE,
          ageTier: AgeTier.ADULTS,
          difficultyLevel: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 3, // hours
          prerequisites: ['Basic Islamic Knowledge'],
          isPublished: true,
          authorId: testUser.id,
          contents: {
            create: [
              {
                contentId: testContents[0].id,
                order: 1,
                isRequired: true
              },
              {
                contentId: testContents[1].id,
                order: 2,
                isRequired: true
              }
            ]
          }
        },
        include: {
          contents: {
            include: { content: true },
            orderBy: { order: 'asc' }
          }
        }
      });

      expect(learningPath.contents).toHaveLength(2);
      expect(learningPath.contents[0].order).toBe(1);
      expect(learningPath.contents[1].order).toBe(2);
      expect(learningPath.contents[0].content.title).toBe('Islamic Ethics 1');
      expect(learningPath.estimatedDuration).toBe(3);
    });
  });

  describe('Achievement System Tests', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `achievement-${Date.now()}@example.com`,
          password: 'hashedpassword',
          name: 'Achievement Test User',
          role: Role.USER
        }
      });
    });

    afterEach(async () => {
      await prisma.userAchievement.deleteMany();
      await prisma.user.deleteMany();
    });

    it('should create user achievements with Islamic context', async () => {
      const achievement = await prisma.userAchievement.create({
        data: {
          userId: testUser.id,
          title: 'Quran Scholar',
          description: 'Completed 10 Quran lessons with excellent scores',
          icon: '📖',
          criteriaType: 'COMPLETION',
          criteriaValue: 10,
          subject: IslamicSubject.QURAN,
          points: 100,
          isRare: true,
          progress: 100
        }
      });

      expect(achievement.title).toBe('Quran Scholar');
      expect(achievement.subject).toBe(IslamicSubject.QURAN);
      expect(achievement.isRare).toBe(true);
      expect(achievement.points).toBe(100);

      // Create another achievement
      await prisma.userAchievement.create({
        data: {
          userId: testUser.id,
          title: 'Consistent Learner',
          description: 'Studied for 7 consecutive days',
          icon: '⭐',
          criteriaType: 'STREAK',
          criteriaValue: 7,
          points: 50,
          isRare: false,
          progress: 100
        }
      });

      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId: testUser.id },
        orderBy: { points: 'desc' }
      });

      expect(userAchievements).toHaveLength(2);
      expect(userAchievements[0].points).toBe(100); // Quran Scholar first
      expect(userAchievements[1].points).toBe(50);
    });
  });
});