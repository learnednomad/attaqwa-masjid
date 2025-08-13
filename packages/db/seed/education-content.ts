import { PrismaClient } from '../src/generated/index.js';

const prisma = new PrismaClient();

export async function seedEducationContent() {
  console.log('Seeding Islamic education content...');

  // Create sample Islamic educational content
  const educationContent = [
    {
      title: 'Introduction to Quran',
      description: 'Learn the basics of Quranic reading and understanding with proper pronunciation and meaning.',
      content: `# Introduction to the Holy Quran

## Overview
The Quran is the holy book of Islam, revealed to Prophet Muhammad (peace be upon him) over a period of 23 years. It contains 114 chapters (Surahs) and over 6,000 verses (Ayahs).

## Learning Objectives
By the end of this lesson, you will:
- Understand the significance of the Quran in Islamic faith
- Learn basic Arabic pronunciation rules
- Practice reading simple Quranic verses
- Appreciate the beauty of Quranic language

## The Opening Chapter - Al-Fatiha

The first chapter of the Quran is called Al-Fatiha (The Opening). It is recited in every unit of prayer.

### Arabic Text
بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
الرَّحْمَنِ الرَّحِيمِ
مَالِكِ يَوْمِ الدِّينِ

### Transliteration
Bismillah ar-Rahman ar-Raheem
Al-hamdu lillahi rabbil alameen
Ar-Rahman ar-Raheem
Maliki yawm ad-deen

### Translation
In the name of Allah, the Most Gracious, the Most Merciful
All praise is due to Allah, Lord of the worlds
The Most Gracious, the Most Merciful
Master of the Day of Judgment

## Practice Exercise
Try reading Al-Fatiha slowly, focusing on proper pronunciation. Listen to the audio pronunciation and repeat each verse.

## Next Steps
After completing this lesson, you can:
1. Take the comprehension quiz
2. Practice with additional Quranic verses
3. Move to the next lesson on Tajweed rules`,
      contentType: 'LESSON',
      subject: 'QURAN',
      ageTier: 'CHILDREN',
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 30,
      prerequisites: [],
      tags: ['basics', 'reading', 'pronunciation', 'al-fatiha'],
      arabicContent: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: 'Bismillah ar-Rahman ar-Raheem',
      translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
      isPublished: true,
    },
    {
      title: 'Five Pillars of Islam',
      description: 'Understanding the fundamental pillars that form the foundation of Islamic faith and practice.',
      content: `# The Five Pillars of Islam

## Introduction
The Five Pillars of Islam are the foundation of Muslim life and practice. Every Muslim is expected to fulfill these obligations to the best of their ability.

## The Five Pillars

### 1. Shahada (Declaration of Faith)
The declaration that there is no god but Allah, and Muhammad is His messenger.

**Arabic**: لا إله إلا الله محمد رسول الله
**Transliteration**: La ilaha illa Allah, Muhammad rasul Allah

### 2. Salah (Prayer)
The five daily prayers performed at prescribed times throughout the day.

- Fajr (Dawn)
- Dhuhr (Midday)
- Asr (Afternoon)
- Maghrib (Sunset)
- Isha (Night)

### 3. Zakat (Charity)
The obligatory giving of a portion of one's wealth to those in need.

### 4. Sawm (Fasting)
Fasting during the month of Ramadan from dawn to sunset.

### 5. Hajj (Pilgrimage)
The pilgrimage to Mecca that every Muslim should perform at least once if able.

## Reflection
Consider how these pillars can strengthen your faith and connection to the Muslim community.`,
      contentType: 'LESSON',
      subject: 'AQIDAH',
      ageTier: 'YOUTH',
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 45,
      prerequisites: [],
      tags: ['pillars', 'faith', 'practice', 'fundamentals'],
      isPublished: true,
    },
    {
      title: 'Prayer (Salah) Fundamentals',
      description: 'Learn the correct way to perform the five daily prayers with proper movements and recitations.',
      content: `# Prayer (Salah) Fundamentals

## Introduction
Salah (prayer) is the second pillar of Islam and a direct connection between the worshipper and Allah.

## Preparation for Prayer

### 1. Wudu (Ablution)
Ritual purification before prayer involving:
- Washing hands
- Rinsing mouth and nose
- Washing face
- Washing arms up to elbows
- Wiping head
- Washing feet

### 2. Facing the Qibla
All prayers must be performed facing the direction of the Kaaba in Mecca.

### 3. Prayer Times
Each of the five daily prayers has a specific time window:
- **Fajr**: From dawn until sunrise
- **Dhuhr**: From midday until afternoon
- **Asr**: From afternoon until sunset
- **Maghrib**: From sunset until twilight
- **Isha**: From twilight until midnight

## Prayer Movements
1. **Takbir**: Raising hands and saying "Allahu Akbar"
2. **Qiyam**: Standing and reciting Al-Fatiha
3. **Ruku**: Bowing with hands on knees
4. **Sujud**: Prostration with forehead touching ground
5. **Tashahhud**: Sitting and reciting testimony

## Common Recitations
Learn the essential Arabic phrases used in prayer.`,
      contentType: 'LESSON',
      subject: 'WORSHIP',
      ageTier: 'ALL_AGES',
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 35,
      prerequisites: [],
      tags: ['salah', 'prayer', 'worship', 'movements', 'wudu'],
      isPublished: true,
    },
    {
      title: 'Stories of Prophet Ibrahim (AS)',
      description: 'Learn about the life and lessons from Prophet Ibrahim (Abraham), peace be upon him.',
      content: `# Stories of Prophet Ibrahim (AS)

## Introduction
Prophet Ibrahim (Abraham), peace be upon him, is known as the "Friend of Allah" (Khalil Allah) and is mentioned frequently in the Quran.

## Key Stories

### The Breaking of Idols
When Ibrahim was young, he questioned his people's worship of idols and demonstrated their powerlessness.

### The Great Sacrifice
Allah tested Ibrahim by commanding him to sacrifice his beloved son Ismail. Ibrahim's willingness to obey Allah's command is commemorated during Eid al-Adha.

### Building the Kaaba
Ibrahim and his son Ismail built the Kaaba in Mecca, which became the direction of prayer for all Muslims.

## Lessons Learned
- Complete trust in Allah
- Courage to stand for truth
- The importance of sacrifice for Allah
- Building foundations for future generations

## Reflection Questions
1. How did Ibrahim show his faith in Allah?
2. What can we learn from Ibrahim's relationship with his son?
3. How can we apply Ibrahim's example in our daily lives?`,
      contentType: 'LESSON',
      subject: 'SEERAH',
      ageTier: 'CHILDREN',
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 25,
      prerequisites: [],
      tags: ['prophets', 'stories', 'ibrahim', 'abraham', 'sacrifice'],
      isPublished: true,
    },
    {
      title: 'Basic Arabic Letters',
      description: 'Learn the Arabic alphabet with proper pronunciation and letter recognition.',
      content: `# Basic Arabic Letters

## Introduction
Arabic is the language of the Quran and learning it helps us better understand our prayers and Islamic texts.

## The Arabic Alphabet
Arabic has 28 letters, all consonants. Vowels are indicated by diacritical marks.

### Letters 1-5
- **ا** (Alif) - Like 'a' in "father"
- **ب** (Ba) - Like 'b' in "book"  
- **ت** (Ta) - Like 't' in "top"
- **ث** (Tha) - Like 'th' in "think"
- **ج** (Jim) - Like 'j' in "jam"

### Practice
Write each letter and practice the pronunciation. Arabic is written from right to left.

## Letter Connections
Most Arabic letters connect to the letters before and after them. Practice writing connected letters.

## Next Steps
- Learn more letters
- Practice simple words
- Begin reading basic Quranic verses`,
      contentType: 'INTERACTIVE',
      subject: 'ARABIC_LANGUAGE',
      ageTier: 'CHILDREN',
      difficultyLevel: 'BEGINNER',
      estimatedDuration: 40,
      prerequisites: [],
      tags: ['alphabet', 'writing', 'pronunciation', 'basics'],
      isPublished: true,
    }
  ];

  // Find or create admin user for content authorship
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@attaqwa.org',
        password: '$2b$10$example', // Placeholder hash
        name: 'Education Admin',
        role: 'ADMIN',
      }
    });
  }

  // Create education content
  for (const contentData of educationContent) {
    const existingContent = await prisma.educationContent.findFirst({
      where: { title: contentData.title }
    });

    if (!existingContent) {
      await prisma.educationContent.create({
        data: {
          ...contentData,
          authorId: adminUser.id,
        }
      });
      console.log(`Created: ${contentData.title}`);
    } else {
      console.log(`Skipped (exists): ${contentData.title}`);
    }
  }

  console.log('✅ Education content seeding completed');
}

if (require.main === module) {
  seedEducationContent()
    .then(() => {
      console.log('Education seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Education seeding failed:', error);
      process.exit(1);
    });
}