# AI Frontend Generation Prompts for Masjid At-Taqwa Islamic Community Website

## Overview

This document contains comprehensive, implementation-ready prompts for AI UI generation tools (v0, Lovable, Cursor, etc.) to create Islamic community website components with proper cultural sensitivity, accessibility features, and Islamic design principles.

## Design System Foundation

### Color Palette
```typescript
// Islamic Color System
const colors = {
  islamic: {
    green: {
      50: '#f0f9f4',   // Light backgrounds
      500: '#349856',  // Primary actions
      700: '#206539',  // Text and borders
    },
    gold: {
      50: '#fefdf3',   // Light accents
      500: '#efc843',  // Secondary highlights
      700: '#b08220',  // Zakat/donation elements
    },
    navy: {
      50: '#f4f6f9',   // Subtle backgrounds
      500: '#7793b0',  // Secondary text
      800: '#495876',  // Primary text
    }
  }
}
```

### Typography
- **Primary Font**: Inter (sans-serif) for UI and English text
- **Arabic Font**: Amiri (serif) for Arabic text and Islamic content
- **Prayer Times**: Tabular numbers with `.prayer-time` class
- **Hierarchy**: Clear size progression with cultural sensitivity

### Accessibility Standards
- WCAG 2.1 AA compliance
- RTL (Right-to-Left) text support for Arabic
- Keyboard navigation support
- Screen reader optimized ARIA labels
- Elder-friendly interfaces (larger touch targets, high contrast)

### Cultural Authenticity Requirements
- Respect for Islamic values and principles
- No inappropriate imagery per Islamic guidelines
- Proper Arabic text rendering and RTL support
- Islamic geometric patterns for decorative elements
- Prayer time accuracy and prominence

---

## 1. Prayer Time Display Component

### Mobile-First Prayer Times Widget

**Prompt for AI Tools:**
```
Create a responsive Prayer Times Display component for an Islamic community website using React and TypeScript. The component should be mobile-first with the following specifications:

DESIGN REQUIREMENTS:
- Clean, modern card layout with Islamic green (#349856) color scheme
- Display today's 5 daily prayers: Fajr, Dhuhr, Asr, Maghrib, Isha
- Include Iqama (congregation) times alongside Adhan times
- Highlight current/next prayer with distinct styling
- Show Qibla direction (58.5° NE) 
- Include Jummah prayer times (Friday prayers)
- Mobile-optimized with smooth animations

TECHNICAL SPECS:
- TypeScript interface for prayer times data
- Responsive grid layout (mobile-first, then tablet/desktop)
- Islamic geometric background patterns (subtle, 10% opacity)
- Loading skeleton states with Islamic theme
- Error handling with retry functionality
- Support for both compact and full view modes

CULTURAL CONSIDERATIONS:
- Arabic prayer names with English translations
- 12-hour time format (American preference)
- Sunrise labeled as "Shurooq" with distinct styling
- Islamic calendar date display (Hijri)
- Prayer time notifications compatibility
- Respect for Islamic prayer etiquette

ACCESSIBILITY:
- ARIA labels for prayer names in both languages
- Keyboard navigation support
- High contrast for elderly users
- Screen reader compatible
- Touch-friendly buttons (44px minimum)

DATA STRUCTURE:
```typescript
interface DailyPrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  qibla: number;
  iqama?: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  jummah?: string[];
}
```

ANIMATIONS & INTERACTIONS:
- Subtle pulse animation for current prayer
- Smooth transitions between prayer times
- Hover effects with Islamic gold (#efc843) accents
- Loading shimmer effects in Islamic green tones
- Responsive scaling for different screen sizes

COMPONENT VARIANTS:
1. Compact Sidebar Widget (300px width)
2. Full Dashboard Card (responsive width)
3. Mobile-First Hero Section (full width)

The component should feel authentic to Islamic culture while being accessible to American Muslim families including elderly community members.
```

### Desktop Prayer Times Dashboard

**Prompt for AI Tools:**
```
Create a comprehensive Prayer Times Dashboard component for desktop screens in an Islamic community center website using React, TypeScript, and Tailwind CSS:

LAYOUT STRUCTURE:
- Large hero-style card with gradient backgrounds (Islamic green to gold)
- Two-column layout: Prayer times grid + Islamic information panel
- Integrated Qibla compass with animated direction indicator
- Islamic calendar widget with Hijri dates
- Community prayer notifications area

PRAYER DISPLAY FEATURES:
- Prayer name in English and Arabic (Amiri font)
- Countdown timer to next prayer
- Visual prayer timeline with progress indicators
- Weather integration for prayer time adjustments
- Multiple Islamic time calculation methods support

ADVANCED FUNCTIONALITY:
- Prayer time history and tracking
- Notification settings panel
- Prayer attendance tracker
- Community prayer stats
- Ramadan special timings mode
- Automatic location-based adjustments

ISLAMIC DESIGN ELEMENTS:
- Geometric Islamic patterns as decorative borders
- Mosque silhouette illustrations
- Crescent moon and star iconography (tasteful)
- Arabic calligraphy headers (if appropriate)
- Islamic architecture-inspired card borders

INTERACTION DESIGN:
- Smooth parallax scrolling effects
- Prayer card hover animations with depth
- Islamic gold accent animations
- Sound notification previews
- Customizable prayer reminder settings

CULTURAL FEATURES:
- Du'a (prayer) text for each prayer time
- Hadith quotes about prayer importance
- Islamic etiquette reminders
- Community prayer guidelines
- Mosque dress code reminders

The component should serve as the central hub for prayer information while maintaining Islamic authenticity and modern web design standards.
```

---

## 2. Age Filter Navigation Component

### Family-Focused Education Filter

**Prompt for AI Tools:**
```
Design a sophisticated Age Filter Navigation component for Islamic educational content, optimized for American Muslim families with diverse age groups:

FILTER CATEGORIES:
- 👶 Children (Ages 5-12): Basic Islamic stories, prayers, moral values
- 🧑 Youth (Ages 13-17): Islamic identity, contemporary issues, guidance
- 👨 Adults (Ages 18+): In-depth knowledge, practical application
- 👴 Seniors (Ages 60+): Wisdom, reflection, life experience sharing
- 👥 All Ages: Universal teachings for family bonding

DESIGN SPECIFICATIONS:
- Card-based filter selection with hover animations
- Content count badges for each age group
- Active state highlighting with Islamic green
- Smooth transitions and micro-interactions
- Mobile-responsive grid layout (1 column mobile, 3 desktop)

FUNCTIONALITY:
- Multi-select capability for family content planning
- Content recommendation engine based on selections
- Progress tracking per age group
- Learning path suggestions
- Parental control settings

VISUAL HIERARCHY:
- Clear iconography for each age group
- Progress indicators for completed content
- Difficulty level indicators (stars/crescents)
- Time estimates for content consumption
- Islamic color coding for different content types

ACCESSIBILITY FEATURES:
- Large touch targets for all age groups
- High contrast mode for elderly users
- Simple navigation for children
- Screen reader optimization
- Keyboard navigation support

CULTURAL ADAPTATION:
- Age-appropriate Islamic content guidelines
- Family-centric filtering options
- Generational learning recommendations
- Cultural sensitivity warnings where needed
- Islamic developmental milestone integration

COMPONENT STATE MANAGEMENT:
```typescript
interface AgeTierFilter {
  selectedTiers: AgeTier[];
  contentCounts: Record<AgeTier, number>;
  onTierChange: (tiers: AgeTier[]) => void;
  showFamilyRecommendations: boolean;
}

enum AgeTier {
  CHILDREN = 'CHILDREN',
  YOUTH = 'YOUTH', 
  ADULTS = 'ADULTS',
  SENIORS = 'SENIORS',
  ALL_AGES = 'ALL_AGES'
}
```

ADVANCED FEATURES:
- Family learning plan generator
- Age-appropriate content warnings
- Progress synchronization across family accounts
- Recommendation algorithms based on Islamic calendar
- Cultural context explanations for different age groups

Create this as a reusable component that can be embedded in education dashboards, content libraries, and family account management interfaces.
```

---

## 3. New Muslim Onboarding Component

### Progressive Islamic Learning Journey

**Prompt for AI Tools:**
```
Create a comprehensive New Muslim Onboarding component that provides a welcoming, educational, and culturally sensitive introduction to Islam for converts and those new to the community:

ONBOARDING JOURNEY STRUCTURE:
1. Welcome & Personal Introduction
2. Basic Islamic Beliefs (Shahada, Five Pillars)
3. Prayer Learning Module (Step-by-step Salah)
4. Community Integration Guide
5. American Muslim Life Navigation
6. Continued Learning Resources

DESIGN APPROACH:
- Warm, non-intimidating color scheme with soft Islamic greens
- Progressive disclosure of information
- Interactive learning modules with quizzes
- Personal progress tracking dashboard
- Community mentor assignment interface
- Cultural bridge-building elements

LEARNING MODULES:
- Animated prayer instruction with audio guidance
- Islamic calendar and holiday explanations
- Mosque etiquette and community customs
- American Muslim cultural integration tips
- Basic Arabic phrases with pronunciation
- Halal living guidance and resources

COMMUNITY INTEGRATION:
- Mentor pairing system interface
- Local community event recommendations
- New Muslim support group connections
- Family integration guidance (if applicable)
- Cultural sensitivity workshops schedule
- Friendship building opportunities

ACCESSIBILITY & COMFORT:
- Multiple language support options
- Comfortable pacing with no pressure
- Anonymous question submission system
- Private progress tracking
- Safe space assurance messaging
- Cultural accommodation options

TECHNICAL IMPLEMENTATION:
```typescript
interface OnboardingProgress {
  userId: string;
  currentStep: number;
  completedModules: string[];
  mentorAssigned?: {
    name: string;
    contact: string;
    background: string;
  };
  personalNotes: string;
  preferredLearningPace: 'slow' | 'moderate' | 'fast';
  culturalBackground: string;
  questionsSubmitted: Question[];
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number;
  prerequisites: string[];
  resources: Resource[];
  quiz?: Quiz;
  practicalExercise?: string;
}
```

CULTURAL SENSITIVITY FEATURES:
- Multiple cultural context explanations
- American Muslim identity formation guidance
- Family relationship navigation advice
- Workplace Islamic practice guidance
- Converting from different faith backgrounds support
- Interfaith relationship guidance

INTERACTIVE ELEMENTS:
- Virtual mosque tour with narration
- Prayer position practice with feedback
- Islamic calendar interactive timeline
- Community member introduction videos
- Q&A with imam/religious scholars
- New Muslim testimonials and stories

PROGRESS TRACKING:
- Visual progress bars for each learning pillar
- Achievement badges for milestones
- Certificate of completion options
- Personal journey documentation
- Reflection journal integration
- Goal-setting and tracking tools

The component should feel like a supportive friend guiding someone through their Islamic journey, with deep respect for their courage in embracing a new faith while acknowledging the challenges of cultural adaptation in America.
```

---

## 4. Family Event Registration Component

### Multi-Child Registration System

**Prompt for AI Tools:**
```
Build a sophisticated Family Event Registration component designed specifically for Islamic community events, optimizing for large families with multiple children and complex scheduling needs:

REGISTRATION FLOW DESIGN:
1. Event Overview with Islamic event details
2. Family Member Selection (expandable child forms)
3. Age-Appropriate Activity Selection
4. Dietary Restrictions & Accommodations
5. Transportation & Carpooling Options
6. Payment Processing (Zakat, Sadaqah integration)
7. Confirmation & Calendar Integration

FAMILY-CENTRIC FEATURES:
- Dynamic child addition forms
- Age-based automatic activity filtering
- Sibling group management
- Family discount calculations
- Multi-child medical information forms
- Guardian consent management

EVENT-SPECIFIC ADAPTATIONS:
- Eid celebration registrations (indoor/outdoor prayer options)
- Ramadan iftar meal planning
- Educational workshop age groups
- Gender-separated activity options
- Islamic holiday specific requirements
- Community volunteer opportunities

FORM ARCHITECTURE:
```typescript
interface FamilyRegistration {
  familyId: string;
  primaryContact: ContactInfo;
  eventId: string;
  participants: FamilyMember[];
  dietaryRestrictions: DietaryInfo[];
  transportationNeeds: TransportationOption;
  paymentInfo: PaymentDetails;
  specialRequests: string;
  emergencyContact: ContactInfo;
}

interface FamilyMember {
  name: string;
  age: number;
  ageTier: AgeTier;
  selectedActivities: string[];
  medicalInfo?: MedicalInfo;
  dietaryRestrictions: string[];
  guardianConsent: boolean;
}
```

ACCESSIBILITY & USABILITY:
- Mobile-first responsive design
- Multi-step form with clear progress indicators
- Auto-save functionality for long forms
- Accessible form validation with clear error messages
- Multiple language support for form labels
- Large touch targets for elderly family members

ISLAMIC EVENT CONSIDERATIONS:
- Prayer time conflict warnings
- Halal meal confirmation checkboxes
- Gender preference settings
- Islamic dress code reminders
- Zakat ul-Fitr integration for Eid events
- Community prayer timing coordination

PAYMENT INTEGRATION:
- Family discount calculations
- Zakat payment options
- Sadaqah donation integration
- Payment plan options for large families
- Scholarship/assistance request forms
- Receipt generation with Islamic formatting

ADVANCED FUNCTIONALITY:
- Recurring event registration memory
- Family member templates saving
- Multi-event bulk registration
- Waitlist management with notifications
- Automatic reminder system
- Integration with Islamic calendar

COMMUNITY FEATURES:
- Carpooling coordination with other families
- Potluck meal planning integration
- Volunteer opportunity sign-ups
- Community mentor connections
- New family welcome procedures
- Cultural orientation offerings

CONFIRMATION & FOLLOW-UP:
- Detailed confirmation emails with event specifics
- Calendar integration (Google, Apple, Outlook)
- Event reminder notifications
- Last-minute update communications
- Post-event feedback collection
- Community photo sharing permissions

The component should handle the complexity of Islamic community events while maintaining simplicity for users, especially accommodating large families common in Muslim communities.
```

---

## 5. Islamic Calendar & Resource Downloads

### Comprehensive Islamic Resource Hub

**Prompt for AI Tools:**
```
Create a comprehensive Islamic Calendar & Resource Downloads component that serves as the central hub for Islamic dates, documents, and educational materials for the American Muslim community:

CALENDAR FEATURES:
- Interactive Hijri calendar with Gregorian synchronization
- Islamic holiday highlighting and descriptions
- Prayer time integration by date
- Ramadan calendar with Suhur/Iftar times
- Community event overlays
- Personal Islamic milestone tracking

DOWNLOADABLE RESOURCES:
- Annual Ramadan calendars (PDF/PNG formats)
- Prayer timetables (monthly/yearly formats)
- Islamic holiday guides with cultural context
- Halal restaurant guides (local area)
- Mosque etiquette pamphlets
- New Muslim resource packets

RESOURCE CATEGORIES:
1. **Prayer & Worship Resources**
   - Prayer time charts
   - Du'a collections
   - Qibla direction maps
   - Mosque service schedules

2. **Educational Materials**
   - Age-specific Islamic learning guides
   - Arabic alphabet learning sheets
   - Islamic history timelines
   - Quran study guides

3. **Community Integration**
   - Local halal business directories
   - American Muslim cultural guides
   - Interfaith dialogue resources
   - Islamic parenting in America guides

4. **Holiday & Celebration Resources**
   - Eid celebration planning guides
   - Ramadan family activity packets
   - Islamic New Year resources
   - Mawlid celebration materials

TECHNICAL IMPLEMENTATION:
```typescript
interface IslamicResource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  fileUrl: string;
  fileType: 'pdf' | 'png' | 'jpg' | 'doc' | 'mp3';
  fileSize: number;
  downloadCount: number;
  lastUpdated: Date;
  languages: string[];
  ageAppropriate: AgeTier[];
  tags: string[];
}

interface IslamicCalendarEvent {
  date: Date;
  hijriDate: string;
  title: string;
  description: string;
  type: 'holiday' | 'observance' | 'community_event';
  significance: string;
  observanceGuidelines: string;
}
```

USER EXPERIENCE DESIGN:
- Search and filter functionality by category, language, age group
- Preview functionality for documents before download
- Bulk download options for related resources
- Bookmark/favorite system for frequently used resources
- Community rating and review system
- Resource request submission form

ISLAMIC CALENDAR INTERFACE:
- Month view with Islamic dates overlay
- Holiday detail popovers with significance explanations
- Prayer time integration for each date
- Community event calendar synchronization
- Personal Islamic anniversary tracking
- Seasonal Islamic observance reminders

ACCESSIBILITY FEATURES:
- High contrast mode for calendar viewing
- Screen reader compatible resource descriptions
- Keyboard navigation for all interactive elements
- Multiple language support (English/Arabic)
- Large print format options for elderly users
- Audio description support for educational materials

CULTURAL SENSITIVITY:
- American Muslim context for all resources
- Cultural adaptation notes for different backgrounds
- Sectarian neutrality in religious content
- Family-friendly content assurance
- Community values alignment verification
- Interfaith relationship considerations

COMMUNITY FEATURES:
- Resource contribution submissions from community
- Community-specific customizations
- Local business integration (halal restaurants, services)
- Regional Islamic organization partnerships
- Imam and scholar resource endorsements
- Community feedback and improvement suggestions

MOBILE OPTIMIZATION:
- Mobile-first calendar interface
- Touch-friendly download buttons
- Offline access for downloaded resources
- Push notifications for Islamic holidays
- Location-based resource recommendations
- Mobile sharing capabilities for resources

ADMINISTRATIVE FEATURES:
- Resource upload and management system
- Usage analytics and popular resource tracking
- Community feedback integration
- Resource update notification system
- Quality control and content moderation
- Multi-language resource management

The component should serve as the go-to resource center for Islamic community members, providing both spiritual guidance and practical living resources for Muslims in America.
```

---

## 6. Community Announcements Management

### Islamic Community Communication Hub

**Prompt for AI Tools:**
```
Develop a comprehensive Community Announcements Management component that handles all Islamic community communications with cultural sensitivity, urgency prioritization, and multi-generational accessibility:

ANNOUNCEMENT CATEGORIES:
1. **Urgent Community Notices** (Red priority)
   - Emergency community support
   - Immediate prayer time changes
   - Weather-related mosque closures
   - Community safety alerts

2. **Religious Observances** (Islamic Gold priority)
   - Eid celebration announcements
   - Ramadan schedule changes
   - Special prayer services
   - Islamic holiday reminders

3. **Educational Programs** (Islamic Green priority)
   - Class schedule updates
   - New course launches
   - Guest scholar visits
   - Youth program announcements

4. **Community Events** (Islamic Navy priority)
   - Social gatherings
   - Fundraising activities
   - Community volunteer opportunities
   - Interfaith dialogue events

DESIGN SPECIFICATIONS:
- Card-based layout with Islamic design elements
- Priority-based color coding system
- Rich text editor with Islamic symbol support
- Image upload with community photo guidelines
- Automatic translation support (English/Arabic)
- Accessibility optimization for all ages

ANNOUNCEMENT STRUCTURE:
```typescript
interface CommunityAnnouncement {
  id: string;
  title: string;
  content: string; // Rich HTML content
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: AnnouncementCategory;
  publishDate: Date;
  expirationDate?: Date;
  targetAudience: AudienceType[];
  attachments: FileAttachment[];
  translations: Record<string, AnnouncementTranslation>;
  authorInfo: {
    name: string;
    role: 'imam' | 'admin' | 'board_member' | 'volunteer';
  };
  engagementMetrics: {
    views: number;
    shares: number;
    responses: number;
  };
}

enum AnnouncementCategory {
  URGENT = 'urgent',
  RELIGIOUS = 'religious',
  EDUCATIONAL = 'educational',
  COMMUNITY = 'community',
  ADMINISTRATIVE = 'administrative'
}
```

CONTENT MANAGEMENT FEATURES:
- Rich text editor with Islamic formatting options
- Template system for recurring announcements
- Approval workflow for community content
- Scheduling system for future announcements
- Automatic archiving of expired content
- Multi-language content management

DISTRIBUTION SYSTEM:
- Email notification integration
- SMS alerts for urgent announcements
- Social media auto-posting capabilities
- Website banner placement
- Mobile app push notifications
- Community bulletin board printing

AUDIENCE TARGETING:
- Age group filtering (children, youth, adults, seniors)
- Interest-based targeting (education, events, prayer)
- Language preference targeting
- Family vs. individual targeting options
- New member specific announcements
- Volunteer opportunity targeting

ISLAMIC CULTURAL FEATURES:
- Arabic date integration alongside Gregorian
- Prayer time conflict warnings for events
- Halal/Haram content verification prompts
- Gender-appropriate event categorization
- Islamic holiday context integration
- Community Islamic calendar synchronization

ACCESSIBILITY DESIGN:
- High contrast mode for elderly community members
- Screen reader optimization with proper ARIA labels
- Large font options with responsive scaling
- Keyboard navigation for all interactive elements
- Voice-to-text input support
- Simple language options for complex announcements

ENGAGEMENT FEATURES:
- Community feedback and response system
- RSVP integration for events
- Question and answer forums
- Community discussion threads
- Volunteer sign-up integration
- Donation drive participation tracking

MODERATION & APPROVAL:
- Multi-level approval system (Imam → Board → Admin)
- Content moderation guidelines based on Islamic principles
- Community reporting system for inappropriate content
- Automated content scanning for policy compliance
- Version control for announcement edits
- Audit trail for all community communications

MOBILE OPTIMIZATION:
- Mobile-first responsive design
- Offline reading capabilities
- Push notification management
- Mobile sharing functionality
- Voice narration for accessibility
- Quick action buttons (RSVP, Share, Save)

ANALYTICS & INSIGHTS:
- Community engagement metrics
- Announcement effectiveness tracking
- Audience reach analytics
- Content performance insights
- Community interaction patterns
- Improvement recommendation system

INTEGRATION CAPABILITIES:
- Islamic calendar event synchronization
- Prayer time service integration
- Community management system connectivity
- Educational program registration linking
- Donation platform integration
- Volunteer management system coordination

The component should serve as the central nervous system of Islamic community communication, ensuring no community member misses important information while respecting Islamic values and cultural diversity within the American Muslim community.
```

---

## 7. Islamic Education Dashboard

### Comprehensive Learning Management System

**Prompt for AI Tools:**
```
Create a sophisticated Islamic Education Dashboard component that provides personalized learning experiences for American Muslim families across all age groups, with emphasis on both spiritual development and practical Islamic knowledge:

DASHBOARD STRUCTURE:
1. **Personal Learning Overview**
   - Current course progress across all family members
   - Upcoming lessons and assignments
   - Achievement milestones and Islamic badges
   - Learning streak tracking with prayer integration

2. **Age-Tiered Learning Paths**
   - Preschool (3-5): Basic Islamic stories and manners
   - Elementary (6-12): Quran reading and Islamic history
   - Middle School (13-15): Islamic identity and contemporary issues
   - High School (16-18): Islamic jurisprudence and life skills
   - College (19-25): Advanced Islamic studies and career guidance
   - Adults (26+): Comprehensive Islamic education and parenting
   - Seniors (60+): Wisdom sharing and spiritual reflection

3. **Interactive Learning Modules**
   - Quran recitation with Tajweed feedback
   - Arabic language progressive learning
   - Islamic history with American Muslim context
   - Hadith study with practical applications
   - Fiqh (jurisprudence) for daily life

TECHNICAL ARCHITECTURE:
```typescript
interface IslamicEducationDashboard {
  userId: string;
  familyMembers: FamilyLearner[];
  currentCourses: IslamicCourse[];
  completedAchievements: Achievement[];
  learningStreak: {
    currentDays: number;
    longestStreak: number;
    prayerIntegration: boolean;
  };
  personalizedRecommendations: CourseRecommendation[];
  culturalPreferences: CulturalSettings;
}

interface IslamicCourse {
  id: string;
  title: string;
  category: 'quran' | 'hadith' | 'fiqh' | 'arabic' | 'history' | 'contemporary';
  ageTier: AgeTier;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'scholar';
  progress: number; // 0-100
  estimatedCompletion: Date;
  instructor: IslamicScholar;
  culturalContext: 'universal' | 'american_muslim' | 'converts' | 'heritage';
}
```

PERSONALIZATION FEATURES:
- AI-driven course recommendations based on age, interest, and progress
- Cultural background adaptation (convert, heritage, interfaith family)
- Learning pace customization with Islamic calendar integration
- Family learning coordination and shared goals
- Personal Islamic milestone tracking and celebration

CONTENT DELIVERY METHODS:
- Interactive video lessons with pause-and-reflect segments
- Audio-only lessons for busy parents and commuters
- Text-based study materials with highlight and note features
- Gamified learning with Islamic-themed achievements
- Live virtual classes with renowned Islamic scholars
- Community discussion forums for peer learning

ASSESSMENT & PROGRESS TRACKING:
- Gentle quizzes with explanation-focused feedback
- Practical application assignments
- Recitation assessments with audio feedback
- Peer learning and teaching opportunities
- Self-reflection journals with guided prompts
- Community service integration for practical Islamic application

FAMILY INTEGRATION FEATURES:
- Family learning challenges and competitions
- Shared family Islamic library and resources
- Parent-child learning activities and discussions
- Grandparent wisdom-sharing integrated lessons
- Family Islamic tradition documentation
- Intergenerational Islamic knowledge transfer

AMERICAN MUSLIM CONTEXT:
- Navigation of Islamic practice in American workplace
- Interfaith dialogue and relationship guidance
- Islamic parenting in multicultural environments
- Integration of Islamic values with American civic responsibility
- Halal living guidance in American consumer culture
- Community leadership development for American Muslims

ACCESSIBILITY & INCLUSION:
- Multiple learning style accommodations (visual, auditory, kinesthetic)
- Special needs learning support with Islamic context
- Multiple language support with Arabic integration
- Flexible scheduling for working parents
- Economic accessibility with scholarship programs
- Technology literacy support for elderly learners

COMMUNITY CONNECTION:
- Local mosque integration with educational programs
- Community scholar Q&A sessions
- Peer mentorship programs across age groups
- Community service project coordination
- Islamic book club integration
- Community Islamic art and culture projects

SPIRITUAL DEVELOPMENT TRACKING:
- Prayer consistency correlation with learning progress
- Dhikr (remembrance) practice integration
- Islamic character development milestones
- Community service hours tracking
- Personal du'a collection and reflection
- Islamic ethical decision-making scenario practices

ADVANCED FEATURES:
- Virtual reality Hajj and Umrah educational experiences
- AI-powered Arabic conversation practice
- Islamic finance and economics education
- Islamic art and calligraphy digital workshops
- Islamic law and ethics case study discussions
- Contemporary Islamic thought and scholarship exploration

MOBILE LEARNING OPTIMIZATION:
- Offline lesson downloads for travel and commute learning
- Audio-only modes for hands-free learning
- Quick micro-lessons for busy schedules
- Mobile-friendly assignment submissions
- Push notifications for learning reminders
- Mobile community interaction and discussion

The dashboard should feel like a personal Islamic guide that grows with the learner, providing both foundational knowledge and advanced understanding while always connecting Islamic teachings to practical American Muslim life.
```

---

## 8. Islamic Services Directory

### Comprehensive Life Event Services Hub

**Prompt for AI Tools:**
```
Build a comprehensive Islamic Services Directory component that connects American Muslim families with essential Islamic life services, from birth to death, with cultural sensitivity and community trust verification:

SERVICE CATEGORIES:

1. **Birth & Child Services**
   - Islamic birth ceremonies (Aqiqah planning)
   - Islamic name consultation
   - Circumcision (Khitan) medical providers
   - Islamic child blessing ceremonies
   - Newborn Islamic gift registries

2. **Education & Development Services**
   - Islamic schools and madrasahs
   - Quran tutoring and memorization programs
   - Arabic language instruction
   - Islamic summer camps and activities
   - University Islamic student services

3. **Marriage & Family Services**
   - Islamic marriage consultation
   - Nikah ceremony planning
   - Islamic family counseling
   - Halal wedding venue services
   - Islamic pre-marital counseling

4. **Financial Services**
   - Islamic banking and finance
   - Halal investment guidance
   - Zakat calculation services
   - Islamic insurance (Takaful)
   - Islamic estate planning

5. **End-of-Life Services**
   - Islamic funeral services
   - Janazah prayer coordination
   - Islamic burial arrangements
   - Grief counseling with Islamic context
   - Estate distribution according to Islamic law

TECHNICAL IMPLEMENTATION:
```typescript
interface IslamicServiceProvider {
  id: string;
  businessName: string;
  serviceCategory: ServiceCategory;
  islamicCertification: CertificationInfo;
  contactInfo: ContactDetails;
  location: GeographicInfo;
  servicesOffered: ServiceOffering[];
  communityReviews: CommunityReview[];
  islamicCredentials: IslamicCredential[];
  pricing: PricingInfo;
  availability: AvailabilitySchedule;
}

interface CommunityReview {
  reviewerId: string;
  rating: number; // 1-5 stars
  islamicAuthenticityRating: number; // Islamic compliance rating
  serviceQualityRating: number;
  culturalSensitivityRating: number;
  reviewText: string;
  verifiedCommunityMember: boolean;
  reviewDate: Date;
}
```

COMMUNITY TRUST FEATURES:
- Imam and community leader endorsements
- Community member verification system
- Islamic authenticity ratings and reviews
- Transparent pricing with no hidden costs
- Community complaint resolution process
- Regular service provider audits

SEARCH & DISCOVERY:
- Location-based service provider finding
- Islamic authenticity filtering options
- Community rating and review sorting
- Emergency service quick access
- Specialized need filtering (converts, special occasions)
- Multi-language service provider identification

CULTURAL SENSITIVITY FEATURES:
- Convert-friendly service identification
- Gender-specific service preferences
- Cultural background accommodation
- Language preference matching
- Religious observance scheduling
- Family size and structure considerations

ACCESSIBILITY DESIGN:
- Large button interfaces for elderly users
- Screen reader compatible service descriptions
- Multiple contact method options (phone, email, text)
- Simplified navigation for emergency situations
- High contrast mode for important information
- Voice search capability for hands-free access

COMMUNITY INTEGRATION:
- Mosque partnership integrations
- Community event service coordination
- Bulk service discounts for community members
- Community fund integration for those in need
- Volunteer service coordination
- Community service project connections

EMERGENCY SERVICES:
- 24/7 Islamic funeral service access
- Emergency Islamic counseling hotline
- Crisis financial assistance connections
- Emergency medical care with Islamic considerations
- Last-minute Islamic ceremony coordination
- Urgent Islamic legal consultation

VERIFICATION & QUALITY ASSURANCE:
- Islamic credential verification system
- Community leader reference checks
- Regular service quality audits
- Complaint and resolution tracking
- Continuous education requirements for providers
- Islamic ethics compliance monitoring

BOOKING & COORDINATION:
- Online appointment scheduling
- Service package customization
- Multi-provider coordination for complex events
- Payment processing with Islamic finance compliance
- Service reminder and follow-up systems
- Community discount application

LOCAL COMMUNITY ADAPTATION:
- Regional Islamic law interpretation guidance
- Local halal business integration
- Area-specific Islamic cultural practices
- Local mosque and imam connections
- Regional Islamic organization partnerships
- Community-specific service customizations

EDUCATIONAL INTEGRATION:
- Service educational content (Islamic context)
- Community workshops on life event planning
- Islamic finance education integration
- Cultural orientation for new services
- Community mentorship connections
- Educational resource links for each service category

MOBILE OPTIMIZATION:
- Mobile-first responsive design for urgent needs
- One-touch calling for emergency services
- GPS integration for location-based services
- Mobile payment processing capabilities
- Push notifications for appointment reminders
- Offline access to essential service information

The component should serve as a trusted community resource that ensures Muslim families can navigate major life events with authentic Islamic guidance while building stronger community connections and supporting local Islamic businesses.
```

---

## 9. Volunteer Opportunities Hub

### Islamic Community Service Coordination Center

**Prompt for AI Tools:**
```
Create a comprehensive Volunteer Opportunities Hub component that facilitates Islamic community service (Khidmah) with emphasis on both community building and spiritual development through service to others:

VOLUNTEER OPPORTUNITY CATEGORIES:

1. **Mosque & Community Services**
   - Friday prayer setup and cleanup
   - Islamic event planning and coordination
   - Community iftar preparation during Ramadan
   - New Muslim welcome and mentorship
   - Islamic school teaching assistance

2. **Educational & Outreach Programs**
   - Quran and Arabic tutoring
   - Islamic Sunday school teaching
   - Community dawah (outreach) activities
   - Interfaith dialogue coordination
   - Islamic knowledge sharing workshops

3. **Community Support Services**
   - Food bank and community kitchen service
   - Elder care and companionship programs
   - New family assistance and integration
   - Emergency community support coordination
   - Islamic counseling and guidance support

4. **Youth & Family Programs**
   - Islamic youth mentorship
   - Family activity coordination
   - Islamic summer camp counseling
   - Community sports and recreation leadership
   - Islamic arts and culture program assistance

5. **Administrative & Technical Support**
   - Community newsletter and communication
   - Website and social media management
   - Financial assistance program coordination
   - Community database management
   - Islamic resource development and curation

TECHNICAL ARCHITECTURE:
```typescript
interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  category: VolunteerCategory;
  islamicReward: string; // Spiritual benefit explanation
  timeCommitment: TimeCommitment;
  skillsRequired: Skill[];
  ageRequirement: AgeRange;
  genderPreference?: 'male' | 'female' | 'any';
  location: VolunteerLocation;
  coordinator: CommunityCoordinator;
  islamicGuidance: IslamicVolunteerGuidance;
  impactMetrics: CommunityImpactData;
}

interface VolunteerProfile {
  userId: string;
  skills: Skill[];
  interests: VolunteerCategory[];
  availability: AvailabilitySchedule;
  islamicKnowledge: KnowledgeLevel;
  languages: string[];
  volunteerHistory: VolunteerExperience[];
  communityRecommendations: Recommendation[];
}
```

ISLAMIC INTEGRATION FEATURES:
- Connection between volunteer work and Islamic teachings
- Hadith and Quranic verses related to community service
- Spiritual reward (Thawab) explanations for each opportunity
- Integration with prayer times and Islamic calendar
- Emphasis on community building (Ummah strengthening)
- Islamic ethics in volunteer work guidance

MATCHING & RECOMMENDATION SYSTEM:
- Skill-based volunteer opportunity matching
- Islamic knowledge level appropriate assignments
- Time availability and commitment matching
- Language preference coordination
- Cultural background considerations
- Personal interest and passion alignment

COMMUNITY IMPACT TRACKING:
- Individual volunteer hour tracking
- Community service impact metrics
- Islamic community strengthening measurements
- Family volunteer participation tracking
- Volunteer appreciation and recognition system
- Community testimonials and success stories

TRAINING & DEVELOPMENT:
- Islamic volunteer ethics training modules
- Community service skills development
- Cultural sensitivity training for diverse volunteers
- Islamic knowledge prerequisites for teaching roles
- Leadership development through service
- Ongoing education and improvement programs

COORDINATION & COMMUNICATION:
- Volunteer team coordination tools
- Community event planning integration
- Emergency volunteer mobilization system
- Regular volunteer appreciation events
- Mentor-mentee pairing for new volunteers
- Cross-cultural volunteer collaboration

ACCESSIBILITY & INCLUSION:
- Accommodation for volunteers with disabilities
- Flexible scheduling for working professionals
- Family-friendly volunteer opportunities
- Elderly volunteer integration and support
- Youth volunteer development programs
- Convert-friendly volunteer orientation

SPIRITUAL DEVELOPMENT INTEGRATION:
- Volunteer work reflection and journaling
- Islamic character building through service
- Community prayer integration with volunteer work
- Dhikr (remembrance) practices during service
- Islamic community building focus
- Personal spiritual growth tracking through service

RECOGNITION & APPRECIATION:
- Islamic volunteer appreciation ceremonies
- Community recognition for outstanding service
- Volunteer achievement certificates and awards
- Public acknowledgment in community communications
- Islamic blessing and du'a recognition
- Volunteer legacy documentation for community history

EMERGENCY VOLUNTEER MOBILIZATION:
- Crisis response volunteer coordination
- Natural disaster community support
- Community member emergency assistance
- Rapid response volunteer communication system
- Emergency skill-based volunteer deployment
- Community resilience building through organized volunteerism

FAMILY VOLUNTEER INTEGRATION:
- Family volunteer opportunities and projects
- Parent-child volunteer activities
- Multi-generational community service projects
- Family Islamic service traditions development
- Household volunteer coordination and scheduling
- Family community impact tracking and celebration

MOBILE OPTIMIZATION:
- Mobile volunteer opportunity browsing and sign-up
- Real-time volunteer coordination and communication
- Mobile check-in and hour tracking
- Push notifications for volunteer opportunities
- Mobile volunteer community networking
- Offline access to essential volunteer information

COMMUNITY PARTNERSHIPS:
- Local mosque volunteer integration
- Islamic organization partnership coordination
- Interfaith volunteer collaboration opportunities
- Community business volunteer partnerships
- Educational institution volunteer connections
- Healthcare and social service volunteer coordination

The component should inspire community members to view volunteer work as both a spiritual practice and community building activity, creating a culture of service that strengthens the entire Islamic community while serving the broader American society.
```

---

## 10. Contact & Location Information

### Comprehensive Community Connection Hub

**Prompt for AI Tools:**
```
Develop a comprehensive Contact & Location Information component that serves as the central communication hub for Islamic community members, providing multiple ways to connect with mosque leadership, community services, and emergency assistance:

CONTACT INFORMATION STRUCTURE:

1. **Primary Mosque Contacts**
   - Imam contact information with office hours
   - Assistant Imam and religious scholars
   - Mosque administration and office staff
   - Community board members and leadership
   - Emergency contact for urgent Islamic matters

2. **Specialized Service Contacts**
   - Islamic counseling and guidance services
   - Youth program coordinators
   - Women's community program leaders
   - Educational program administrators
   - Community outreach and dawah coordinators

3. **Administrative Services**
   - General mosque inquiries and information
   - Event planning and community hall rental
   - Islamic marriage and ceremony coordination
   - Financial assistance program contacts
   - Volunteer coordination and community service

4. **Emergency & Crisis Support**
   - 24/7 Islamic crisis counseling hotline
   - Emergency financial assistance contacts
   - Community support network activation
   - Interfaith crisis support coordination
   - Mental health and family counseling services

TECHNICAL IMPLEMENTATION:
```typescript
interface CommunityContact {
  id: string;
  name: string;
  title: string;
  role: ContactRole;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  officeHours: OfficeSchedule;
  languages: string[];
  specializations: string[];
  emergencyAvailability: boolean;
  preferredContactMethod: 'phone' | 'email' | 'text' | 'in_person';
}

interface MosqueLocation {
  name: string;
  address: Address;
  coordinates: GeoCoordinates;
  prayerHallCapacity: number;
  parkingAvailability: ParkingInfo;
  accessibilityFeatures: AccessibilityInfo;
  publicTransportation: TransportInfo;
  nearbyLandmarks: string[];
}
```

INTERACTIVE MAP FEATURES:
- High-resolution mosque location mapping
- Prayer time integration with location services
- Parking availability and guidance
- Public transportation integration
- Accessibility route planning
- Nearby halal restaurant and service mapping

COMMUNICATION PREFERENCES:
- Multiple contact method options (phone, email, text, video call)
- Language preference indication for non-English speakers
- Cultural background accommodation requests
- Gender preference for sensitive discussions
- Family vs. individual consultation options
- Emergency vs. non-urgent contact routing

ACCESSIBILITY FEATURES:
- Large text and high contrast display options
- Screen reader compatible contact information
- Voice dialing integration for elderly community members
- Multiple language contact information display
- Simple navigation for emergency situations
- Visual impairment accommodation features

COMMUNITY SERVICE INTEGRATION:
- Service request forms for various community needs
- Community support network contact activation
- Volunteer coordination and assistance requests
- Educational program inquiry and registration
- Community event planning and coordination assistance
- New member welcome and integration services

EMERGENCY PROTOCOLS:
- Crisis counseling immediate contact options
- Emergency financial assistance rapid response
- Community safety and security contact procedures
- Medical emergency Islamic guidance hotline
- Family crisis intervention and support coordination
- Interfaith and community relations emergency contacts

CULTURAL SENSITIVITY FEATURES:
- Gender-appropriate contact routing options
- Cultural background consideration in contact assignment
- Language-specific community leader connections
- Convert-friendly guidance and mentorship contacts
- Interfaith family support and guidance contacts
- Community integration assistance for new Americans

OFFICE HOURS & AVAILABILITY:
- Real-time availability status for community leaders
- Prayer time integrated scheduling (avoiding prayer conflicts)
- Islamic calendar and holiday availability updates
- Emergency contact protocols and after-hours procedures
- Community event and program scheduling coordination
- Personal consultation appointment booking system

MOBILE OPTIMIZATION:
- One-touch calling for all contact numbers
- Mobile-friendly contact information display
- GPS integration for location and directions
- Mobile contact sharing and saving capabilities
- Push notification integration for important updates
- Offline access to essential emergency contacts

FEEDBACK & IMPROVEMENT:
- Community feedback system for contact experiences
- Service quality rating and improvement tracking
- Communication effectiveness measurement
- Community suggestion and improvement requests
- Response time tracking and optimization
- Community satisfaction monitoring and enhancement

PRIVACY & SECURITY:
- Secure contact information management
- Privacy protection for sensitive communications
- Confidentiality assurance for personal consultations
- Secure channel communication for sensitive matters
- Community member information protection
- Trust verification for all community contacts

INTEGRATION CAPABILITIES:
- Islamic calendar and prayer time synchronization
- Community event coordination and communication
- Educational program registration and inquiry routing
- Volunteer opportunity coordination and sign-up
- Emergency community network activation
- Interfaith and community relations coordination

COMMUNITY BUILDING FEATURES:
- New member welcome and integration contact system
- Community mentorship and guidance connections
- Family support and assistance coordination
- Youth program engagement and guidance
- Elder care and community support connections
- Community celebration and event coordination

The component should make community members feel that help, guidance, and connection are always available, fostering a sense of belonging and support that is essential to Islamic community life while respecting individual privacy and cultural preferences.
```

---

## Implementation Guidelines

### General AI Tool Usage Instructions

When using these prompts with AI tools like v0, Lovable, or Cursor:

1. **Start with Design System**: Begin each component with the Islamic color palette and typography specifications
2. **Mobile-First Approach**: Always implement responsive design starting with mobile layouts
3. **Accessibility Priority**: Include WCAG 2.1 AA compliance in every component
4. **Cultural Authenticity**: Test Arabic text rendering and RTL support
5. **Islamic Integration**: Ensure prayer times, Islamic calendar, and cultural sensitivity are maintained

### Component Integration Strategy

1. **Modular Architecture**: Each component should work independently and as part of the larger ecosystem
2. **Data Consistency**: Use shared TypeScript interfaces across components
3. **State Management**: Implement consistent state management patterns
4. **API Integration**: Design with real API endpoints in mind
5. **Testing Strategy**: Include accessibility testing and cultural appropriateness validation

### Quality Assurance Checklist

- [ ] Islamic design principles respected
- [ ] Arabic text and RTL support functional
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Mobile-responsive across all devices
- [ ] Cultural sensitivity maintained
- [ ] Prayer time integration working
- [ ] Family-friendly interface design
- [ ] Elder-accessible navigation
- [ ] Community values aligned
- [ ] Performance optimized

---

## Conclusion

These prompts provide comprehensive specifications for creating culturally authentic, accessible, and functionally robust Islamic community website components. Each prompt balances technical requirements with cultural sensitivity, ensuring that the resulting UI components serve the diverse needs of American Muslim families while maintaining Islamic authenticity and modern web standards.

The prompts are designed to work with any AI UI generation tool and can be customized further based on specific community needs and technical requirements.