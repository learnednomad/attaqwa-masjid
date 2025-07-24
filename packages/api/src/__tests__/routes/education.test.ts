import { Hono } from 'hono'
import { PrismaClient } from '@attaqwa/db'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import educationRoutes from '../../routes/education'
import {
  AgeTier,
  IslamicSubject,
  DifficultyLevel,
  EducationContentType,
  ProgressStatus,
} from '@attaqwa/shared'

// Mock Prisma
const mockPrisma = {
  educationContent: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
  userProgress: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  quizAttempt: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  user: {
    count: jest.fn(),
  },
  educationCertificate: {
    count: jest.fn(),
  },
} as unknown as PrismaClient

jest.mock('@attaqwa/db', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}))

// Mock auth middleware
jest.mock('../../middleware/auth', () => ({
  requireAuth: jest.fn((c, next) => {
    c.set('user', { id: 'user-1', email: 'test@example.com', role: 'USER' })
    return next()
  }),
  requireRole: jest.fn(() => (c, next) => next()),
}))

describe('Education API Routes', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.route('/education', educationRoutes)
    jest.clearAllMocks()
  })

  describe('GET /education', () => {
    const mockEducationContent = [
      {
        id: 'content-1',
        title: 'Introduction to Salah',
        description: 'Learn the fundamentals of Islamic prayer',
        subject: IslamicSubject.WORSHIP,
        ageTier: AgeTier.CHILDREN,
        difficultyLevel: DifficultyLevel.BEGINNER,
        contentType: EducationContentType.LESSON,
        estimatedDuration: 30,
        isPublished: true,
        tags: ['prayer', 'salah'],
        createdAt: new Date('2024-01-01'),
        author: { id: 'author-1', name: 'Sheikh Muhammad' },
        _count: { userProgress: 25, quizAttempts: 12 },
      },
      {
        id: 'content-2',
        title: 'Quran Recitation Basics',
        description: 'Learn proper Quran recitation',
        subject: IslamicSubject.QURAN,
        ageTier: AgeTier.YOUTH,
        difficultyLevel: DifficultyLevel.INTERMEDIATE,
        contentType: EducationContentType.LESSON,
        estimatedDuration: 45,
        isPublished: true,
        tags: ['quran', 'recitation'],
        createdAt: new Date('2024-01-02'),
        author: { id: 'author-2', name: 'Qari Ali' },
        _count: { userProgress: 18, quizAttempts: 8 },
      },
    ]

    it('returns education content with pagination', async () => {
      mockPrisma.educationContent.findMany.mockResolvedValue(mockEducationContent)
      mockPrisma.educationContent.count.mockResolvedValue(2)

      const res = await app.request('/education')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data).toEqual({
        data: mockEducationContent,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      })
    })

    it('filters by Islamic subject', async () => {
      mockPrisma.educationContent.findMany.mockResolvedValue([mockEducationContent[0]])
      mockPrisma.educationContent.count.mockResolvedValue(1)

      const res = await app.request('/education?subject=WORSHIP')
      
      expect(res.status).toBe(200)
      expect(mockPrisma.educationContent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subject: IslamicSubject.WORSHIP,
          }),
        })
      )
    })

    it('filters by age tier', async () => {
      mockPrisma.educationContent.findMany.mockResolvedValue([mockEducationContent[0]])
      mockPrisma.educationContent.count.mockResolvedValue(1)

      const res = await app.request('/education?ageTier=CHILDREN')
      
      expect(res.status).toBe(200)
      expect(mockPrisma.educationContent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ageTier: AgeTier.CHILDREN,
          }),
        })
      )
    })

    it('filters by difficulty level', async () => {
      mockPrisma.educationContent.findMany.mockResolvedValue([mockEducationContent[0]])
      mockPrisma.educationContent.count.mockResolvedValue(1)

      const res = await app.request('/education?difficultyLevel=BEGINNER')
      
      expect(res.status).toBe(200)
      expect(mockPrisma.educationContent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            difficultyLevel: DifficultyLevel.BEGINNER,
          }),
        })
      )
    })

    it('supports search functionality', async () => {
      mockPrisma.educationContent.findMany.mockResolvedValue([mockEducationContent[0]])
      mockPrisma.educationContent.count.mockResolvedValue(1)

      const res = await app.request('/education?search=salah')
      
      expect(res.status).toBe(200)
      expect(mockPrisma.educationContent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'salah', mode: 'insensitive' } },
              { description: { contains: 'salah', mode: 'insensitive' } },
              { tags: { hasSome: ['salah'] } },
            ],
          }),
        })
      )
    })

    it('filters by tags', async () => {
      mockPrisma.educationContent.findMany.mockResolvedValue([mockEducationContent[0]])
      mockPrisma.educationContent.count.mockResolvedValue(1)

      const res = await app.request('/education?tags=prayer,salah')
      
      expect(res.status).toBe(200)
      expect(mockPrisma.educationContent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { hasSome: ['prayer', 'salah'] },
          }),
        })
      )
    })

    it('handles pagination correctly', async () => {
      mockPrisma.educationContent.findMany.mockResolvedValue([])
      mockPrisma.educationContent.count.mockResolvedValue(25)

      const res = await app.request('/education?page=3&limit=5')
      
      expect(res.status).toBe(200)
      expect(mockPrisma.educationContent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 3 - 1) * limit 5
          take: 5,
        })
      )

      const data = await res.json()
      expect(data.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 25,
        totalPages: 5,
      })
    })
  })

  describe('GET /education/:id', () => {
    const mockContentWithDetails = {
      id: 'content-1',
      title: 'Introduction to Salah',
      description: 'Learn the fundamentals of Islamic prayer',
      content: 'Detailed lesson content about Salah...',
      subject: IslamicSubject.WORSHIP,
      ageTier: AgeTier.CHILDREN,
      difficultyLevel: DifficultyLevel.BEGINNER,
      contentType: EducationContentType.LESSON,
      estimatedDuration: 30,
      isPublished: true,
      author: { id: 'author-1', name: 'Sheikh Muhammad' },
      quizQuestions: [],
      lessonChapters: [
        { id: 'chapter-1', title: 'What is Salah?', order: 1 },
        { id: 'chapter-2', title: 'Times of Prayer', order: 2 },
      ],
      lessonResources: [],
      _count: { userProgress: 25, quizAttempts: 12 },
    }

    it('returns detailed content by ID', async () => {
      mockPrisma.educationContent.findUnique.mockResolvedValue(mockContentWithDetails)

      const res = await app.request('/education/content-1')
      
      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.content).toEqual(mockContentWithDetails)
      expect(mockPrisma.educationContent.findUnique).toHaveBeenCalledWith({
        where: { id: 'content-1' },
        include: expect.objectContaining({
          author: { select: { id: true, name: true } },
          quizQuestions: { orderBy: { order: 'asc' } },
          lessonChapters: { orderBy: { order: 'asc' } },
        }),
      })
    })

    it('returns 404 for non-existent content', async () => {
      mockPrisma.educationContent.findUnique.mockResolvedValue(null)

      const res = await app.request('/education/non-existent')
      
      expect(res.status).toBe(404)
      
      const data = await res.json()
      expect(data.error).toBe('Content not found')
    })
  })

  describe('POST /education/:id/submit-quiz', () => {
    const mockQuiz = {
      id: 'quiz-1',
      title: 'Salah Knowledge Quiz',
      contentType: EducationContentType.QUIZ,
      maxAttempts: 3,
      passingScore: 70,
      showCorrectAnswers: true,
      quizQuestions: [
        {
          id: 'q1',
          question: 'How many times do Muslims pray daily?',
          correctAnswer: '5',
          options: ['3', '4', '5', '6'],
        },
        {
          id: 'q2',
          question: 'What is the first prayer of the day?',
          correctAnswer: 'Fajr',
          options: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib'],
        },
      ],
    }

    const mockAnswers = [
      { questionId: 'q1', answer: '5', timeSpent: 30 },
      { questionId: 'q2', answer: 'Fajr', timeSpent: 25 },
    ]

    it('successfully submits quiz with correct answers', async () => {
      mockPrisma.educationContent.findUnique.mockResolvedValue(mockQuiz)
      mockPrisma.quizAttempt.count.mockResolvedValue(0)
      mockPrisma.quizAttempt.create.mockResolvedValue({
        id: 'attempt-1',
        score: 100,
        isPassed: true,
      })
      mockPrisma.userProgress.upsert.mockResolvedValue({})

      const res = await app.request('/education/quiz-1/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: mockAnswers,
          timeSpent: 55,
        }),
      })

      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.attempt.score).toBe(100)
      expect(data.attempt.isPassed).toBe(true)
      expect(data.attempt.correctAnswers).toBe(2)
      expect(data.attempt.totalQuestions).toBe(2)
    })

    it('calculates partial score for mixed answers', async () => {
      const mixedAnswers = [
        { questionId: 'q1', answer: '4', timeSpent: 30 }, // Wrong
        { questionId: 'q2', answer: 'Fajr', timeSpent: 25 }, // Correct
      ]

      mockPrisma.educationContent.findUnique.mockResolvedValue(mockQuiz)
      mockPrisma.quizAttempt.count.mockResolvedValue(0)
      mockPrisma.quizAttempt.create.mockResolvedValue({
        id: 'attempt-1',
        score: 50,
        isPassed: false,
      })
      mockPrisma.userProgress.upsert.mockResolvedValue({})

      const res = await app.request('/education/quiz-1/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: mixedAnswers,
          timeSpent: 55,
        }),
      })

      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.attempt.score).toBe(50)
      expect(data.attempt.isPassed).toBe(false) // Below 70% passing score
      expect(data.attempt.correctAnswers).toBe(1)
    })

    it('prevents submission when max attempts exceeded', async () => {
      mockPrisma.educationContent.findUnique.mockResolvedValue(mockQuiz)
      mockPrisma.quizAttempt.count.mockResolvedValue(3) // Max attempts reached

      const res = await app.request('/education/quiz-1/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: mockAnswers,
          timeSpent: 55,
        }),
      })

      expect(res.status).toBe(400)
      
      const data = await res.json()
      expect(data.error).toBe('Maximum attempts exceeded')
    })

    it('returns 404 for non-existent quiz', async () => {
      mockPrisma.educationContent.findUnique.mockResolvedValue(null)

      const res = await app.request('/education/non-existent/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: mockAnswers,
          timeSpent: 55,
        }),
      })

      expect(res.status).toBe(404)
      
      const data = await res.json()
      expect(data.error).toBe('Quiz not found')
    })
  })

  describe('PUT /education/:id/progress', () => {
    it('updates user progress successfully', async () => {
      const mockProgress = {
        id: 'progress-1',
        userId: 'user-1',
        contentId: 'content-1',
        status: ProgressStatus.IN_PROGRESS,
        progress: 75,
        currentChapter: 3,
        timeSpent: 120,
        lastAccessed: new Date(),
      }

      mockPrisma.userProgress.upsert.mockResolvedValue(mockProgress)

      const res = await app.request('/education/content-1/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: 75,
          currentChapter: 3,
          timeSpent: 60,
          notes: 'Making good progress on this lesson',
        }),
      })

      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.progress).toEqual(mockProgress)
      expect(mockPrisma.userProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_contentId: {
              userId: 'user-1',
              contentId: 'content-1',
            },
          },
        })
      )
    })

    it('marks content as completed when progress reaches 100%', async () => {
      const mockCompletedProgress = {
        id: 'progress-1',
        userId: 'user-1',
        contentId: 'content-1',
        status: ProgressStatus.COMPLETED,
        progress: 100,
        completedAt: new Date(),
      }

      mockPrisma.userProgress.upsert.mockResolvedValue(mockCompletedProgress)

      const res = await app.request('/education/content-1/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: 100,
          timeSpent: 30,
        }),
      })

      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data.progress.status).toBe(ProgressStatus.COMPLETED)
      expect(data.progress.progress).toBe(100)
    })
  })

  describe('GET /education/analytics', () => {
    it('returns comprehensive analytics for admins', async () => {
      mockPrisma.educationContent.count.mockResolvedValue(50)
      mockPrisma.user.count.mockResolvedValue(200)
      mockPrisma.userProgress.count.mockResolvedValue(150)
      mockPrisma.userProgress.aggregate.mockResolvedValue({
        _avg: { progress: 65, score: 78 },
      })
      mockPrisma.educationContent.groupBy
        .mockResolvedValueOnce([
          { subject: IslamicSubject.QURAN, _count: { id: 15 } },
          { subject: IslamicSubject.WORSHIP, _count: { id: 20 } },
        ])
        .mockResolvedValueOnce([
          { ageTier: AgeTier.CHILDREN, _count: { id: 12 } },
          { ageTier: AgeTier.ADULTS, _count: { id: 25 } },
        ])
        .mockResolvedValueOnce([
          { difficultyLevel: DifficultyLevel.BEGINNER, _count: { id: 30 } },
          { difficultyLevel: DifficultyLevel.INTERMEDIATE, _count: { id: 15 } },
        ])

      const res = await app.request('/education/analytics')

      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data).toEqual({
        totalContents: 50,
        totalUsers: 200,
        totalProgress: 150,
        completionRate: 65,
        averageScore: 78,
        popularSubjects: [
          { subject: IslamicSubject.QURAN, count: 15 },
          { subject: IslamicSubject.WORSHIP, count: 20 },
        ],
        ageDistribution: [
          { ageTier: AgeTier.CHILDREN, count: 12 },
          { ageTier: AgeTier.ADULTS, count: 25 },
        ],
        difficultyDistribution: [
          { level: DifficultyLevel.BEGINNER, count: 30 },
          { level: DifficultyLevel.INTERMEDIATE, count: 15 },
        ],
      })
    })
  })

  describe('GET /education/stats/me', () => {
    it('returns user-specific education statistics', async () => {
      mockPrisma.userProgress.count.mockResolvedValue(8)
      mockPrisma.userProgress.aggregate.mockResolvedValue({
        _sum: { timeSpent: 450 },
        _avg: { score: 85 },
      })
      mockPrisma.educationCertificate.count.mockResolvedValue(3)
      mockPrisma.userProgress.findMany.mockResolvedValue([
        {
          status: ProgressStatus.COMPLETED,
          content: { subject: IslamicSubject.QURAN },
        },
        {
          status: ProgressStatus.COMPLETED,
          content: { subject: IslamicSubject.QURAN },
        },
        {
          status: ProgressStatus.IN_PROGRESS,
          content: { subject: IslamicSubject.WORSHIP },
        },
      ])

      const res = await app.request('/education/stats/me')

      expect(res.status).toBe(200)
      
      const data = await res.json()
      expect(data).toEqual({
        totalContentsCompleted: 8,
        totalTimeSpent: 450,
        averageScore: 85,
        certificates: 3,
        currentStreak: 0,
        longestStreak: 0,
        favoriteSubject: IslamicSubject.QURAN,
        progressBySubject: [
          { subject: IslamicSubject.QURAN, completed: 2, total: 2 },
          { subject: IslamicSubject.WORSHIP, completed: 0, total: 1 },
        ],
      })
    })
  })
})