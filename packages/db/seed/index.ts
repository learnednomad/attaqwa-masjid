import { PrismaClient } from '../src/generated/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users with different roles
  const testUsers = [
    {
      email: 'texminer8@gmail.com',
      password: 'Pass1word',
      name: 'System Administrator',
      role: 'ADMIN',
      ageTier: 'ADULTS'
    },
    {
      email: 'admin@attaqwa.org',
      password: 'admin123',
      name: 'Masjid Administrator',
      role: 'ADMIN',
      ageTier: 'ADULTS'
    },
    {
      email: 'moderator@attaqwa.org',
      password: 'moderator123',
      name: 'Community Moderator',
      role: 'MODERATOR',
      ageTier: 'ADULTS'
    },
    {
      email: 'imam@attaqwa.org',
      password: 'imam123',
      name: 'Imam Mohammad Zahirul Islam',
      role: 'MODERATOR',
      ageTier: 'ADULTS'
    },
    {
      email: 'user@attaqwa.org',
      password: 'user123',
      name: 'Community Member',
      role: 'USER',
      ageTier: 'ADULTS'
    },
    {
      email: 'parent@attaqwa.org',
      password: 'parent123',
      name: 'Parent User',
      role: 'USER',
      ageTier: 'ADULTS'
    },
    {
      email: 'student@attaqwa.org',
      password: 'student123',
      name: 'Young Student',
      role: 'USER',
      ageTier: 'YOUTH'
    }
  ];

  console.log('👥 Creating test users with different roles...');
  
  const createdUsers = [];
  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        ageTier: userData.ageTier,
      },
    });
    createdUsers.push(user);
    console.log(`✅ Created ${userData.role} user: ${user.email}`);
  }

  // Get the admin user for announcements
  const admin = createdUsers.find(user => user.email === 'texminer8@gmail.com')!;

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

    await prisma.prayerSchedule.upsert({
      where: { date },
      update: {},
      create: {
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

  // Seed Islamic educational content using the working seeder
  try {
    const { seedEducationContent } = await import('./education-content.js');
    await seedEducationContent();
    console.log('✅ Created comprehensive Islamic educational content');
  } catch (error) {
    console.log('⚠️ Skipped education content seeding due to module issues');
  }

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