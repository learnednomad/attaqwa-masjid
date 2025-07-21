'use client';

import { AnnouncementCard } from '@/components/features/announcements/announcement-card';
import { EventCard } from '@/components/features/events/event-card';
import { CalendarDownload } from '@/components/features/calendar/calendar-download';
import { PrayerTimesWidget } from '@/components/features/prayer-times/prayer-times-widget';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Calendar, Clock, Download } from 'lucide-react';
import Link from 'next/link';
import { Announcement, Event, Calendar as CalendarType, DailyPrayerTimes } from '@/types';

// Mock data - replace with actual API calls
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Eid ul-Fitr 2025 Celebration',
    content: '<p>Join us for Eid ul-Fitr prayers and celebration. <strong>First prayer:</strong> 8:00 AM, <strong>Second prayer:</strong> 9:30 AM. Outdoor prayer arrangements available. Please bring your prayer rugs.</p><ul><li>Family-friendly activities</li><li>Community lunch following prayers</li><li>Parking available at nearby locations</li></ul>',
    date: new Date('2025-03-30'),
    time: '8:00 AM & 9:30 AM',
    isActive: true,
    isArchived: false,
    createdAt: new Date('2025-03-15'),
    updatedAt: new Date('2025-03-20'),
  },
  {
    id: '2',
    title: 'Ramadan Taraweh Prayers',
    content: '<p>Daily Taraweh prayers during Ramadan. Join us for these special evening prayers.</p>',
    date: new Date('2025-02-28'),
    time: '9:00 PM',
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
    startTime: '8:00 AM',
    endTime: '11:00 AM',
    location: 'Masjid At-Taqwa',
    isIndoor: true,
    isOutdoor: true,
    prayerTimes: [
      { name: '1st Prayer', time: '8:00 AM', location: 'Main Hall' },
      { name: '2nd Prayer', time: '9:30 AM', location: 'Outdoor Area' },
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
  date: '2025-07-20',
  fajr: '4:32 AM',
  sunrise: '6:15 AM',
  dhuhr: '1:15 PM',
  asr: '5:45 PM',
  maghrib: '8:20 PM',
  isha: '9:45 PM',
  qibla: 58.5,
};

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="islamic-pattern rounded-xl bg-gradient-to-r from-islamic-green-600 to-islamic-green-700 p-8 text-white md:p-12">
        <div className="max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Welcome to Masjid At-Taqwa
          </h1>
          <p className="mb-6 text-lg opacity-90 md:text-xl">
            A place of worship, community, and spiritual growth. Join us for daily prayers,
            special events, and Islamic education in a welcoming environment.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/prayer-times">
              <Button size="lg" variant="secondary" className="gap-2">
                <Clock className="h-4 w-4" />
                Prayer Times
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white hover:text-islamic-green-600">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Recent Announcements */}
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-islamic-navy-800">Recent Announcements</h2>
              <Link href="/announcements">
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6">
              {mockAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-islamic-navy-800">Upcoming Events</h2>
              <Link href="/events">
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6">
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>

          {/* Calendar Downloads */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-islamic-navy-800">Islamic Calendar</h2>
              <Link href="/calendar">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-3 w-3" />
                  All Downloads
                </Button>
              </Link>
            </div>
            <div className="grid gap-4">
              {mockCalendars.map((calendar) => (
                <CalendarDownload key={calendar.id} calendar={calendar} compact />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Prayer Times Widget */}
          <PrayerTimesWidget 
            prayerTimes={mockPrayerTimes} 
            currentPrayer="dhuhr"
          />

          {/* Quick Actions */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 font-semibold text-islamic-navy-800">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/donate" className="block">
                <Button className="w-full justify-start gap-2" variant="outline">
                  💚 Make a Donation
                </Button>
              </Link>
              <Link href="/contact" className="block">
                <Button className="w-full justify-start gap-2" variant="outline">
                  📧 Contact Us
                </Button>
              </Link>
              <Link href="/about" className="block">
                <Button className="w-full justify-start gap-2" variant="outline">
                  🏛️ About the Mosque
                </Button>
              </Link>
            </div>
          </div>

          {/* Community Notice */}
          <div className="rounded-lg bg-islamic-gold-50 border border-islamic-gold-200 p-6">
            <h3 className="mb-2 font-semibold text-islamic-gold-800">Community Notice</h3>
            <p className="text-sm text-islamic-gold-700">
              Please ensure to follow mosque etiquette during prayers. 
              Remove shoes before entering the prayer hall and maintain silence during services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}