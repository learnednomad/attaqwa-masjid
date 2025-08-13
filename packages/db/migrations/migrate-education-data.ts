#!/usr/bin/env ts-node
/**
 * Migration script to transform existing educational data to new schema
 * Run with: npx ts-node migrations/migrate-education-data.ts
 */

import { PrismaClient } from '../src/generated/index.js';

const prisma = new PrismaClient();

async function migrateEducationData() {
  console.log('🔄 Starting education data migration...');
  
  try {
    // Start a transaction for data integrity
    await prisma.$transaction(async (tx) => {
      
      // Step 1: Check if old tables exist
      const contentModules = await tx.$queryRaw`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = 'content_modules'
      ` as any[];
      
      if (contentModules[0]?.count === '0') {
        console.log('✅ No legacy data to migrate. Fresh installation detected.');
        return;
      }
      
      console.log('📚 Migrating ContentModules to EducationContent...');
      
      // Step 2: Migrate ContentModules to EducationContent
      const modules = await tx.$queryRaw`
        SELECT * FROM content_modules
      ` as any[];
      
      for (const module of modules) {
        // Map old category to new IslamicSubject
        const subjectMapping: Record<string, string> = {
          'TAFSIR': 'TAFSIR',
          'SIRA': 'SEERAH',
          'CHARACTER_BUILDING': 'AKHLAQ',
          'PRAYER': 'WORSHIP',
          'QURAN': 'QURAN'
        };
        
        // Map old AgeTier to new AgeTier
        const ageTierMapping: Record<string, string> = {
          'PRIMARY': 'CHILDREN',
          'INTERMEDIATE': 'YOUTH',
          'HIGHER': 'ADULTS'
        };
        
        // Create new EducationContent entry
        const educationContent = await tx.educationContent.create({
          data: {
            id: module.id, // Preserve original IDs for relation mapping
            title: module.title,
            description: module.description,
            content: '', // Will be populated from lessons
            contentType: 'LESSON', // Default to LESSON for modules
            subject: subjectMapping[module.category] || 'QURAN',
            ageTier: ageTierMapping[module.ageTier] || 'ALL_AGES',
            difficultyLevel: module.ageTier === 'PRIMARY' ? 'BEGINNER' : 
                           module.ageTier === 'INTERMEDIATE' ? 'INTERMEDIATE' : 'ADVANCED',
            estimatedDuration: 30, // Default 30 minutes
            prerequisites: [],
            tags: [module.category.toLowerCase()],
            isPublished: module.isActive,
            authorId: await getDefaultAuthorId(tx),
            createdAt: module.createdAt,
            updatedAt: module.updatedAt
          }
        });
        
        console.log(`  ✓ Migrated module: ${module.title}`);
      }
      
      // Step 3: Migrate Lessons to Chapters
      console.log('📖 Migrating Lessons to Chapters...');
      
      const lessons = await tx.$queryRaw`
        SELECT * FROM lessons ORDER BY "moduleId", "sortOrder"
      ` as any[];
      
      for (const lesson of lessons) {
        await tx.chapter.create({
          data: {
            contentId: lesson.moduleId, // Use the module ID as content ID
            title: lesson.title,
            chapterContent: lesson.content,
            order: lesson.sortOrder,
            estimatedDuration: 10, // Default 10 minutes per lesson
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt
          }
        });
        
        console.log(`  ✓ Migrated lesson: ${lesson.title}`);
      }
      
      // Step 4: Migrate Questions to Quiz system
      console.log('❓ Migrating Questions to Quiz system...');
      
      const questions = await tx.$queryRaw`
        SELECT * FROM questions ORDER BY "lessonId", "sortOrder"
      ` as any[];
      
      // Group questions by lesson to create quizzes
      const questionsByLesson = questions.reduce((acc: any, q: any) => {
        if (!acc[q.lessonId]) acc[q.lessonId] = [];
        acc[q.lessonId].push(q);
        return acc;
      }, {});
      
      for (const [lessonId, lessonQuestions] of Object.entries(questionsByLesson)) {
        const lesson = lessons.find((l: any) => l.id === lessonId);
        if (!lesson) continue;
        
        // Create a quiz for this lesson's questions
        const quiz = await tx.quiz.create({
          data: {
            contentId: lesson.moduleId,
            title: `Quiz: ${lesson.title}`,
            description: `Assessment for ${lesson.title}`,
            passingScore: 70,
            maxAttempts: 3,
            showCorrectAnswers: true,
            shuffleQuestions: false,
            isActive: true
          }
        });
        
        // Migrate each question
        for (const [index, question] of (lessonQuestions as any[]).entries()) {
          const quizQuestion = await tx.quizQuestion.create({
            data: {
              quizId: quiz.id,
              questionText: question.questionText,
              questionType: 'MULTIPLE_CHOICE',
              explanation: question.explanation,
              points: 1,
              order: index
            }
          });
          
          // Parse and migrate options
          const optionsData = typeof question.options === 'string' 
            ? JSON.parse(question.options) 
            : question.options;
          
          if (optionsData?.options && Array.isArray(optionsData.options)) {
            for (const [optIndex, option] of optionsData.options.entries()) {
              await tx.questionOption.create({
                data: {
                  questionId: quizQuestion.id,
                  text: option.text,
                  isCorrect: option.isCorrect || false,
                  order: optIndex
                }
              });
            }
          }
        }
        
        console.log(`  ✓ Created quiz with ${lessonQuestions.length} questions for: ${lesson.title}`);
      }
      
      // Step 5: Migrate UserProgress
      console.log('📊 Migrating UserProgress...');
      
      const userProgress = await tx.$queryRaw`
        SELECT * FROM user_progress
      ` as any[];
      
      for (const progress of userProgress) {
        const lesson = lessons.find((l: any) => l.id === progress.lessonId);
        if (!lesson) continue;
        
        // Check if new progress entry already exists
        const existingProgress = await tx.userProgress.findUnique({
          where: {
            userId_contentId: {
              userId: progress.userId,
              contentId: lesson.moduleId
            }
          }
        });
        
        if (!existingProgress) {
          await tx.userProgress.create({
            data: {
              userId: progress.userId,
              contentId: lesson.moduleId,
              status: progress.completed ? 'COMPLETED' : 'IN_PROGRESS',
              progress: progress.completed ? 100 : Math.min(progress.score || 0, 99),
              score: progress.score ? progress.score / 100 : null, // Convert to percentage
              attempts: 1,
              lastAccessed: progress.updatedAt,
              completedAt: progress.completed ? progress.updatedAt : null,
              createdAt: progress.createdAt,
              updatedAt: progress.updatedAt
            }
          });
          
          console.log(`  ✓ Migrated progress for user ${progress.userId}`);
        }
      }
      
      // Step 6: Create sample achievements
      console.log('🏆 Creating initial achievements...');
      
      const achievements = [
        {
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🌟',
          criteriaType: 'COMPLETION' as const,
          criteriaValue: 1,
          points: 10,
          isRare: false
        },
        {
          title: 'Quiz Master',
          description: 'Score 100% on any quiz',
          icon: '🎯',
          criteriaType: 'SCORE' as const,
          criteriaValue: 100,
          points: 25,
          isRare: false
        },
        {
          title: 'Dedicated Learner',
          description: 'Complete 10 lessons',
          icon: '📚',
          criteriaType: 'COMPLETION' as const,
          criteriaValue: 10,
          points: 50,
          isRare: false
        },
        {
          title: 'Knowledge Seeker',
          description: 'Study for 100 hours total',
          icon: '⏰',
          criteriaType: 'TIME_SPENT' as const,
          criteriaValue: 6000, // 100 hours in minutes
          points: 100,
          isRare: true
        },
        {
          title: 'Quran Scholar',
          description: 'Complete all Quran lessons',
          icon: '📖',
          criteriaType: 'COMPLETION' as const,
          criteriaValue: 20,
          subject: 'QURAN' as const,
          points: 200,
          isRare: true
        }
      ];
      
      for (const achievement of achievements) {
        await tx.achievement.create({
          data: achievement
        });
      }
      
      console.log(`  ✓ Created ${achievements.length} achievements`);
      
      console.log('✅ Education data migration completed successfully!');
    }, {
      timeout: 60000 // 60 seconds timeout for large migrations
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function getDefaultAuthorId(tx: any): Promise<string> {
  // Try to find an admin user
  const admin = await tx.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  if (admin) return admin.id;
  
  // Create a system user if no admin exists
  const systemUser = await tx.user.upsert({
    where: { email: 'system@attaqwa-masjid.com' },
    update: {},
    create: {
      email: 'system@attaqwa-masjid.com',
      password: 'system', // This should be hashed in production
      name: 'System',
      role: 'ADMIN',
      isActive: true
    }
  });
  
  return systemUser.id;
}

// Run the migration
migrateEducationData()
  .then(() => {
    console.log('🎉 Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });