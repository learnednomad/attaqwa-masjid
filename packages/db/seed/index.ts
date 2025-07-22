import { PrismaClient } from '../src/generated/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@attaqwa.org' },
    update: {},
    create: {
      email: 'admin@attaqwa.org',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample announcements
  const announcement1 = await prisma.announcement.create({
    data: {
      title: 'Welcome to Masjid At-Taqwa',
      content: 'We are pleased to announce the opening of our new community center. Join us for our weekly programs and events.',
      authorId: admin.id,
      isActive: true,
    },
  });

  const announcement2 = await prisma.announcement.create({
    data: {
      title: 'Eid ul-Fitr Celebration',
      content: 'Join us for the Eid celebration at the mosque. Festivities will begin after Fajr prayer.',
      authorId: admin.id,
      isEvent: true,
      eventDate: new Date('2024-04-10T09:00:00Z'),
      isActive: true,
    },
  });

  console.log('✅ Created announcements');

  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      title: 'Friday Prayer',
      description: 'Weekly Friday prayer service with khutbah',
      date: new Date('2024-01-26T12:30:00Z'),
      startTime: '12:30',
      endTime: '13:00',
      location: 'Main Prayer Hall',
      isIndoor: true,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Community Iftar',
      description: 'Join us for a community iftar during Ramadan',
      date: new Date('2024-03-15T18:00:00Z'),
      startTime: '18:00',
      endTime: '20:00',
      location: 'Community Hall',
      isIndoor: true,
    },
  });

  console.log('✅ Created events');

  // Create sample prayer schedules
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);

    await prisma.prayerSchedule.create({
      data: {
        date,
        fajr: '06:12',
        sunrise: '07:42',
        dhuhr: '12:34',
        asr: '15:02',
        maghrib: '17:26',
        isha: '18:56',
        qibla: 58.5,
      },
    });
  }

  console.log('✅ Created prayer schedules');

  // Create sample educational content
  const tafsirModule = await prisma.contentModule.create({
    data: {
      title: 'Introduction to Tafsir',
      description: 'Learn the basics of Quran interpretation',
      category: 'TAFSIR',
      ageTier: 'INTERMEDIATE',
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'What is Tafsir?',
      content: 'Tafsir is the Arabic word for exegesis, usually of the Quran...',
      moduleId: tafsirModule.id,
      sortOrder: 1,
    },
  });

  await prisma.question.create({
    data: {
      lessonId: lesson1.id,
      questionText: 'What does the word "Tafsir" mean?',
      options: {
        options: [
          { text: 'Exegesis or interpretation', isCorrect: true },
          { text: 'Translation', isCorrect: false },
          { text: 'Recitation', isCorrect: false },
          { text: 'Memorization', isCorrect: false },
        ],
      },
      explanation: 'Tafsir comes from the Arabic root f-s-r, meaning to explain or interpret.',
      sortOrder: 1,
    },
  });

  console.log('✅ Created educational content');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });