import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { z } from 'zod';
import { PrismaClient, AgeTier, IslamicSubject, DifficultyLevel } from '@attaqwa/db';

// JWT middleware with proper secret
const jwtAuth = jwt({ secret: process.env.JWT_SECRET || 'default-jwt-secret' });

const prisma = new PrismaClient();
const islamicEducationCalendar = new Hono();

// Islamic Calendar Integration Schema
const IslamicCalendarSchema = z.object({
  hijriMonth: z.number().min(1).max(12).optional(),
  hijriYear: z.number().min(1400).max(1500).optional(),
  islamicEvent: z.enum([
    'RAMADAN', 'EID_FITR', 'EID_ADHA', 'HAJJ', 'ASHURA', 'MAWLID',
    'LAYLAT_AL_QADR', 'ISRA_MIRAJ', 'RAJAB', 'SHABAN', 'DHU_AL_HIJJAH'
  ]).optional(),
  seasonalTopic: z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL']).optional(),
  ageTier: z.nativeEnum(AgeTier).optional(),
  language: z.enum(['en', 'ar', 'bilingual']).default('en'),
  limit: z.number().min(1).max(50).default(20)
});

// Islamic Calendar Event Mapping
const ISLAMIC_CALENDAR_EVENTS = {
  1: { // Muharram
    events: ['ASHURA', 'NEW_HIJRI_YEAR'],
    topics: ['history', 'sacrifice', 'new_beginnings'],
    specialContent: 'battle_of_karbala'
  },
  2: { // Safar
    events: [],
    topics: ['patience', 'perseverance', 'community'],
    specialContent: 'prophetic_stories'
  },
  3: { // Rabi al-Awwal
    events: ['MAWLID'],
    topics: ['prophet_muhammad', 'seerah', 'love_prophet'],
    specialContent: 'prophetic_biography'
  },
  7: { // Rajab
    events: ['ISRA_MIRAJ'],
    topics: ['spirituality', 'prayer', 'ascension'],
    specialContent: 'night_journey'
  },
  8: { // Shaban
    events: [],
    topics: ['preparation', 'forgiveness', 'charity'],
    specialContent: 'ramadan_preparation'
  },
  9: { // Ramadan
    events: ['RAMADAN', 'LAYLAT_AL_QADR'],
    topics: ['fasting', 'quran', 'charity', 'spirituality'],
    specialContent: 'ramadan_comprehensive'
  },
  10: { // Shawwal
    events: ['EID_FITR'],
    topics: ['celebration', 'gratitude', 'community'],
    specialContent: 'eid_celebrations'
  },
  12: { // Dhu al-Hijjah
    events: ['HAJJ', 'EID_ADHA'],
    topics: ['pilgrimage', 'sacrifice', 'unity'],
    specialContent: 'hajj_pilgrimage'
  }
} as const;

// Age-appropriate content mapping for Islamic events
const AGE_APPROPRIATE_CONTENT = {
  PRESCHOOL: {
    topics: ['allah_love', 'prophet_kindness', 'sharing', 'family'],
    complexity: 'very_simple',
    activities: ['coloring', 'songs', 'simple_stories']
  },
  ELEMENTARY: {
    topics: ['five_pillars', 'prophet_stories', 'quran_verses', 'good_manners'],
    complexity: 'simple',
    activities: ['crafts', 'games', 'memorization', 'drawing']
  },
  MIDDLE_SCHOOL: {
    topics: ['islamic_history', 'companions', 'quran_tafsir', 'hadith'],
    complexity: 'intermediate',
    activities: ['research', 'presentations', 'debates', 'community_service']
  },
  HIGH_SCHOOL: {
    topics: ['islamic_philosophy', 'comparative_religion', 'islamic_law', 'contemporary_issues'],
    complexity: 'advanced',
    activities: ['essays', 'leadership', 'volunteering', 'interfaith_dialogue']
  },
  COLLEGE: {
    topics: ['islamic_scholarship', 'theology', 'ethics', 'social_justice'],
    complexity: 'university',
    activities: ['research_papers', 'symposiums', 'mentoring', 'activism']
  },
  ADULTS: {
    topics: ['parenting_islam', 'marriage_islam', 'career_ethics', 'community_leadership'],
    complexity: 'practical',
    activities: ['workshops', 'seminars', 'study_circles', 'mentoring']
  },
  SENIORS: {
    topics: ['wisdom_sharing', 'legacy_building', 'spiritual_reflection', 'grandparent_guidance'],
    complexity: 'reflective',
    activities: ['storytelling', 'mentoring', 'volunteering', 'spiritual_guidance']
  }
} as const;

// Get current Hijri date (simplified calculation)
function getCurrentHijriDate() {
  const gregorianDate = new Date();
  // Approximate Hijri calculation - in production, use proper Islamic calendar library
  const hijriEpoch = new Date('622-07-16');
  const daysSinceEpoch = Math.floor((gregorianDate.getTime() - hijriEpoch.getTime()) / (1000 * 60 * 60 * 24));
  const hijriYear = Math.floor(daysSinceEpoch / 354.37) + 1; // Islamic year is ~354.37 days
  const hijriMonth = Math.floor((daysSinceEpoch % 354.37) / 29.53) + 1; // Islamic month is ~29.53 days
  
  return {
    year: Math.max(1400, Math.min(1500, hijriYear)),
    month: Math.max(1, Math.min(12, hijriMonth))
  };
}

// Get educational content based on Islamic calendar
islamicEducationCalendar.get('/calendar-content', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const query = IslamicCalendarSchema.parse(c.req.query());
    
    // Get current Hijri date if not provided
    const currentHijri = getCurrentHijriDate();
    const hijriMonth = query.hijriMonth || currentHijri.month;
    const hijriYear = query.hijriYear || currentHijri.year;
    
    // Get user profile for age-appropriate content
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ageTier: true, birthDate: true, preferredLanguage: true }
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const userAgeTier = query.ageTier || user.ageTier || 'ALL_AGES' as AgeTier;
    const calendarInfo = ISLAMIC_CALENDAR_EVENTS[hijriMonth as keyof typeof ISLAMIC_CALENDAR_EVENTS];
    const ageContent = AGE_APPROPRIATE_CONTENT[userAgeTier as keyof typeof AGE_APPROPRIATE_CONTENT];
    
    // Build content query based on Islamic calendar
    const whereClause: any = {
      isPublished: true,
      AND: []
    };
    
    // Filter by age tier
    if (userAgeTier !== 'ALL_AGES') {
      whereClause.AND.push({
        OR: [
          { ageTier: userAgeTier },
          { ageTier: 'ALL_AGES' }
        ]
      });
    }
    
    // Filter by Islamic calendar topics
    if (calendarInfo) {
      const islamicTopics = calendarInfo.topics.map(topic => topic.toUpperCase());
      whereClause.AND.push({
        OR: [
          { subject: { in: islamicTopics.filter(topic => 
            Object.values(IslamicSubject).includes(topic as IslamicSubject)
          ) } },
          { tags: { hasAny: islamicTopics } },
          { keywords: { hasAny: calendarInfo.events.map(e => e.toLowerCase()) } }
        ]
      });
    }
    
    // Filter by Islamic event if specified
    if (query.islamicEvent) {
      whereClause.AND.push({
        OR: [
          { tags: { has: query.islamicEvent.toLowerCase() } },
          { keywords: { has: query.islamicEvent.toLowerCase() } },
          { title: { contains: query.islamicEvent.replace('_', ' '), mode: 'insensitive' } }
        ]
      });
    }
    
    // Language filtering
    if (query.language === 'ar') {
      whereClause.arabicContent = { not: null };
    } else if (query.language === 'bilingual') {
      whereClause.AND.push({
        arabicContent: { not: null },
        content: { not: null }
      });
    }
    
    // Fetch calendar-based educational content
    const content = await prisma.educationContent.findMany({
      where: whereClause,
      include: {
        userProgress: {
          where: { userId },
          select: {
            progress: true,
            status: true,
            lastAccessed: true
          }
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            isPublished: true
          },
          where: { isPublished: true }
        }
      },
      orderBy: [
        { priority: 'desc' }, // Seasonal content gets higher priority
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: query.limit
    });
    
    // Get upcoming Islamic events for next 30 days
    const upcomingEvents = await prisma.islamicEvent.findMany({
      where: {
        eventDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        },
        isActive: true
      },
      orderBy: { eventDate: 'asc' },
      take: 10
    });
    
    // Create educational calendar recommendations
    const calendarRecommendations = {
      currentMonth: {
        hijriMonth,
        hijriYear,
        gregorianDate: new Date(),
        monthName: getHijriMonthName(hijriMonth),
        significance: calendarInfo?.specialContent || 'general_islamic_education'
      },
      recommendedTopics: ageContent?.topics || [],
      suggestedActivities: ageContent?.activities || [],
      upcomingEvents: upcomingEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: event.eventDate,
        hijriDate: event.hijriDate,
        description: event.description,
        ageTier: event.ageTier
      })),
      seasonalFocus: calendarInfo?.events || [],
      educationalGoals: generateEducationalGoals(userAgeTier, hijriMonth)
    };
    
    // Transform content for calendar context
    const transformedContent = content.map(item => ({
      ...item,
      calendarRelevance: {
        isSeasonallyRelevant: checkSeasonalRelevance(item, hijriMonth),
        islamicEventConnection: findEventConnection(item, calendarInfo?.events || []),
        urgency: calculateUrgency(item, hijriMonth, calendarInfo?.events || [])
      },
      ageAppropriate: {
        complexity: ageContent?.complexity || 'general',
        recommendedActivities: ageContent?.activities || [],
        learningObjectives: generateLearningObjectives(item.subject, userAgeTier)
      },
      progress: item.userProgress[0]?.progress || 0,
      status: item.userProgress[0]?.status || 'NOT_STARTED',
      lastAccessed: item.userProgress[0]?.lastAccessed
    }));
    
    return c.json({
      calendar: calendarRecommendations,
      content: transformedContent,
      metadata: {
        totalContent: content.length,
        hasMoreContent: content.length === query.limit,
        generatedAt: new Date(),
        userAgeTier,
        currentHijriDate: { month: hijriMonth, year: hijriYear }
      }
    });
    
  } catch (error) {
    console.error('Error fetching Islamic calendar content:', error);
    return c.json({ error: 'Failed to fetch calendar-based content' }, 500);
  }
});

// Get Islamic calendar events for a specific month
islamicEducationCalendar.get('/events/:month/:year', jwtAuth, async (c) => {
  try {
    const month = parseInt(c.req.param('month'));
    const year = parseInt(c.req.param('year'));
    const userId = c.get('jwtPayload').sub;
    
    if (month < 1 || month > 12 || year < 1400 || year > 1500) {
      return c.json({ error: 'Invalid Hijri date' }, 400);
    }
    
    // Get user for age-appropriate filtering
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ageTier: true }
    });
    
    const userAgeTier = user?.ageTier || 'ALL_AGES' as AgeTier;
    
    // Get Islamic events for the month
    const events = await prisma.islamicEvent.findMany({
      where: {
        hijriMonth: month,
        hijriYear: year,
        isActive: true,
        OR: [
          { ageTier: userAgeTier },
          { ageTier: 'ALL_AGES' }
        ]
      },
      orderBy: { hijriDay: 'asc' }
    });
    
    // Get educational content related to this month
    const calendarInfo = ISLAMIC_CALENDAR_EVENTS[month as keyof typeof ISLAMIC_CALENDAR_EVENTS];
    const relatedContent = await prisma.educationContent.findMany({
      where: {
        isPublished: true,
        OR: [
          { tags: { hasAny: calendarInfo?.events.map(e => e.toLowerCase()) || [] } },
          { keywords: { hasAny: calendarInfo?.topics || [] } }
        ],
        ageTier: { in: [userAgeTier, 'ALL_AGES'] }
      },
      select: {
        id: true,
        title: true,
        subject: true,
        contentType: true,
        description: true
      },
      take: 10
    });
    
    return c.json({
      month: {
        hijriMonth: month,
        hijriYear: year,
        name: getHijriMonthName(month),
        significance: calendarInfo?.specialContent || 'general_month'
      },
      events,
      relatedEducationalContent: relatedContent,
      monthlyFocus: {
        topics: calendarInfo?.topics || [],
        events: calendarInfo?.events || [],
        educationalPriorities: generateMonthlyEducationalPriorities(month, userAgeTier)
      }
    });
    
  } catch (error) {
    console.error('Error fetching Islamic calendar events:', error);
    return c.json({ error: 'Failed to fetch calendar events' }, 500);
  }
});

// Create educational plan based on Islamic calendar
islamicEducationCalendar.post('/create-learning-plan', jwtAuth, async (c) => {
  try {
    const userId = c.get('jwtPayload').sub;
    const body = await c.req.json();
    
    const schema = z.object({
      startMonth: z.number().min(1).max(12),
      startYear: z.number().min(1400).max(1500),
      duration: z.number().min(1).max(12), // months
      focusAreas: z.array(z.nativeEnum(IslamicSubject)),
      intensity: z.enum(['light', 'moderate', 'intensive']).default('moderate')
    });
    
    const data = schema.parse(body);
    
    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ageTier: true, name: true }
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Generate learning plan based on Islamic calendar
    const learningPlan = await generateIslamicLearningPlan({
      userId,
      userAgeTier: user.ageTier || 'ALL_AGES' as AgeTier,
      startMonth: data.startMonth,
      startYear: data.startYear,
      duration: data.duration,
      focusAreas: data.focusAreas,
      intensity: data.intensity
    });
    
    // Save learning plan to database
    const savedPlan = await prisma.learningPlan.create({
      data: {
        userId,
        title: `Islamic Learning Plan - ${getHijriMonthName(data.startMonth)} ${data.startYear}`,
        description: `Personalized ${data.intensity} Islamic education plan`,
        startDate: new Date(),
        endDate: new Date(Date.now() + data.duration * 30 * 24 * 60 * 60 * 1000),
        planData: learningPlan,
        isActive: true
      }
    });
    
    return c.json({
      plan: savedPlan,
      monthlyBreakdown: learningPlan.monthlyBreakdown,
      totalContent: learningPlan.totalContentItems,
      estimatedHours: learningPlan.estimatedHours
    });
    
  } catch (error) {
    console.error('Error creating learning plan:', error);
    return c.json({ error: 'Failed to create learning plan' }, 500);
  }
});

// Helper Functions

function getHijriMonthName(month: number): string {
  const months = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
  ];
  return months[month - 1] || 'Unknown';
}

function checkSeasonalRelevance(content: any, hijriMonth: number): boolean {
  const calendarInfo = ISLAMIC_CALENDAR_EVENTS[hijriMonth as keyof typeof ISLAMIC_CALENDAR_EVENTS];
  if (!calendarInfo) return false;
  
  const contentTags = content.tags || [];
  const contentKeywords = content.keywords || [];
  
  return calendarInfo.topics.some(topic => 
    contentTags.includes(topic.toLowerCase()) || 
    contentKeywords.includes(topic.toLowerCase())
  ) || calendarInfo.events.some(event =>
    contentTags.includes(event.toLowerCase()) ||
    contentKeywords.includes(event.toLowerCase())
  );
}

function findEventConnection(content: any, events: readonly string[]): string[] {
  const contentTags = content.tags || [];
  const contentKeywords = content.keywords || [];
  
  return events.filter(event =>
    contentTags.includes(event.toLowerCase()) ||
    contentKeywords.includes(event.toLowerCase()) ||
    content.title?.toLowerCase().includes(event.toLowerCase().replace('_', ' '))
  );
}

function calculateUrgency(content: any, hijriMonth: number, events: readonly string[]): 'high' | 'medium' | 'low' {
  const calendarInfo = ISLAMIC_CALENDAR_EVENTS[hijriMonth as keyof typeof ISLAMIC_CALENDAR_EVENTS];
  
  // High urgency for Ramadan, Hajj, Eid content during relevant months
  if (hijriMonth === 9 && events.includes('RAMADAN')) return 'high';
  if (hijriMonth === 12 && events.includes('HAJJ')) return 'high';
  if ((hijriMonth === 10 || hijriMonth === 12) && (events.includes('EID_FITR') || events.includes('EID_ADHA'))) return 'high';
  
  // Medium urgency for seasonally relevant content
  if (checkSeasonalRelevance(content, hijriMonth)) return 'medium';
  
  return 'low';
}

function generateEducationalGoals(ageTier: AgeTier | string, hijriMonth: number): string[] {
  const calendarInfo = ISLAMIC_CALENDAR_EVENTS[hijriMonth as keyof typeof ISLAMIC_CALENDAR_EVENTS];
  const monthName = getHijriMonthName(hijriMonth);
  
  const baseGoals = [
    `Learn about the significance of ${monthName}`,
    'Strengthen Islamic knowledge and practice',
    'Connect with Islamic community and values'
  ];
  
  if (calendarInfo) {
    baseGoals.push(`Understand the importance of ${calendarInfo.events.join(' and ')}`);
    baseGoals.push(`Explore topics: ${calendarInfo.topics.join(', ')}`);
  }
  
  return baseGoals;
}

function generateLearningObjectives(subject: IslamicSubject, ageTier: AgeTier | string): string[] {
  const ageContent = AGE_APPROPRIATE_CONTENT[ageTier as keyof typeof AGE_APPROPRIATE_CONTENT];
  
  if (!ageContent) return [`Learn about ${subject.toLowerCase().replace('_', ' ')}`];
  
  return [
    `Understand ${subject.toLowerCase().replace('_', ' ')} at ${ageContent.complexity} level`,
    `Apply learning through ${ageContent.activities.join(' and ')}`,
    'Connect knowledge to daily Islamic practice'
  ];
}

function generateMonthlyEducationalPriorities(month: number, ageTier: AgeTier | string): string[] {
  const calendarInfo = ISLAMIC_CALENDAR_EVENTS[month as keyof typeof ISLAMIC_CALENDAR_EVENTS];
  const ageContent = AGE_APPROPRIATE_CONTENT[ageTier as keyof typeof AGE_APPROPRIATE_CONTENT];
  
  const priorities = [];
  
  if (calendarInfo) {
    priorities.push(`Focus on ${calendarInfo.specialContent}`);
    priorities.push(`Emphasize ${calendarInfo.topics.join(', ')}`);
  }
  
  if (ageContent) {
    priorities.push(`Use ${ageContent.complexity} complexity level`);
    priorities.push(`Incorporate ${ageContent.activities.join(' and ')} activities`);
  }
  
  return priorities;
}

async function generateIslamicLearningPlan(params: {
  userId: string;
  userAgeTier: AgeTier;
  startMonth: number;
  startYear: number;
  duration: number;
  focusAreas: IslamicSubject[];
  intensity: 'light' | 'moderate' | 'intensive';
}) {
  const { startMonth, startYear, duration, focusAreas, intensity, userAgeTier } = params;
  
  const monthlyBreakdown = [];
  let totalContentItems = 0;
  let estimatedHours = 0;
  
  const intensityMultiplier = {
    light: 0.5,
    moderate: 1.0,
    intensive: 1.5
  }[intensity];
  
  for (let i = 0; i < duration; i++) {
    const currentMonth = ((startMonth - 1 + i) % 12) + 1;
    const currentYear = startYear + Math.floor((startMonth - 1 + i) / 12);
    
    const calendarInfo = ISLAMIC_CALENDAR_EVENTS[currentMonth as keyof typeof ISLAMIC_CALENDAR_EVENTS];
    const monthlyContent = await prisma.educationContent.findMany({
      where: {
        isPublished: true,
        subject: { in: focusAreas },
        ageTier: { in: [userAgeTier, 'ALL_AGES'] },
        OR: calendarInfo ? [
          { tags: { hasAny: calendarInfo.events.map(e => e.toLowerCase()) } },
          { keywords: { hasAny: calendarInfo.topics } }
        ] : undefined
      },
      take: Math.ceil(10 * intensityMultiplier),
      orderBy: { priority: 'desc' }
    });
    
    const monthlyHours = Math.ceil(monthlyContent.length * 2 * intensityMultiplier); // 2 hours per content item
    
    monthlyBreakdown.push({
      month: currentMonth,
      year: currentYear,
      monthName: getHijriMonthName(currentMonth),
      events: calendarInfo?.events || [],
      topics: calendarInfo?.topics || [],
      content: monthlyContent.map(c => ({
        id: c.id,
        title: c.title,
        subject: c.subject,
        estimatedHours: 2 * intensityMultiplier
      })),
      estimatedHours: monthlyHours
    });
    
    totalContentItems += monthlyContent.length;
    estimatedHours += monthlyHours;
  }
  
  return {
    monthlyBreakdown,
    totalContentItems,
    estimatedHours,
    intensity,
    focusAreas,
    duration
  };
}

export default islamicEducationCalendar;