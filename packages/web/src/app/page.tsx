import { AnnouncementCard } from '@/components/features/announcements/announcement-card';
import { EventCard } from '@/components/features/events/event-card';
import { CalendarDownload } from '@/components/features/calendar/calendar-download';
import { PrayerTimesWidget } from '@/components/features/prayer-times/prayer-times-widget';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Calendar, Clock, Download } from 'lucide-react';
import Link from 'next/link';
import { Announcement, Event, Calendar as CalendarType, DailyPrayerTimes } from '@/types';
import { generateSEOMetadata, generatePrayerTimesStructuredData, generateEventStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
  title: "Welcome to Masjid At-Taqwa - Islamic Community Center",
  description: "Join Masjid At-Taqwa for daily prayers, Islamic education, community events, and spiritual guidance. Find prayer times, upcoming events, Ramadan activities, and Islamic learning resources.",
  keywords: [
    "masjid at-taqwa",
    "islamic community center",
    "daily prayers",
    "prayer times",
    "islamic education",
    "muslim community",
    "jummah prayers",
    "ramadan calendar",
    "eid celebrations",
    "islamic events",
    "quran classes",
    "islamic studies"
  ],
  canonical: "/",
  type: "website"
});

// Real data from Masjid At-Taqwa website
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Eid ul-Fitr Sunday March 30, 2025',
    content: '<p>Insha\'Allah Eid will be on Sunday March 30, 2025. <strong>Zakat ul Fitr $10/person</strong> and should be paid prior to Eid ul Fitr Salah.</p><p>As always, 1st Salah, we will be praying outside in the parking lot. 2nd Salah will be inside the masjid.</p><ul><li><strong>1st Salah:</strong> 8:30am</li><li><strong>2nd Salah:</strong> 9:30am</li><li>We are humbly requesting everyone to come in a group instead of individual cars due to limited parking space</li><li>Please follow the direction of our volunteer brothers for parking</li></ul>',
    date: new Date('2025-03-30'),
    time: '8:30 AM & 9:30 AM',
    isActive: true,
    isArchived: false,
    createdAt: new Date('2025-03-15'),
    updatedAt: new Date('2025-03-20'),
  },
  {
    id: '2',
    title: 'Eid-Al-Adha Friday June 6th, 2025',
    content: '<p>Insha\'Allah Eid-Al-Adha will be on Friday June 6th, 2025.</p><p>As always, 1st Salah, we will be praying outside in the parking lot. 2nd Salah will be inside the masjid.</p><ul><li><strong>1st Salah:</strong> 8:00am</li><li><strong>2nd Salah:</strong> 9:00am</li><li>We are humbly requesting everyone to come in a group instead of individual cars due to limited parking space</li><li>Please follow the direction of our volunteer brothers for parking</li></ul>',
    date: new Date('2025-06-06'),
    time: '8:00 AM & 9:00 AM',
    isActive: true,
    isArchived: false,
    createdAt: new Date('2025-03-15'),
    updatedAt: new Date('2025-03-20'),
  },
  {
    id: '3',
    title: 'Ramadan Mubarak - Tarawee and Daily Programs',
    content: '<p><strong>RAMADAN MUBARAK!!!</strong> InshaAllah, we will have our 1st Tarawee tonight after Isha and it will be 20 rakhat.</p><ul><li>Daily brief tafseer and dua will start before maghrib</li><li>Daily Tahajjud will start at 4:45am</li><li>Community iftar will be served throughout the month of ramadan</li><li><strong>Tarawee Prayer:</strong> 20 rakhat after Isha prayer</li></ul>',
    date: new Date('2025-02-28'),
    time: 'After Isha & 4:45 AM',
    isActive: true,
    isArchived: false,
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-02-25'),
  },
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Eid ul-Fitr 2025',
    description: 'Celebrate the end of Ramadan with our community. Multiple prayer times available with outdoor arrangements.',
    date: new Date('2025-03-30'),
    startTime: '8:30 AM',
    endTime: '11:00 AM',
    location: 'Masjid At-Taqwa',
    isIndoor: true,
    isOutdoor: true,
    prayerTimes: [
      { name: '1st Prayer', time: '8:30 AM', location: 'Parking Lot (Outdoor)' },
      { name: '2nd Prayer', time: '9:30 AM', location: 'Inside Masjid' },
    ],
    zakatInfo: {
      amount: 10,
      currency: 'USD',
      description: 'per person',
    },
    isActive: true,
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-15'),
  },
  {
    id: '2',
    title: 'Eid-Al-Adha 2025',
    description: 'Join us for Eid-Al-Adha prayers and celebration. Multiple prayer times with outdoor and indoor arrangements.',
    date: new Date('2025-06-06'),
    startTime: '8:00 AM',
    endTime: '10:30 AM',
    location: 'Masjid At-Taqwa',
    isIndoor: true,
    isOutdoor: true,
    prayerTimes: [
      { name: '1st Prayer', time: '8:00 AM', location: 'Parking Lot (Outdoor)' },
      { name: '2nd Prayer', time: '9:00 AM', location: 'Inside Masjid' },
    ],
    isActive: true,
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-15'),
  },
  {
    id: '3',
    title: 'Hifz Graduation 2025',
    description: 'Celebrating the achievement of students who have completed memorization of the Holy Quran.',
    date: new Date('2025-06-15'),
    startTime: '6:00 PM',
    endTime: '8:00 PM',
    location: 'Masjid At-Taqwa',
    isIndoor: true,
    isOutdoor: false,
    isActive: true,
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-15'),
  },
];

const mockCalendars: CalendarType[] = [
  {
    id: '1',
    title: 'Ramadan Calendar 2025/1446',
    description: 'Complete Ramadan schedule with Suhur and Iftar times',
    fileUrl: '/calendars/ramadan-2025.pdf',
    fileName: 'ramadan-calendar-2025.pdf',
    fileSize: 2048576,
    year: 2025,
    isActive: true,
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-15'),
  },
];

const mockPrayerTimes: DailyPrayerTimes = {
  date: '2025-08-26',
  fajr: '5:41 AM',
  sunrise: '7:07 AM', 
  dhuhr: '1:40 PM',
  asr: '5:19 PM',
  maghrib: '8:15 PM',
  isha: '9:34 PM',
  qibla: 58.5,
  iqama: {
    fajr: '6:15 AM',
    dhuhr: '2:00 PM',
    asr: '6:30 PM',
    maghrib: '+5 min',
    isha: '10:00 PM',
  },
  jummah: ['2:00 PM', '2:30 PM'],
};

export default function Home() {
  // Generate structured data for the homepage with error handling
  let prayerTimesStructuredData = null;
  let eventsStructuredData: any[] = [];
  let breadcrumbStructuredData = null;

  try {
    prayerTimesStructuredData = generatePrayerTimesStructuredData(mockPrayerTimes, mockPrayerTimes.date);
  } catch (error) {
    console.warn('Failed to generate prayer times structured data:', error);
  }

  try {
    eventsStructuredData = mockEvents.map(event => generateEventStructuredData(event));
  } catch (error) {
    console.warn('Failed to generate events structured data:', error);
  }

  try {
    breadcrumbStructuredData = generateBreadcrumbStructuredData([
      { name: 'Home', url: '/' }
    ]);
  } catch (error) {
    console.warn('Failed to generate breadcrumb structured data:', error);
  }

  return (
    <>
      {/* Structured Data for SEO */}
      {prayerTimesStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(prayerTimesStructuredData),
          }}
        />
      )}
      {eventsStructuredData.map((eventData, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventData),
          }}
        />
      ))}
      {breadcrumbStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="islamic-pattern rounded-xl bg-gradient-to-r from-islamic-green-600 to-islamic-green-700 p-8 text-white md:p-12" role="banner">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Welcome to Masjid At-Taqwa
            </h1>
            <p className="mb-6 text-lg opacity-90 md:text-xl">
              Your local Islamic community center providing daily prayer services, comprehensive Islamic education, and spiritual guidance. Join our welcoming Muslim community for Jummah prayers, Ramadan activities, Eid celebrations, and year-round Islamic learning programs.
            </p>
            <nav className="flex flex-col gap-3 sm:flex-row" role="navigation" aria-label="Quick actions">
              <Link href="/prayer-times" aria-label="View today's prayer times schedule">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Prayer Times
                </Button>
              </Link>
              <Link href="/events" aria-label="Browse upcoming Islamic events and activities">
                <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white hover:text-islamic-green-600">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Upcoming Events
                </Button>
              </Link>
            </nav>
          </div>
        </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <article className="lg:col-span-2">
          {/* Recent Announcements */}
          <section className="mb-12" aria-labelledby="announcements-heading">
            <header className="mb-6 flex items-center justify-between">
              <h2 id="announcements-heading" className="text-2xl font-bold text-islamic-navy-800">
                Recent Islamic Community Announcements
              </h2>
              <Link href="/announcements" aria-label="View all mosque announcements">
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Button>
              </Link>
            </header>
            <div className="grid gap-6" role="feed" aria-label="Latest announcements">
              {mockAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
            <p className="mt-4 text-sm text-islamic-navy-600">
              Stay updated with important mosque announcements, Eid celebrations, Ramadan schedules, and community activities.
            </p>
          </section>

          {/* Upcoming Events */}
          <section className="mb-12" aria-labelledby="events-heading">
            <header className="mb-6 flex items-center justify-between">
              <h2 id="events-heading" className="text-2xl font-bold text-islamic-navy-800">
                Upcoming Islamic Events & Activities
              </h2>
              <Link href="/events" aria-label="Browse all Islamic events and programs">
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Button>
              </Link>
            </header>
            <div className="grid gap-6" role="list" aria-label="Upcoming events">
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <p className="mt-4 text-sm text-islamic-navy-600">
              Join our Islamic community events including Eid prayers, Ramadan programs, educational workshops, and family gatherings.
            </p>
          </section>

          {/* Calendar Downloads */}
          <section aria-labelledby="calendar-heading">
            <header className="mb-6 flex items-center justify-between">
              <h2 id="calendar-heading" className="text-2xl font-bold text-islamic-navy-800">
                Islamic Calendar Downloads
              </h2>
              <Link href="/calendar" aria-label="Download all Islamic calendar resources">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-3 w-3" aria-hidden="true" />
                  All Downloads
                </Button>
              </Link>
            </header>
            <div className="grid gap-4" role="list" aria-label="Available Islamic calendars">
              {mockCalendars.map((calendar) => (
                <CalendarDownload key={calendar.id} calendar={calendar} compact />
              ))}
            </div>
            <p className="mt-4 text-sm text-islamic-navy-600">
              Download Ramadan calendars, prayer time schedules, and Islamic holiday dates for your convenience.
            </p>
          </section>
        </article>

        {/* Sidebar */}
        <aside className="space-y-8" role="complementary" aria-label="Prayer times and community information">
          {/* Prayer Times Widget */}
          <section aria-labelledby="prayer-times-sidebar">
            <h3 id="prayer-times-sidebar" className="sr-only">Daily Prayer Times</h3>
            <PrayerTimesWidget 
              prayerTimes={mockPrayerTimes} 
              currentPrayer="dhuhr"
            />
          </section>

          {/* Quick Actions */}
          <section className="rounded-lg border bg-card p-6" aria-labelledby="quick-actions-heading">
            <h3 id="quick-actions-heading" className="mb-4 font-semibold text-islamic-navy-800">
              Quick Actions
            </h3>
            <nav className="space-y-3" role="navigation" aria-label="Quick access links">
              <Link href="/donate" className="block" aria-label="Make a donation to support the mosque">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <span aria-hidden="true">💚</span> Make a Donation (Zakat & Sadaqah)
                </Button>
              </Link>
              <Link href="/contact" className="block" aria-label="Contact mosque administration">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <span aria-hidden="true">📧</span> Contact Us
                </Button>
              </Link>
              <Link href="/about" className="block" aria-label="Learn about our Islamic center">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <span aria-hidden="true">🏛️</span> About the Mosque
                </Button>
              </Link>
              <Link href="/education" className="block" aria-label="Browse Islamic education programs">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <span aria-hidden="true">📚</span> Islamic Education
                </Button>
              </Link>
            </nav>
          </section>

          {/* Community Notice */}
          <section className="rounded-lg bg-islamic-gold-50 border border-islamic-gold-200 p-6" aria-labelledby="community-notice-heading">
            <h3 id="community-notice-heading" className="mb-2 font-semibold text-islamic-gold-800">
              Mosque Etiquette & Guidelines
            </h3>
            <div className="text-sm text-islamic-gold-700 space-y-2">
              <p>
                Please observe Islamic etiquette during prayers:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Remove shoes before entering the prayer hall</li>
                <li>Maintain silence during prayer services</li>
                <li>Dress modestly and appropriately</li>
                <li>Turn off mobile devices during prayers</li>
              </ul>
              <p className="mt-3">
                <strong>Jummah Prayer:</strong> Fridays at 2:00 PM & 2:30 PM - Arrive early for the best experience.
              </p>
            </div>
          </section>

          {/* Islamic Resources */}
          <section className="rounded-lg border bg-card p-6" aria-labelledby="resources-heading">
            <h3 id="resources-heading" className="mb-4 font-semibold text-islamic-navy-800">
              Islamic Resources
            </h3>
            <nav className="space-y-3" role="navigation" aria-label="Islamic learning resources">
              <Link href="/education/quran" className="block text-sm text-islamic-navy-600 hover:text-islamic-green-600">
                📖 Quran Study & Tafsir
              </Link>
              <Link href="/education/hadith" className="block text-sm text-islamic-navy-600 hover:text-islamic-green-600">
                📚 Hadith Collections
              </Link>
              <Link href="/prayer-times/qibla" className="block text-sm text-islamic-navy-600 hover:text-islamic-green-600">
                🧭 Qibla Direction
              </Link>
              <Link href="/calendar/hijri" className="block text-sm text-islamic-navy-600 hover:text-islamic-green-600">
                🗓️ Islamic Calendar
              </Link>
            </nav>
          </section>
        </aside>
      </div>
    </div>
    </>
  );
}