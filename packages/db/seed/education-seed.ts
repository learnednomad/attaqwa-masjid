/**
 * Educational content seed data
 * Creates comprehensive sample data for the Islamic education system
 */

import { PrismaClient } from '../src/generated/index.js';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seedEducationalContent() {
  console.log('🌱 Seeding educational content...');
  
  try {
    // Create test users with different age tiers
    const adminPassword = await hash('admin123', 10);
    const userPassword = await hash('user123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@attaqwa.com' },
      update: {},
      create: {
        email: 'admin@attaqwa.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        ageTier: 'ADULTS',
        isActive: true
      }
    });
    
    const childUser = await prisma.user.upsert({
      where: { email: 'child@attaqwa.com' },
      update: {},
      create: {
        email: 'child@attaqwa.com',
        password: userPassword,
        name: 'Young Learner',
        role: 'USER',
        ageTier: 'CHILDREN',
        isActive: true
      }
    });
    
    const youthUser = await prisma.user.upsert({
      where: { email: 'youth@attaqwa.com' },
      update: {},
      create: {
        email: 'youth@attaqwa.com',
        password: userPassword,
        name: 'Teen Student',
        role: 'USER',
        ageTier: 'YOUTH',
        isActive: true
      }
    });
    
    const adultUser = await prisma.user.upsert({
      where: { email: 'adult@attaqwa.com' },
      update: {},
      create: {
        email: 'adult@attaqwa.com',
        password: userPassword,
        name: 'Adult Learner',
        role: 'USER',
        ageTier: 'ADULTS',
        isActive: true
      }
    });
    
    console.log('✓ Created test users');
    
    // Create Quran content for children
    const quranForKids = await prisma.educationContent.create({
      data: {
        title: 'Learn Surah Al-Fatiha',
        description: 'Understanding the opening chapter of the Quran with simple explanations',
        content: '# Surah Al-Fatiha - The Opening\n\nSurah Al-Fatiha is the first chapter of the Quran and the most important prayer in Islam.',
        contentType: 'LESSON',
        subject: 'QURAN',
        ageTier: 'CHILDREN',
        difficultyLevel: 'BEGINNER',
        estimatedDuration: 20,
        prerequisites: [],
        tags: ['quran', 'surah', 'fatiha', 'basics', 'prayer'],
        isPublished: true,
        authorId: admin.id,
        chapters: {
          create: [
            {
              title: 'Introduction to Al-Fatiha',
              chapterContent: 'Al-Fatiha means "The Opening". It is recited in every unit of prayer.',
              order: 1,
              estimatedDuration: 5
            },
            {
              title: 'Learning the Verses',
              chapterContent: 'Let\'s learn each verse with its meaning:\n\n1. Bismillah ir-Rahman ir-Raheem\n2. Alhamdulillahi Rabbil Aalameen...',
              order: 2,
              estimatedDuration: 10
            },
            {
              title: 'Practice and Memorization',
              chapterContent: 'Tips for memorizing Al-Fatiha easily and correctly.',
              order: 3,
              estimatedDuration: 5
            }
          ]
        },
        islamicReferences: {
          create: {
            referenceType: 'QURAN',
            surahNumber: 1,
            ayahNumber: 1,
            arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            transliteration: 'Bismillah ir-Rahman ir-Raheem',
            translation: 'In the name of Allah, the Most Gracious, the Most Merciful'
          }
        }
      }
    });
    
    // Create a quiz for the Quran lesson
    const quranQuiz = await prisma.quiz.create({
      data: {
        contentId: quranForKids.id,
        title: 'Al-Fatiha Quiz',
        description: 'Test your knowledge of Surah Al-Fatiha',
        timeLimit: 10,
        passingScore: 70,
        maxAttempts: 3,
        showCorrectAnswers: true,
        shuffleQuestions: false,
        isActive: true,
        questions: {
          create: [
            {
              questionText: 'What does Al-Fatiha mean?',
              questionType: 'MULTIPLE_CHOICE',
              points: 1,
              order: 1,
              explanation: 'Al-Fatiha means "The Opening" because it opens the Quran.',
              options: {
                create: [
                  { text: 'The Opening', isCorrect: true, order: 1 },
                  { text: 'The End', isCorrect: false, order: 2 },
                  { text: 'The Middle', isCorrect: false, order: 3 },
                  { text: 'The Prayer', isCorrect: false, order: 4 }
                ]
              }
            },
            {
              questionText: 'How many verses are in Surah Al-Fatiha?',
              questionType: 'MULTIPLE_CHOICE',
              points: 1,
              order: 2,
              explanation: 'Surah Al-Fatiha has 7 verses.',
              options: {
                create: [
                  { text: '5', isCorrect: false, order: 1 },
                  { text: '6', isCorrect: false, order: 2 },
                  { text: '7', isCorrect: true, order: 3 },
                  { text: '8', isCorrect: false, order: 4 }
                ]
              }
            },
            {
              questionText: 'Al-Fatiha is recited in every unit of prayer.',
              questionType: 'TRUE_FALSE',
              points: 1,
              order: 3,
              explanation: 'Yes, Al-Fatiha must be recited in every rakah (unit) of prayer.',
              options: {
                create: [
                  { text: 'True', isCorrect: true, order: 1 },
                  { text: 'False', isCorrect: false, order: 2 }
                ]
              }
            }
          ]
        }
      }
    });
    
    // Create Prayer content for youth
    const prayerForYouth = await prisma.educationContent.create({
      data: {
        title: 'Perfecting Your Salah',
        description: 'Advanced guide to improving concentration and quality in prayer',
        content: '# Perfecting Your Salah\n\nLearn how to enhance your prayer experience and develop khushoo (concentration).',
        contentType: 'LESSON',
        subject: 'WORSHIP',
        ageTier: 'YOUTH',
        difficultyLevel: 'INTERMEDIATE',
        estimatedDuration: 30,
        prerequisites: [],
        tags: ['prayer', 'salah', 'worship', 'concentration', 'khushoo'],
        isPublished: true,
        authorId: admin.id,
        chapters: {
          create: [
            {
              title: 'Understanding Khushoo',
              chapterContent: 'Khushoo is the state of calmness, serenity, and humility in prayer...',
              order: 1,
              estimatedDuration: 10
            },
            {
              title: 'Common Mistakes in Prayer',
              chapterContent: 'Identifying and correcting common errors that affect prayer quality...',
              order: 2,
              estimatedDuration: 10
            },
            {
              title: 'Practical Tips for Better Focus',
              chapterContent: 'Actionable strategies to improve concentration during prayer...',
              order: 3,
              estimatedDuration: 10
            }
          ]
        }
      }
    });
    
    // Create Islamic History content for adults
    const islamicHistory = await prisma.educationContent.create({
      data: {
        title: 'The Life of Prophet Muhammad (PBUH)',
        description: 'Comprehensive study of the Prophet\'s life and its lessons for today',
        content: '# The Life of Prophet Muhammad (Peace Be Upon Him)\n\nA detailed journey through the Seerah.',
        contentType: 'LESSON',
        subject: 'SEERAH',
        ageTier: 'ADULTS',
        difficultyLevel: 'ADVANCED',
        estimatedDuration: 60,
        prerequisites: [],
        tags: ['seerah', 'prophet', 'muhammad', 'history', 'biography'],
        isPublished: true,
        authorId: admin.id,
        chapters: {
          create: [
            {
              title: 'Early Life in Makkah',
              chapterContent: 'The Prophet\'s childhood, youth, and life before prophethood...',
              order: 1,
              estimatedDuration: 20
            },
            {
              title: 'The First Revelation',
              chapterContent: 'The momentous event at Cave Hira and the beginning of Islam...',
              order: 2,
              estimatedDuration: 20
            },
            {
              title: 'The Makkan Period',
              chapterContent: 'Thirteen years of patience, persecution, and perseverance...',
              order: 3,
              estimatedDuration: 20
            }
          ]
        },
        islamicReferences: {
          create: {
            referenceType: 'HADITH',
            hadithBook: 'Sahih Bukhari',
            hadithNumber: '3',
            arabicText: 'إنما الأعمال بالنيات',
            transliteration: 'Innama al-a\'malu bin-niyyat',
            translation: 'Actions are judged by intentions',
            grade: 'Sahih'
          }
        }
      }
    });
    
    // Create a video content
    const videoContent = await prisma.educationContent.create({
      data: {
        title: 'Introduction to Arabic Alphabet',
        description: 'Learn the Arabic alphabet with interactive video lessons',
        content: 'Video lesson on Arabic alphabet basics',
        contentType: 'VIDEO',
        subject: 'ARABIC_LANGUAGE',
        ageTier: 'ALL_AGES',
        difficultyLevel: 'BEGINNER',
        estimatedDuration: 15,
        mediaUrl: 'https://example.com/arabic-alphabet-video.mp4',
        thumbnailUrl: 'https://example.com/arabic-alphabet-thumb.jpg',
        prerequisites: [],
        tags: ['arabic', 'alphabet', 'language', 'basics'],
        isPublished: true,
        authorId: admin.id,
        resources: {
          create: [
            {
              title: 'Arabic Alphabet PDF',
              url: 'https://example.com/arabic-alphabet.pdf',
              type: 'PDF',
              order: 1
            },
            {
              title: 'Practice Worksheets',
              url: 'https://example.com/arabic-worksheets.pdf',
              type: 'PDF',
              order: 2
            }
          ]
        }
      }
    });
    
    // Create Learning Paths
    const beginnerPath = await prisma.learningPath.create({
      data: {
        title: 'Islamic Basics for Children',
        description: 'A complete introduction to Islam for young learners',
        subject: 'QURAN',
        ageTier: 'CHILDREN',
        difficultyLevel: 'BEGINNER',
        estimatedDuration: 10, // 10 hours total
        isPublished: true,
        authorId: admin.id,
        items: {
          create: [
            {
              contentId: quranForKids.id,
              order: 1,
              isRequired: true
            }
          ]
        }
      }
    });
    
    // Create some user progress
    await prisma.userProgress.create({
      data: {
        userId: childUser.id,
        contentId: quranForKids.id,
        status: 'IN_PROGRESS',
        progress: 33,
        currentChapter: 1,
        timeSpent: 5,
        attempts: 1
      }
    });
    
    await prisma.userProgress.create({
      data: {
        userId: youthUser.id,
        contentId: prayerForYouth.id,
        status: 'COMPLETED',
        progress: 100,
        currentChapter: 3,
        timeSpent: 30,
        completedAt: new Date(),
        score: 85,
        attempts: 1
      }
    });
    
    // Create a quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: childUser.id,
        quizId: quranQuiz.id,
        score: 100,
        totalQuestions: 3,
        correctAnswers: 3,
        timeSpent: 180, // 3 minutes in seconds
        isPassed: true,
        completedAt: new Date()
      }
    });
    
    // Create achievements
    const achievements = await prisma.achievement.createMany({
      data: [
        {
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🌟',
          criteriaType: 'COMPLETION',
          criteriaValue: 1,
          points: 10,
          isRare: false
        },
        {
          title: 'Quiz Champion',
          description: 'Score 100% on any quiz',
          icon: '🏆',
          criteriaType: 'SCORE',
          criteriaValue: 100,
          points: 25,
          isRare: false
        },
        {
          title: 'Quran Explorer',
          description: 'Complete 5 Quran lessons',
          icon: '📖',
          criteriaType: 'COMPLETION',
          criteriaValue: 5,
          subject: 'QURAN',
          points: 50,
          isRare: false
        },
        {
          title: 'Knowledge Seeker',
          description: 'Study for 10 hours total',
          icon: '⏰',
          criteriaType: 'TIME_SPENT',
          criteriaValue: 600, // 10 hours in minutes
          points: 100,
          isRare: true
        },
        {
          title: 'Perfect Week',
          description: 'Study every day for 7 days',
          icon: '📅',
          criteriaType: 'STREAK',
          criteriaValue: 7,
          points: 75,
          isRare: false
        }
      ]
    });
    
    // Award achievement to user who completed a lesson
    const firstAchievement = await prisma.achievement.findFirst({
      where: { title: 'First Steps' }
    });
    
    if (firstAchievement) {
      await prisma.userAchievement.create({
        data: {
          userId: youthUser.id,
          achievementId: firstAchievement.id,
          progress: 100
        }
      });
    }
    
    // Create a certificate for completed content
    await prisma.educationCertificate.create({
      data: {
        userId: youthUser.id,
        contentId: prayerForYouth.id,
        title: 'Certificate of Completion',
        description: 'Successfully completed "Perfecting Your Salah" course',
        verificationCode: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        issuerName: 'Masjid At-Taqwa Education Department'
      }
    });
    
    console.log('✅ Educational content seeded successfully!');
    
    // Print summary
    const contentCount = await prisma.educationContent.count();
    const quizCount = await prisma.quiz.count();
    const userCount = await prisma.user.count();
    const progressCount = await prisma.userProgress.count();
    
    console.log('\n📊 Seed Summary:');
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Educational Content: ${contentCount}`);
    console.log(`  - Quizzes: ${quizCount}`);
    console.log(`  - User Progress Records: ${progressCount}`);
    console.log(`  - Achievements: ${achievements.count}`);
    console.log('\n🔑 Test Credentials:');
    console.log('  Admin: admin@attaqwa.com / admin123');
    console.log('  Child: child@attaqwa.com / user123');
    console.log('  Youth: youth@attaqwa.com / user123');
    console.log('  Adult: adult@attaqwa.com / user123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedEducationalContent()
  .then(() => {
    console.log('🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });