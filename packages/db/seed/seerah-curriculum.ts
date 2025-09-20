/**
 * Seerah Curriculum Seed Data
 * Based on The Sealed Nectar, Ibn Kathir, and Al-Baghawi
 */

import { PrismaClient } from '../src/generated';
import type {
  EducationContent,
  Quiz,
  QuizQuestion,
  Chapter,
  LearningPath,
} from '../src/generated';

const prisma = new PrismaClient();

// Seerah Module Structure
export const seerahModules = [
  {
    id: 'seerah-module-1',
    title: 'Module 1: Pre-Prophethood & Early Life',
    description: 'Explore Arabia before Islam, the Prophet\'s noble lineage, birth, and early childhood with authenticated sources',
    subject: 'SEERAH',
    estimatedDuration: 360, // 6 hours
    chapters: [
      {
        title: 'Arabia Before Islam',
        content: `# Arabia Before Islam\n\n## Geographic and Political Context\n\nThe Arabian Peninsula was strategically located between three continents...`,
        order: 1,
        estimatedDuration: 60,
      },
      {
        title: 'The Noble Lineage',
        content: `# The Prophet's Noble Lineage\n\n## From Ibrahim to Muhammad ﷺ\n\nAuthenticated lineage traced through Adnan...`,
        order: 2,
        estimatedDuration: 45,
      },
      {
        title: 'The Year of the Elephant',
        content: `# The Year of the Elephant\n\n## Divine Protection of the Ka'bah\n\nThe miraculous event that preceded the Prophet's birth...`,
        order: 3,
        estimatedDuration: 45,
      },
      {
        title: 'The Blessed Birth',
        content: `# The Blessed Birth\n\n## Authenticated Accounts Only\n\nMonday, 12th Rabi' al-Awwal, Year of the Elephant...`,
        order: 4,
        estimatedDuration: 60,
      },
    ],
    quiz: {
      title: 'Module 1 Assessment: Pre-Prophethood',
      description: 'Test your knowledge of pre-Islamic Arabia and the Prophet\'s early life',
      timeLimit: 30,
      passingScore: 70,
      questions: [
        {
          questionText: 'According to authentic sources, what was the primary religion of pre-Islamic Arabs?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما كان الدين الرئيسي للعرب قبل الإسلام وفقًا للمصادر الموثوقة؟',
          explanation: 'While many Arabs practiced idol worship, they still acknowledged Allah as the Supreme God but had associated partners with Him.',
          points: 2,
          options: [
            { text: 'Pure idol worship with no concept of Allah', isCorrect: false },
            { text: 'Idol worship while acknowledging Allah as Supreme', isCorrect: true },
            { text: 'Christianity only', isCorrect: false },
            { text: 'Judaism only', isCorrect: false },
          ],
        },
        {
          questionText: 'Who were the Hunafa (Hanifs)?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'من هم الحنفاء؟',
          explanation: 'The Hunafa were Arabs who rejected idol worship and followed the monotheistic tradition of Ibrahim (AS).',
          points: 2,
          options: [
            { text: 'Christian monks living in Arabia', isCorrect: false },
            { text: 'Jewish rabbis in Medina', isCorrect: false },
            { text: 'Arabs following Ibrahim\'s monotheism', isCorrect: true },
            { text: 'Persian fire worshippers', isCorrect: false },
          ],
        },
        {
          questionText: 'The Prophet ﷺ was born in the Year of the Elephant.',
          questionType: 'TRUE_FALSE',
          arabicText: 'وُلد النبي ﷺ في عام الفيل',
          reference: 'Sealed Nectar, p. 63; Ibn Kathir Vol. 2',
          explanation: 'This is authentically established - the Prophet ﷺ was born approximately 50-55 days after the Event of the Elephant.',
          points: 1,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
        {
          questionText: 'Name three of the famous four Hunafa of Makkah mentioned by Al-Baghawi.',
          questionType: 'SHORT_ANSWER',
          arabicText: 'اذكر ثلاثة من الحنفاء الأربعة المشهورين في مكة كما ذكرهم البغوي',
          reference: 'Baghawi\'s Sharh as-Sunnah, Vol. 13',
          explanation: 'The four were: Waraqah ibn Nawfal, Uthman ibn al-Huwayrith, Ubaydullah ibn Jahsh, and Zayd ibn Amr ibn Nufayl.',
          points: 3,
          options: [],
        },
        {
          questionText: 'What was the name of the Prophet\'s ﷺ foster mother from Banu Sa\'d?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما اسم أم النبي ﷺ من الرضاعة من بني سعد؟',
          explanation: 'Halimah as-Sa\'diyyah from the tribe of Banu Sa\'d nursed the Prophet ﷺ in the desert.',
          points: 1,
          options: [
            { text: 'Halimah as-Sa\'diyyah', isCorrect: true },
            { text: 'Thuwaybah', isCorrect: false },
            { text: 'Umm Ayman', isCorrect: false },
            { text: 'Fatimah bint Asad', isCorrect: false },
          ],
        },
      ],
    },
  },
  {
    id: 'seerah-module-2',
    title: 'Module 2: Revelation & Early Prophethood',
    description: 'Study the first revelation, early converts, and the secret preaching phase with critical source analysis',
    subject: 'SEERAH',
    estimatedDuration: 420, // 7 hours
    chapters: [
      {
        title: 'Spiritual Preparation',
        content: `# Spiritual Preparation for Prophethood\n\n## The Cave of Hira\n\nThe Prophet's ﷺ seclusion and contemplation...`,
        order: 1,
        estimatedDuration: 60,
      },
      {
        title: 'The First Revelation',
        content: `# The Greatest Event - First Revelation\n\n## Authenticated Account from Multiple Sources\n\nRamadan, Cave Hira, Angel Jibril...`,
        order: 2,
        estimatedDuration: 90,
      },
      {
        title: 'Early Converts',
        content: `# The First Muslims\n\n## Order of Conversion\n\nKhadijah, Ali, Abu Bakr, Zayd...`,
        order: 3,
        estimatedDuration: 60,
      },
      {
        title: 'Secret Preaching Phase',
        content: `# Three Years of Secret Da\'wah\n\n## Building the Foundation\n\nDar al-Arqam and early community...`,
        order: 4,
        estimatedDuration: 60,
      },
    ],
    quiz: {
      title: 'Module 2 Assessment: Revelation & Early Islam',
      description: 'Evaluate your understanding of the revelation and early Islamic period',
      timeLimit: 35,
      passingScore: 75,
      questions: [
        {
          questionText: 'What were the first verses revealed to the Prophet ﷺ?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما هي الآيات الأولى التي نزلت على النبي ﷺ؟',
          reference: 'Sahih Bukhari #3; Sealed Nectar p. 70-75',
          explanation: 'The first revelation was the beginning of Surah Al-\'Alaq (96:1-5): "Read! In the Name of your Lord, Who created..."',
          points: 2,
          options: [
            { text: 'Surah Al-Fatihah', isCorrect: false },
            { text: 'Beginning of Surah Al-\'Alaq', isCorrect: true },
            { text: 'Surah Al-Muddaththir', isCorrect: false },
            { text: 'Surah Al-Ikhlas', isCorrect: false },
          ],
        },
        {
          questionText: 'According to Ibn Kathir, who was the first adult male to accept Islam?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'وفقًا لابن كثير، من كان أول رجل بالغ يدخل في الإسلام؟',
          reference: 'Ibn Kathir Vol. 3',
          explanation: 'Abu Bakr as-Siddiq was the first adult male to accept Islam without hesitation.',
          points: 2,
          options: [
            { text: 'Ali ibn Abi Talib', isCorrect: false },
            { text: 'Abu Bakr as-Siddiq', isCorrect: true },
            { text: 'Uthman ibn Affan', isCorrect: false },
            { text: 'Zayd ibn Harithah', isCorrect: false },
          ],
        },
        {
          questionText: 'The period of revelation pause (fatrah) lasted approximately how long?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'كم استمرت فترة انقطاع الوحي (الفترة) تقريبًا؟',
          reference: 'Various authentic narrations',
          explanation: 'Scholars differ on the exact duration, but the most common opinion is around 6 months to 2.5 years.',
          points: 2,
          options: [
            { text: '40 days', isCorrect: false },
            { text: '6 months to 2.5 years', isCorrect: true },
            { text: '3 years exactly', isCorrect: false },
            { text: '1 week', isCorrect: false },
          ],
        },
        {
          questionText: 'Waraqah ibn Nawfal confirmed the Prophet\'s ﷺ prophethood.',
          questionType: 'TRUE_FALSE',
          arabicText: 'أكد ورقة بن نوفل نبوة النبي ﷺ',
          reference: 'Sahih Bukhari; Sealed Nectar',
          explanation: 'Waraqah, who had knowledge of previous scriptures, confirmed that what the Prophet ﷺ experienced was the same angel that came to Musa (AS).',
          points: 1,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
        {
          questionText: 'Describe the physical experience during the first revelation as narrated in authentic sources.',
          questionType: 'SHORT_ANSWER',
          arabicText: 'صف التجربة الجسدية أثناء الوحي الأول كما روي في المصادر الموثوقة',
          reference: 'Sahih Bukhari #3',
          explanation: 'The angel Jibril pressed the Prophet ﷺ three times until he could hardly bear it, then commanded him to "Read!"',
          points: 3,
          options: [],
        },
      ],
    },
  },
  {
    id: 'seerah-module-3',
    title: 'Module 3: Persecution & Patience',
    description: 'Learn about the Meccan persecution, early Muslims\' steadfastness, and migration to Abyssinia',
    subject: 'SEERAH',
    estimatedDuration: 360,
    chapters: [
      {
        title: 'Public Declaration',
        content: `# Public Preaching Begins\n\n## Mount Safa Declaration\n\nThe Prophet's ﷺ public call to Islam...`,
        order: 1,
        estimatedDuration: 60,
      },
      {
        title: 'Meccan Persecution',
        content: `# Trials and Tribulations\n\n## Authenticated Accounts of Persecution\n\nBilal, Yasir family, and others...`,
        order: 2,
        estimatedDuration: 90,
      },
      {
        title: 'Migration to Abyssinia',
        content: `# The First Hijrah\n\n## Seeking Safety for Faith\n\nThe Najashi and Muslim refugees...`,
        order: 3,
        estimatedDuration: 75,
      },
      {
        title: 'The Boycott',
        content: `# Three Years of Hardship\n\n## Social and Economic Isolation\n\nThe boycott document and its end...`,
        order: 4,
        estimatedDuration: 60,
      },
    ],
    quiz: {
      title: 'Module 3 Assessment: Persecution Period',
      description: 'Test your knowledge of the Meccan persecution and early Muslims\' patience',
      timeLimit: 30,
      passingScore: 70,
      questions: [
        {
          questionText: 'Who was the first martyr in Islam?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'من كان أول شهيد في الإسلام؟',
          reference: 'Ibn Kathir; Sealed Nectar',
          explanation: 'Sumayyah bint Khayyat, mother of Ammar ibn Yasir, was the first martyr in Islam, killed by Abu Jahl.',
          points: 2,
          options: [
            { text: 'Yasir ibn Amir', isCorrect: false },
            { text: 'Sumayyah bint Khayyat', isCorrect: true },
            { text: 'Bilal ibn Rabah', isCorrect: false },
            { text: 'Khabbab ibn al-Aratt', isCorrect: false },
          ],
        },
        {
          questionText: 'What phrase did Bilal repeat under torture?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما العبارة التي كان بلال يرددها تحت التعذيب؟',
          reference: 'Multiple authentic sources',
          explanation: 'Bilal would repeat "Ahad, Ahad" (One, One) affirming Allah\'s oneness despite severe torture.',
          points: 2,
          options: [
            { text: 'La ilaha illa Allah', isCorrect: false },
            { text: 'Ahad, Ahad', isCorrect: true },
            { text: 'Allahu Akbar', isCorrect: false },
            { text: 'Subhan Allah', isCorrect: false },
          ],
        },
        {
          questionText: 'The Najashi of Abyssinia protected the Muslim refugees.',
          questionType: 'TRUE_FALSE',
          arabicText: 'حمى النجاشي ملك الحبشة اللاجئين المسلمين',
          reference: 'All three primary sources',
          explanation: 'The Najashi (Negus) gave protection to Muslim refugees and refused Quraysh\'s bribes to return them.',
          points: 1,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
        {
          questionText: 'How long did the social and economic boycott last?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'كم استمرت المقاطعة الاجتماعية والاقتصادية؟',
          reference: 'Sealed Nectar p. 125',
          explanation: 'The boycott lasted approximately three years, causing severe hardship for Banu Hashim and Banu Muttalib.',
          points: 2,
          options: [
            { text: 'One year', isCorrect: false },
            { text: 'Two years', isCorrect: false },
            { text: 'Three years', isCorrect: true },
            { text: 'Five years', isCorrect: false },
          ],
        },
      ],
    },
  },
  {
    id: 'seerah-module-4',
    title: 'Module 4: Isra wal-Mi\'raj & Hijrah',
    description: 'Study the Night Journey, preparation for migration, and the historic Hijrah to Madinah',
    subject: 'SEERAH',
    estimatedDuration: 420,
    chapters: [
      {
        title: 'The Night Journey',
        content: `# Isra wal-Mi'raj\n\n## Physical and Spiritual Journey\n\nFrom Makkah to Jerusalem to the Heavens...`,
        order: 1,
        estimatedDuration: 90,
      },
      {
        title: 'Pledges of Aqabah',
        content: `# The Aqabah Pledges\n\n## Foundation for Hijrah\n\nFirst and Second Pledges...`,
        order: 2,
        estimatedDuration: 75,
      },
      {
        title: 'The Hijrah Journey',
        content: `# The Historic Migration\n\n## Detailed Account with Maps\n\nPlanning, route, miracles...`,
        order: 3,
        estimatedDuration: 90,
      },
      {
        title: 'Arrival in Madinah',
        content: `# Welcome to Yathrib\n\n## Building the Islamic State\n\nFirst actions and foundations...`,
        order: 4,
        estimatedDuration: 75,
      },
    ],
    quiz: {
      title: 'Module 4 Assessment: Night Journey & Migration',
      description: 'Evaluate your understanding of Isra wal-Mi\'raj and the Hijrah',
      timeLimit: 35,
      passingScore: 75,
      questions: [
        {
          questionText: 'What was established during the Mi\'raj as an obligation?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما الذي فُرض خلال المعراج؟',
          reference: 'All authentic sources',
          explanation: 'The five daily prayers were made obligatory during the Mi\'raj, initially as 50 then reduced to 5.',
          points: 2,
          options: [
            { text: 'Fasting', isCorrect: false },
            { text: 'Five daily prayers', isCorrect: true },
            { text: 'Zakat', isCorrect: false },
            { text: 'Hajj', isCorrect: false },
          ],
        },
        {
          questionText: 'Who was the Prophet\'s ﷺ companion in the cave during Hijrah?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'من كان رفيق النبي ﷺ في الغار أثناء الهجرة؟',
          reference: 'Quran 9:40; All sources',
          explanation: 'Abu Bakr as-Siddiq accompanied the Prophet ﷺ in the cave of Thawr during the Hijrah.',
          points: 1,
          options: [
            { text: 'Umar ibn al-Khattab', isCorrect: false },
            { text: 'Abu Bakr as-Siddiq', isCorrect: true },
            { text: 'Ali ibn Abi Talib', isCorrect: false },
            { text: 'Uthman ibn Affan', isCorrect: false },
          ],
        },
        {
          questionText: 'The Islamic calendar begins from the year of Hijrah.',
          questionType: 'TRUE_FALSE',
          arabicText: 'يبدأ التقويم الإسلامي من عام الهجرة',
          reference: 'Historical consensus',
          explanation: 'The Hijri calendar was established by Umar ibn al-Khattab, marking the Hijrah as year 1.',
          points: 1,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
        {
          questionText: 'Name the guide who helped during the Hijrah journey.',
          questionType: 'SHORT_ANSWER',
          arabicText: 'اذكر اسم الدليل الذي ساعد في رحلة الهجرة',
          reference: 'Sealed Nectar; Ibn Kathir',
          explanation: 'Abdullah ibn Urayqit was the skilled guide hired to lead them through the desert routes.',
          points: 2,
          options: [],
        },
      ],
    },
  },
  {
    id: 'seerah-module-5',
    title: 'Module 5: Medinan Foundation',
    description: 'Explore the establishment of the Islamic state, Constitution of Medina, and early challenges',
    subject: 'SEERAH',
    estimatedDuration: 360,
    chapters: [
      {
        title: 'Building the Mosque',
        content: `# The Prophet's Mosque\n\n## Center of the Islamic State\n\nConstruction and significance...`,
        order: 1,
        estimatedDuration: 60,
      },
      {
        title: 'Brotherhood System',
        content: `# Al-Mu'akhat\n\n## Unprecedented Social Integration\n\nPairing Muhajirun and Ansar...`,
        order: 2,
        estimatedDuration: 75,
      },
      {
        title: 'Constitution of Medina',
        content: `# The First Written Constitution\n\n## Pluralistic Governance Document\n\nRights and responsibilities...`,
        order: 3,
        estimatedDuration: 90,
      },
      {
        title: 'Early Expeditions',
        content: `# Establishing Security\n\n## Strategic Positioning\n\nSaraya and early campaigns...`,
        order: 4,
        estimatedDuration: 60,
      },
    ],
    quiz: {
      title: 'Module 5 Assessment: Medinan Foundation',
      description: 'Test your knowledge of the early Medinan period',
      timeLimit: 30,
      passingScore: 70,
      questions: [
        {
          questionText: 'What was the first action upon arrival in Quba?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما كان أول عمل عند الوصول إلى قباء؟',
          reference: 'Ibn Kathir; Sealed Nectar',
          explanation: 'The Prophet ﷺ built the first mosque in Islam at Quba before entering Medina proper.',
          points: 2,
          options: [
            { text: 'Established the market', isCorrect: false },
            { text: 'Built Masjid Quba', isCorrect: true },
            { text: 'Wrote the Constitution', isCorrect: false },
            { text: 'Paired the brothers', isCorrect: false },
          ],
        },
        {
          questionText: 'The Constitution of Medina included provisions for Jewish tribes.',
          questionType: 'TRUE_FALSE',
          arabicText: 'تضمن دستور المدينة أحكامًا للقبائل اليهودية',
          reference: 'Authentic historical documents',
          explanation: 'The Constitution included detailed provisions for Jewish tribes as part of the Medinan community.',
          points: 1,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
        {
          questionText: 'What was the significance of the brotherhood (Mu\'akhat) system?',
          questionType: 'SHORT_ANSWER',
          arabicText: 'ما أهمية نظام المؤاخاة؟',
          reference: 'All primary sources',
          explanation: 'It created unprecedented social bonds, with Ansar sharing inheritance with Muhajirun initially.',
          points: 3,
          options: [],
        },
      ],
    },
  },
  {
    id: 'seerah-module-6',
    title: 'Module 6: Major Battles',
    description: 'Detailed study of Badr, Uhud, and Khandaq with authenticated accounts and lessons',
    subject: 'SEERAH',
    estimatedDuration: 480,
    chapters: [
      {
        title: 'Battle of Badr',
        content: `# The Day of Criterion\n\n## First Major Victory\n\n313 vs 1000, Divine assistance...`,
        order: 1,
        estimatedDuration: 120,
      },
      {
        title: 'Battle of Uhud',
        content: `# The Test of Obedience\n\n## Lessons from Temporary Setback\n\nArchers' mistake, Prophet's injury...`,
        order: 2,
        estimatedDuration: 120,
      },
      {
        title: 'Battle of the Trench',
        content: `# Al-Khandaq\n\n## Strategic Defense Innovation\n\nSiege warfare and divine victory...`,
        order: 3,
        estimatedDuration: 120,
      },
      {
        title: 'Lessons and Analysis',
        content: `# Military and Spiritual Lessons\n\n## Comprehensive Analysis\n\nStrategic evolution...`,
        order: 4,
        estimatedDuration: 60,
      },
    ],
    quiz: {
      title: 'Module 6 Assessment: Major Battles',
      description: 'Evaluate your understanding of the major battles',
      timeLimit: 40,
      passingScore: 75,
      questions: [
        {
          questionText: 'How many Muslims fought at Badr according to authentic sources?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'كم عدد المسلمين الذين قاتلوا في بدر وفقًا للمصادر الموثوقة؟',
          reference: 'Ibn Kathir Vol. 3, p. 310-315',
          explanation: 'The most authentic number is 313, matching the number of Talut\'s companions.',
          points: 2,
          options: [
            { text: '300', isCorrect: false },
            { text: '313', isCorrect: true },
            { text: '350', isCorrect: false },
            { text: '400', isCorrect: false },
          ],
        },
        {
          questionText: 'What was the main cause of setback at Uhud?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما السبب الرئيسي للنكسة في أحد؟',
          reference: 'All sources agree',
          explanation: 'The archers left their positions seeking booty, allowing Khalid ibn Walid to attack from behind.',
          points: 2,
          options: [
            { text: 'Lack of weapons', isCorrect: false },
            { text: 'Archers leaving their posts', isCorrect: true },
            { text: 'Too few soldiers', isCorrect: false },
            { text: 'Poor planning', isCorrect: false },
          ],
        },
        {
          questionText: 'Who suggested digging the trench at Khandaq?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'من اقترح حفر الخندق في غزوة الخندق؟',
          reference: 'Sealed Nectar; Ibn Kathir',
          explanation: 'Salman al-Farisi suggested the Persian defensive tactic of digging a trench.',
          points: 2,
          options: [
            { text: 'Umar ibn al-Khattab', isCorrect: false },
            { text: 'Sa\'d ibn Mu\'adh', isCorrect: false },
            { text: 'Salman al-Farisi', isCorrect: true },
            { text: 'Abu Bakr as-Siddiq', isCorrect: false },
          ],
        },
        {
          questionText: 'Angels participated in the Battle of Badr.',
          questionType: 'TRUE_FALSE',
          arabicText: 'شارك الملائكة في غزوة بدر',
          reference: 'Quran 8:9-12; All sources',
          explanation: 'The Quran confirms angelic participation, and companions reported seeing their effects.',
          points: 1,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
      ],
    },
  },
  {
    id: 'seerah-module-7',
    title: 'Module 7: Treaties & Conquest',
    description: 'Study Hudaybiyyah Treaty, letters to rulers, and the Conquest of Makkah',
    subject: 'SEERAH',
    estimatedDuration: 420,
    chapters: [
      {
        title: 'Treaty of Hudaybiyyah',
        content: `# The Clear Victory\n\n## Strategic Diplomacy\n\nApparent compromise, actual victory...`,
        order: 1,
        estimatedDuration: 90,
      },
      {
        title: 'Letters to Rulers',
        content: `# International Outreach\n\n## Calling World Leaders\n\nHeraclius, Chosroes, Najashi...`,
        order: 2,
        estimatedDuration: 75,
      },
      {
        title: 'Conquest of Makkah',
        content: `# The Greatest Conquest\n\n## Mercy and Forgiveness\n\n10,000 enter peacefully...`,
        order: 3,
        estimatedDuration: 120,
      },
      {
        title: 'Post-Conquest Events',
        content: `# Hunayn and Ta'if\n\n## Final Major Campaigns\n\nTests after victory...`,
        order: 4,
        estimatedDuration: 75,
      },
    ],
    quiz: {
      title: 'Module 7 Assessment: Treaties & Conquest',
      description: 'Test your knowledge of diplomacy and the conquest period',
      timeLimit: 35,
      passingScore: 75,
      questions: [
        {
          questionText: 'What did Umar initially think about the Treaty of Hudaybiyyah?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما كان رأي عمر الأولي في صلح الحديبية؟',
          reference: 'Bukhari #2731',
          explanation: 'Umar initially questioned the terms, thinking them unfavorable, but later regretted his reaction.',
          points: 2,
          options: [
            { text: 'Fully supported it immediately', isCorrect: false },
            { text: 'Questioned its terms initially', isCorrect: true },
            { text: 'Suggested better terms', isCorrect: false },
            { text: 'Remained neutral', isCorrect: false },
          ],
        },
        {
          questionText: 'What did the Prophet ﷺ say at the Conquest of Makkah?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ماذا قال النبي ﷺ عند فتح مكة؟',
          reference: 'All sources',
          explanation: 'He declared general amnesty saying "Go, for you are freed" (Idhhabu fa-antum at-tulaqa).',
          points: 2,
          options: [
            { text: '"Today is a day of revenge"', isCorrect: false },
            { text: '"Go, for you are freed"', isCorrect: true },
            { text: '"Leave Makkah immediately"', isCorrect: false },
            { text: '"Convert or face punishment"', isCorrect: false },
          ],
        },
        {
          questionText: 'The Treaty of Hudaybiyyah was called "Fath Mubin" (Clear Victory) in the Quran.',
          questionType: 'TRUE_FALSE',
          arabicText: 'سُمي صلح الحديبية "فتحًا مبينًا" في القرآن',
          reference: 'Quran 48:1',
          explanation: 'Allah revealed Surah Al-Fath calling the treaty a clear victory despite apparent compromises.',
          points: 1,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
      ],
    },
  },
  {
    id: 'seerah-module-8',
    title: 'Module 8: Final Years & Legacy',
    description: 'The Farewell Pilgrimage, final teachings, passing, and lasting legacy',
    subject: 'SEERAH',
    estimatedDuration: 360,
    chapters: [
      {
        title: 'Year of Delegations',
        content: `# Wafd - The Delegations\n\n## Arabia Embraces Islam\n\nTribal conversions en masse...`,
        order: 1,
        estimatedDuration: 75,
      },
      {
        title: 'Farewell Pilgrimage',
        content: `# Hajjat al-Wada\n\n## The Complete Message\n\nFinal sermon and universal principles...`,
        order: 2,
        estimatedDuration: 90,
      },
      {
        title: 'Final Illness',
        content: `# The Last Days\n\n## Preparing the Ummah\n\nFinal guidance and instructions...`,
        order: 3,
        estimatedDuration: 75,
      },
      {
        title: 'Legacy and Impact',
        content: `# The Eternal Legacy\n\n## Transformation of Humanity\n\n23 years that changed the world...`,
        order: 4,
        estimatedDuration: 60,
      },
    ],
    quiz: {
      title: 'Module 8 Final Assessment: Completion of the Message',
      description: 'Comprehensive assessment of the final period and legacy',
      timeLimit: 40,
      passingScore: 80,
      questions: [
        {
          questionText: 'What key principle was emphasized in the Farewell Sermon?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما المبدأ الأساسي الذي تم التأكيد عليه في خطبة الوداع؟',
          reference: 'All sources',
          explanation: 'The Prophet ﷺ emphasized that no Arab has superiority over non-Arab except by taqwa (piety).',
          points: 2,
          options: [
            { text: 'Arab superiority', isCorrect: false },
            { text: 'Equality except by piety', isCorrect: true },
            { text: 'Tribal hierarchy', isCorrect: false },
            { text: 'Wealth distribution', isCorrect: false },
          ],
        },
        {
          questionText: 'What were the Prophet\'s ﷺ last words?',
          questionType: 'MULTIPLE_CHOICE',
          arabicText: 'ما كانت آخر كلمات النبي ﷺ؟',
          reference: 'Authentic narrations',
          explanation: 'His last words were "Allahumma ar-Rafiq al-A\'la" (O Allah, the Highest Companion).',
          points: 2,
          options: [
            { text: '"Take care of prayer"', isCorrect: false },
            { text: '"O Allah, the Highest Companion"', isCorrect: true },
            { text: '"Follow my Sunnah"', isCorrect: false },
            { text: '"Unity of the Ummah"', isCorrect: false },
          ],
        },
        {
          questionText: 'The Prophet ﷺ passed away on Monday, 12th Rabi\' al-Awwal.',
          questionType: 'TRUE_FALSE',
          arabicText: 'توفي النبي ﷺ يوم الاثنين 12 ربيع الأول',
          reference: 'Majority opinion',
          explanation: 'This is the majority opinion among scholars, in the 11th year after Hijrah.',
          points: 1,
          options: [
            { text: 'True', isCorrect: true },
            { text: 'False', isCorrect: false },
          ],
        },
        {
          questionText: 'What did the Prophet ﷺ leave for the Ummah according to the Farewell Sermon?',
          questionType: 'SHORT_ANSWER',
          arabicText: 'ماذا ترك النبي ﷺ للأمة وفقًا لخطبة الوداع؟',
          reference: 'Authenticated narrations',
          explanation: 'He left the Book of Allah (Quran), and in some narrations, also his Sunnah.',
          points: 3,
          options: [],
        },
      ],
    },
  },
];

// Create the main Seerah Learning Path
export const seerahLearningPath = {
  title: 'Complete Seerah Curriculum - Authentic Sources',
  description: 'Comprehensive study of the Prophet\'s ﷺ biography based on The Sealed Nectar, Ibn Kathir, and Al-Baghawi',
  subject: 'SEERAH',
  ageTier: 'ALL_AGES', // Will create age-specific versions
  difficultyLevel: 'INTERMEDIATE',
  estimatedDuration: 60, // 60 hours total
  isPublished: true,
};

// Age-specific adaptations
export const ageTierAdaptations = {
  CHILDREN: {
    modifications: 'Simplified stories, focus on character, visual aids, shorter sessions',
    excludeTopics: ['Complex battles', 'Death details', 'Political intrigue'],
  },
  YOUTH: {
    modifications: 'Interactive discussions, contemporary connections, critical thinking',
    additionalTopics: ['Leadership lessons', 'Character development', 'Dealing with challenges'],
  },
  ADULTS: {
    modifications: 'Full scholarly approach, source criticism, contemporary application',
    additionalTopics: ['Jurisprudential derivations', 'Political wisdom', 'Economic principles'],
  },
  SENIORS: {
    modifications: 'Reflective approach, wisdom extraction, legacy focus',
    additionalTopics: ['Spiritual lessons', 'Preparing for akhirah', 'Community building'],
  },
};

// Achievements for Seerah study
export const seerahAchievements = [
  {
    title: 'Seerah Scholar',
    description: 'Complete all 8 Seerah modules',
    icon: '📚',
    criteriaType: 'COMPLETION',
    criteriaValue: 8,
    subject: 'SEERAH',
    points: 100,
    isRare: true,
  },
  {
    title: 'Quiz Master',
    description: 'Score 90% or higher on all module quizzes',
    icon: '🏆',
    criteriaType: 'SCORE',
    criteriaValue: 90,
    subject: 'SEERAH',
    points: 50,
    isRare: false,
  },
  {
    title: 'Consistent Learner',
    description: 'Study Seerah for 30 consecutive days',
    icon: '🔥',
    criteriaType: 'STREAK',
    criteriaValue: 30,
    subject: 'SEERAH',
    points: 75,
    isRare: true,
  },
  {
    title: 'First Step',
    description: 'Complete your first Seerah module',
    icon: '👣',
    criteriaType: 'COMPLETION',
    criteriaValue: 1,
    subject: 'SEERAH',
    points: 10,
    isRare: false,
  },
  {
    title: 'Knowledge Seeker',
    description: 'Spend 10 hours studying Seerah',
    icon: '⏰',
    criteriaType: 'TIME_SPENT',
    criteriaValue: 600, // in minutes
    subject: 'SEERAH',
    points: 25,
    isRare: false,
  },
];

// Helper function to create quiz questions with proper structure
export function createQuizQuestions(questions: any[]) {
  return questions.map((q, index) => ({
    ...q,
    order: index + 1,
    options: q.options.map((opt: any, optIndex: number) => ({
      ...opt,
      order: optIndex + 1,
    })),
  }));
}

// Seed function
export async function seedSeerahCurriculum() {
  console.log('🌱 Seeding Seerah Curriculum...');

  try {
    // First, get or create the system/admin user
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@attaqwa.org',
          password: 'hashed_password_here', // Should be properly hashed
          name: 'System Admin',
          role: 'ADMIN',
          ageTier: 'ADULTS',
        },
      });
    }

    // Create the main learning path
    const learningPath = await prisma.learningPath.create({
      data: {
        ...seerahLearningPath,
        authorId: adminUser.id,
      },
    });

    // Create each module with chapters and quizzes
    for (const [index, module] of seerahModules.entries()) {
      console.log(`📖 Creating Module ${index + 1}: ${module.title}`);

      // Create the education content (module)
      const educationContent = await prisma.educationContent.create({
        data: {
          title: module.title,
          description: module.description,
          content: `# ${module.title}\n\n${module.description}`,
          contentType: 'LESSON',
          subject: 'SEERAH',
          ageTier: 'ALL_AGES',
          difficultyLevel: 'INTERMEDIATE',
          estimatedDuration: module.estimatedDuration,
          prerequisites: index > 0 ? [seerahModules[index - 1].id] : [],
          tags: ['seerah', 'biography', 'prophet', 'authentic'],
          isPublished: true,
          authorId: adminUser.id,
        },
      });

      // Create chapters for the module
      for (const chapter of module.chapters) {
        await prisma.chapter.create({
          data: {
            contentId: educationContent.id,
            ...chapter,
          },
        });
      }

      // Create the quiz for the module
      const quiz = await prisma.quiz.create({
        data: {
          contentId: educationContent.id,
          title: module.quiz.title,
          description: module.quiz.description,
          timeLimit: module.quiz.timeLimit,
          passingScore: module.quiz.passingScore,
          maxAttempts: 3,
          showCorrectAnswers: true,
          shuffleQuestions: true,
          isActive: true,
        },
      });

      // Create quiz questions with options
      for (const [qIndex, question] of module.quiz.questions.entries()) {
        const quizQuestion = await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: question.questionText,
            questionType: question.questionType as any,
            arabicText: question.arabicText,
            reference: question.reference,
            explanation: question.explanation,
            points: question.points,
            order: qIndex + 1,
          },
        });

        // Create options for multiple choice and true/false questions
        if (question.options && question.options.length > 0) {
          for (const [optIndex, option] of question.options.entries()) {
            await prisma.questionOption.create({
              data: {
                questionId: quizQuestion.id,
                text: option.text,
                isCorrect: option.isCorrect,
                order: optIndex + 1,
              },
            });
          }
        }
      }

      // Add module to learning path
      await prisma.learningPathItem.create({
        data: {
          pathId: learningPath.id,
          contentId: educationContent.id,
          order: index + 1,
          isRequired: true,
        },
      });
    }

    // Create achievements
    console.log('🏆 Creating achievements...');
    for (const achievement of seerahAchievements) {
      await prisma.achievement.create({
        data: achievement as any,
      });
    }

    console.log('✅ Seerah curriculum seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding Seerah curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedSeerahCurriculum()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}