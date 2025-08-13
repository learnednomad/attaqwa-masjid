import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { Hono } from 'hono';
import { PrismaClient } from '../../db/src/generated';
import educationRoutes from '../src/routes/education';
import { 
  AgeTier, 
  EducationContentType, 
  IslamicSubject, 
  DifficultyLevel,
  Role 
} from '@attaqwa/shared';

describe('Security and Performance Testing Suite', () => {
  let prisma: PrismaClient;
  let app: Hono;
  let testAdmin: any;
  let testUser: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    app = new Hono();
    
    // Setup test app with mocked middleware
    app.use('*', async (c, next) => {
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
        email: 'security-admin@attaqwa.com',
        password: 'hashedpassword123',
        name: 'Security Test Admin',
        role: Role.ADMIN
      }
    });

    testUser = await prisma.user.create({
      data: {
        email: 'security-user@attaqwa.com',
        password: 'hashedpassword123',
        name: 'Security Test User',
        role: Role.USER
      }
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await prisma.educationUserProgress.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.educationContent.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Authentication Security Tests', () => {
    beforeEach(async () => {
      // Clean up content before each test
      await prisma.educationContent.deleteMany();
    });

    it('should reject requests without authentication token', async () => {
      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized Content',
          description: 'Should not be created',
          content: 'Test content',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.QURAN,
          ageTier: AgeTier.ALL_AGES,
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30
        })
      });

      const res = await app.request(req);
      expect(res.status).toBe(401);
    });

    it('should reject invalid authentication tokens', async () => {
      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        },
        body: JSON.stringify({
          title: 'Unauthorized Content'
        })
      });

      const res = await app.request(req);
      expect(res.status).toBe(401);
    });

    it('should enforce role-based access control for admin endpoints', async () => {
      const req = new Request('http://localhost/education/analytics', {
        headers: { 'Authorization': 'Bearer user-token' } // User token for admin endpoint
      });

      const res = await app.request(req);
      expect(res.status).toBe(403);
    });

    it('should allow appropriate access based on user roles', async () => {
      const req = new Request('http://localhost/education/analytics', {
        headers: { 'Authorization': 'Bearer admin-token' }
      });

      const res = await app.request(req);
      expect(res.status).toBe(200);
    });
  });

  describe('Input Validation Security Tests', () => {
    it('should validate and sanitize content creation inputs', async () => {
      const maliciousInputs = [
        {
          title: '<script>alert("XSS")</script>',
          description: 'Normal description',
          expectedStatus: 400 // Should be rejected
        },
        {
          title: 'Normal Title',
          description: 'javascript:alert("XSS")',
          expectedStatus: 400 // Should be rejected
        },
        {
          title: 'Valid Title',
          description: 'Valid description',
          content: '<img src=x onerror=alert("XSS")>',
          expectedStatus: 400 // Should be rejected
        },
        {
          title: 'A'.repeat(201), // Exceeds max length
          description: 'Valid description',
          expectedStatus: 400 // Should be rejected
        }
      ];

      for (const input of maliciousInputs) {
        const req = new Request('http://localhost/education', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin-token'
          },
          body: JSON.stringify({
            ...input,
            content: input.content || 'Valid content',
            contentType: EducationContentType.LESSON,
            subject: IslamicSubject.QURAN,
            ageTier: AgeTier.ALL_AGES,
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 30
          })
        });

        const res = await app.request(req);
        expect(res.status).toBe(input.expectedStatus);
      }
    });

    it('should validate enum values strictly', async () => {
      const invalidEnumData = {
        title: 'Test Content',
        description: 'Test description',
        content: 'Test content',
        contentType: 'INVALID_TYPE', // Invalid enum value
        subject: IslamicSubject.QURAN,
        ageTier: AgeTier.ALL_AGES,
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30
      };

      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(invalidEnumData)
      });

      const res = await app.request(req);
      expect(res.status).toBe(400);
    });

    it('should validate Arabic text encoding security', async () => {
      const arabicTestCases = [
        {
          arabicContent: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', // Valid Arabic
          expectedStatus: 201
        },
        {
          arabicContent: '\u202E\u202D', // Unicode direction override attack
          expectedStatus: 400
        },
        {
          arabicContent: '<script>العربية</script>', // XSS in Arabic context
          expectedStatus: 400
        }
      ];

      for (const testCase of arabicTestCases) {
        const req = new Request('http://localhost/education', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin-token'
          },
          body: JSON.stringify({
            title: 'Arabic Test Content',
            description: 'Testing Arabic content security',
            content: 'Test content',
            contentType: EducationContentType.LESSON,
            subject: IslamicSubject.QURAN,
            ageTier: AgeTier.ALL_AGES,
            difficultyLevel: DifficultyLevel.BEGINNER,
            estimatedDuration: 30,
            arabicContent: testCase.arabicContent
          })
        });

        const res = await app.request(req);
        expect(res.status).toBe(testCase.expectedStatus);
      }
    });

    it('should prevent SQL injection in query parameters', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE education_content; --",
        "1' OR '1'='1",
        "1' UNION SELECT * FROM users --",
        "'; UPDATE users SET role='ADMIN' WHERE id=1; --"
      ];

      for (const injection of sqlInjectionAttempts) {
        const req = new Request(`http://localhost/education?search=${encodeURIComponent(injection)}`);
        const res = await app.request(req);
        
        // Should not return 500 (SQL error) but handle gracefully
        expect(res.status).not.toBe(500);
        expect(res.status).toBeLessThan(500);
      }
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    it('should handle large numbers of concurrent requests', async () => {
      const concurrentRequests = 50;
      const requests = [];

      // Create test content first
      await prisma.educationContent.create({
        data: {
          title: 'Performance Test Content',
          description: 'Testing concurrent access',
          content: 'Test content for performance',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.QURAN,
          ageTier: AgeTier.ALL_AGES,
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          isPublished: true,
          authorId: testAdmin.id
        }
      });

      // Create concurrent requests
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          app.request(new Request('http://localhost/education?limit=10'))
        );
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();

      const responseTime = endTime - startTime;

      // All requests should succeed
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });

      // Should handle requests within reasonable time (less than 10 seconds)
      expect(responseTime).toBeLessThan(10000);
    });

    it('should handle large payload sizes gracefully', async () => {
      const largePayloa = {
        title: 'Large Content Test',
        description: 'A'.repeat(1000), // 1KB description
        content: 'B'.repeat(50000), // 50KB content
        contentType: EducationContentType.LESSON,
        subject: IslamicSubject.QURAN,
        ageTier: AgeTier.ALL_AGES,
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 120,
        tags: Array(100).fill('tag'), // Many tags
        arabicContent: 'ج'.repeat(5000) // Large Arabic content
      };

      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(largePayloa)
      });

      const startTime = Date.now();
      const res = await app.request(req);
      const endTime = Date.now();

      // Should either accept or reject gracefully, but not timeout
      expect([200, 201, 400, 413]).toContain(res.status);
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });
  });

  describe('Performance Benchmarks', () => {
    beforeEach(async () => {
      // Create test data for performance testing
      const contentData = [];
      for (let i = 0; i < 100; i++) {
        contentData.push({
          title: `Performance Test Content ${i}`,
          description: `Description for content ${i}`,
          content: `Content body for testing performance ${i}`,
          contentType: i % 2 === 0 ? EducationContentType.LESSON : EducationContentType.QUIZ,
          subject: Object.values(IslamicSubject)[i % Object.values(IslamicSubject).length],
          ageTier: Object.values(AgeTier)[i % Object.values(AgeTier).length],
          difficultyLevel: Object.values(DifficultyLevel)[i % Object.values(DifficultyLevel).length],
          estimatedDuration: 30 + (i % 60),
          tags: [`tag${i}`, `category${i % 5}`],
          isPublished: i % 3 === 0, // Mix of published and unpublished
          authorId: testAdmin.id
        });
      }

      await prisma.educationContent.createMany({ data: contentData });
    });

    afterEach(async () => {
      await prisma.educationContent.deleteMany();
    });

    it('should perform list queries within acceptable time limits', async () => {
      const testCases = [
        { limit: 10, expectedMaxTime: 1000 },
        { limit: 25, expectedMaxTime: 1500 },
        { limit: 50, expectedMaxTime: 2000 }
      ];

      for (const testCase of testCases) {
        const req = new Request(`http://localhost/education?limit=${testCase.limit}&isPublished=true`);
        
        const startTime = Date.now();
        const res = await app.request(req);
        const endTime = Date.now();

        const responseTime = endTime - startTime;
        
        expect(res.status).toBe(200);
        expect(responseTime).toBeLessThan(testCase.expectedMaxTime);

        const data = await res.json();
        expect(data.data).toBeDefined();
        expect(data.pagination).toBeDefined();
      }
    });

    it('should perform filtered queries efficiently', async () => {
      const filterTests = [
        { filter: `subject=${IslamicSubject.QURAN}`, maxTime: 1000 },
        { filter: `ageTier=${AgeTier.ADULTS}`, maxTime: 1000 },
        { filter: `difficultyLevel=${DifficultyLevel.BEGINNER}`, maxTime: 1000 },
        { filter: 'search=performance', maxTime: 1500 },
        { filter: `subject=${IslamicSubject.HADITH}&ageTier=${AgeTier.YOUTH}`, maxTime: 1200 }
      ];

      for (const test of filterTests) {
        const req = new Request(`http://localhost/education?${test.filter}&isPublished=true`);
        
        const startTime = Date.now();
        const res = await app.request(req);
        const endTime = Date.now();

        expect(res.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(test.maxTime);
      }
    });

    it('should handle pagination efficiently', async () => {
      const paginationTests = [
        { page: 1, limit: 10 },
        { page: 5, limit: 10 },
        { page: 10, limit: 5 },
        { page: 1, limit: 50 }
      ];

      for (const test of paginationTests) {
        const req = new Request(`http://localhost/education?page=${test.page}&limit=${test.limit}&isPublished=true`);
        
        const startTime = Date.now();
        const res = await app.request(req);
        const endTime = Date.now();

        expect(res.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(2000); // 2 seconds max

        const data = await res.json();
        expect(data.pagination.page).toBe(test.page);
        expect(data.pagination.limit).toBe(test.limit);
      }
    });
  });

  describe('Database Security Tests', () => {
    it('should prevent unauthorized data access through relationships', async () => {
      // Create content with admin user
      const content = await prisma.educationContent.create({
        data: {
          title: 'Secure Content Test',
          description: 'Testing data access security',
          content: 'Sensitive content',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.AQIDAH,
          ageTier: AgeTier.ADULTS,
          difficultyLevel: DifficultyLevel.ADVANCED,
          estimatedDuration: 60,
          isPublished: false, // Not published
          authorId: testAdmin.id
        }
      });

      // Regular user should not be able to access unpublished content
      const req = new Request(`http://localhost/education/${content.id}`, {
        headers: { 'Authorization': 'Bearer user-token' }
      });

      const res = await app.request(req);
      
      // Should either not find it or filter it out
      expect([404, 403]).toContain(res.status);
    });

    it('should validate data integrity constraints', async () => {
      // Test required field constraints
      const invalidData = {
        // Missing required title
        description: 'Test description',
        content: 'Test content',
        contentType: EducationContentType.LESSON,
        subject: IslamicSubject.QURAN,
        ageTier: AgeTier.ALL_AGES,
        difficultyLevel: DifficultyLevel.BEGINNER,
        estimatedDuration: 30
      };

      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(invalidData)
      });

      const res = await app.request(req);
      expect(res.status).toBe(400);
    });

    it('should enforce referential integrity', async () => {
      // Attempt to create progress for non-existent content
      const invalidProgressData = {
        progress: 50,
        timeSpent: 30,
        notes: 'Test progress'
      };

      const req = new Request('http://localhost/education/non-existent-id/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer user-token'
        },
        body: JSON.stringify(invalidProgressData)
      });

      const res = await app.request(req);
      expect(res.status).toBe(404);
    });
  });

  describe('Data Privacy and GDPR Compliance', () => {
    it('should not expose sensitive user information in API responses', async () => {
      const req = new Request('http://localhost/education?isPublished=true');
      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      
      if (data.data && data.data.length > 0) {
        data.data.forEach((content: any) => {
          // Should not expose sensitive author information
          expect(content.author).toBeDefined();
          expect(content.author.password).toBeUndefined();
          expect(content.author.email).toBeUndefined();
          
          // Should only expose necessary author information
          expect(content.author.name).toBeDefined();
          expect(content.author.id).toBeDefined();
        });
      }
    });

    it('should handle user data requests appropriately', async () => {
      // Create user progress
      const content = await prisma.educationContent.create({
        data: {
          title: 'Privacy Test Content',
          description: 'Testing privacy',
          content: 'Test content',
          contentType: EducationContentType.LESSON,
          subject: IslamicSubject.QURAN,
          ageTier: AgeTier.ALL_AGES,
          difficultyLevel: DifficultyLevel.BEGINNER,
          estimatedDuration: 30,
          isPublished: true,
          authorId: testAdmin.id
        }
      });

      await prisma.educationUserProgress.create({
        data: {
          userId: testUser.id,
          contentId: content.id,
          progress: 75,
          timeSpent: 45
        }
      });

      // User should only see their own progress
      const req = new Request('http://localhost/education/progress/me', {
        headers: { 'Authorization': 'Bearer user-token' }
      });

      const res = await app.request(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.progress).toBeDefined();
      
      // All progress entries should belong to the requesting user
      data.progress.forEach((progress: any) => {
        expect(progress.userId).toBe(testUser.id);
      });
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose internal system information in error messages', async () => {
      // Force a database error by using invalid data
      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          title: null, // This should cause a database error
          description: 'Test description',
          content: 'Test content'
        })
      });

      const res = await app.request(req);
      const data = await res.json();

      expect(res.status).toBeGreaterThanOrEqual(400);
      
      // Error message should not expose internal database details
      expect(data.error).toBeDefined();
      expect(data.error).not.toMatch(/prisma|database|table|column/i);
      expect(data.error).not.toMatch(/stack trace|file path|line number/i);
    });

    it('should handle malformed JSON gracefully', async () => {
      const req = new Request('http://localhost/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: '{"title": "test", "description":}' // Malformed JSON
      });

      const res = await app.request(req);
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.error).toBeDefined();
      expect(data.error).not.toContain('SyntaxError');
    });
  });
});