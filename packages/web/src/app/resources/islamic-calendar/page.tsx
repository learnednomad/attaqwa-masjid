'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Moon, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchIslamicCalendar } from '@/lib/services/islamic-api';

interface IslamicDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

const islamicMonths = [
  { number: 1, name: 'Muharram', arabic: 'محرّم', days: 30, significance: 'Sacred month, New Year, Day of Ashura' },
  { number: 2, name: 'Safar', arabic: 'صفر', days: 29, significance: 'Month of travel and migration' },
  { number: 3, name: "Rabi' al-awwal", arabic: 'ربيع الأول', days: 30, significance: "Prophet Muhammad's ﷺ birth month" },
  { number: 4, name: "Rabi' al-thani", arabic: 'ربيع الآخر', days: 29, significance: 'Second spring month' },
  { number: 5, name: 'Jumada al-awwal', arabic: 'جمادى الأولى', days: 30, significance: 'First month of dryness' },
  { number: 6, name: 'Jumada al-thani', arabic: 'جمادى الآخرة', days: 29, significance: 'Second month of dryness' },
  { number: 7, name: 'Rajab', arabic: 'رجب', days: 30, significance: 'Sacred month, Isra and Miraj' },
  { number: 8, name: "Sha'ban", arabic: 'شعبان', days: 29, significance: 'Month of preparation for Ramadan' },
  { number: 9, name: 'Ramadan', arabic: 'رمضان', days: 30, significance: 'Month of fasting, Quran revelation' },
  { number: 10, name: 'Shawwal', arabic: 'شوّال', days: 29, significance: 'Eid al-Fitr, six days of Shawwal' },
  { number: 11, name: "Dhu al-Qi'dah", arabic: 'ذو القعدة', days: 30, significance: 'Sacred month, preparation for Hajj' },
  { number: 12, name: 'Dhu al-Hijjah', arabic: 'ذو الحجة', days: 29, significance: 'Month of Hajj, Eid al-Adha' },
];

const islamicEvents = [
  { date: '1 Muharram', name: 'Islamic New Year', arabic: 'رأس السنة الهجرية', type: 'celebration' },
  { date: '10 Muharram', name: 'Day of Ashura', arabic: 'يوم عاشوراء', type: 'important' },
  { date: '12 Rabi al-awwal', name: "Mawlid an-Nabi", arabic: 'المولد النبوي', type: 'celebration' },
  { date: '27 Rajab', name: 'Isra and Miraj', arabic: 'الإسراء والمعراج', type: 'important' },
  { date: '15 Shaban', name: "Laylat al-Bara'at", arabic: 'ليلة البراءة', type: 'special' },
  { date: '1 Ramadan', name: 'First day of Ramadan', arabic: 'أول رمضان', type: 'important' },
  { date: '27 Ramadan', name: 'Laylat al-Qadr', arabic: 'ليلة القدر', type: 'special' },
  { date: '1 Shawwal', name: 'Eid al-Fitr', arabic: 'عيد الفطر', type: 'celebration' },
  { date: '9 Dhu al-Hijjah', name: 'Day of Arafah', arabic: 'يوم عرفة', type: 'important' },
  { date: '10 Dhu al-Hijjah', name: 'Eid al-Adha', arabic: 'عيد الأضحى', type: 'celebration' },
];

export default function IslamicCalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [islamicDate, setIslamicDate] = useState<IslamicDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    loadIslamicDate();
  }, [currentDate]);

  const loadIslamicDate = async () => {
    setLoading(true);
    try {
      const data = await fetchIslamicCalendar(currentDate);
      setIslamicDate(data);
      if (data && data.month) {
        setSelectedMonth(data.month.number);
        calculateUpcomingEvents(data);
      }
    } catch (error) {
      console.error('Error loading Islamic date:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUpcomingEvents = (islamicData: IslamicDate) => {
    // Filter and sort upcoming events based on current Islamic date
    const currentMonth = islamicData.month.number;
    const currentDay = parseInt(islamicData.day);
    
    const upcoming = islamicEvents
      .map(event => {
        const [day, month] = event.date.split(' ');
        const monthNum = islamicMonths.find(m => m.name === month)?.number || 0;
        const dayNum = parseInt(day);
        
        // Calculate days until event
        let daysUntil = 0;
        if (monthNum > currentMonth) {
          daysUntil = (monthNum - currentMonth) * 30 + (dayNum - currentDay);
        } else if (monthNum === currentMonth && dayNum > currentDay) {
          daysUntil = dayNum - currentDay;
        } else {
          // Event is next year
          daysUntil = (12 - currentMonth + monthNum) * 30 + dayNum;
        }
        
        return { ...event, daysUntil, monthNum, dayNum };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
    
    setUpcomingEvents(upcoming);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'celebration':
        return 'bg-islamic-gold-100 text-islamic-gold-700 border-islamic-gold-200';
      case 'important':
        return 'bg-islamic-green-100 text-islamic-green-700 border-islamic-green-200';
      case 'special':
        return 'bg-islamic-navy-100 text-islamic-navy-700 border-islamic-navy-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green-50 via-white to-islamic-gold-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-islamic-navy-800 mb-4">
            📅 Islamic Calendar
          </h1>
          <p className="text-xl text-islamic-navy-600 max-w-3xl mx-auto">
            Hijri calendar with important Islamic dates, events, and observances
          </p>
        </div>

        {loading ? (
          <Card className="mb-12">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green-600 mx-auto"></div>
                <p className="mt-4 text-islamic-navy-600">Loading Islamic calendar...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Today's Date Display */}
            <Card className="mb-12 bg-gradient-to-r from-islamic-navy-500 to-islamic-navy-600 text-white border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Today's Date
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {islamicDate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Islamic Date */}
                    <div className="text-center md:text-left">
                      <p className="text-white/80 mb-2">Hijri Date</p>
                      <p className="text-4xl font-bold mb-2">
                        {islamicDate.day} {islamicDate.month.en}
                      </p>
                      <p className="text-2xl font-arabic mb-2" dir="rtl">
                        {islamicDate.day} {islamicDate.month.ar}
                      </p>
                      <p className="text-xl">
                        Year {islamicDate.year} AH
                      </p>
                    </div>

                    {/* Gregorian Date */}
                    <div className="text-center md:text-right">
                      <p className="text-white/80 mb-2">Gregorian Date</p>
                      <p className="text-4xl font-bold mb-2">
                        {currentDate.getDate()} {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                      </p>
                      <p className="text-xl">
                        {currentDate.getFullYear()} CE
                      </p>
                      <p className="text-white/80 mt-2">
                        {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Special Day Notification */}
                {islamicDate?.holidays && islamicDate.holidays.length > 0 && (
                  <div className="mt-6 p-4 bg-white/20 rounded-lg">
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Today is: {islamicDate.holidays.join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Islamic Months */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Islamic Months</CardTitle>
                <CardDescription>The twelve months of the Hijri calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {islamicMonths.map((month) => (
                    <div
                      key={month.number}
                      className={`border rounded-lg p-4 transition-all ${
                        selectedMonth === month.number
                          ? 'border-islamic-green-500 bg-islamic-green-50'
                          : 'border-gray-200 hover:border-islamic-green-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-islamic-navy-800">
                            {month.number}. {month.name}
                          </h3>
                          <p className="text-lg font-arabic text-islamic-navy-600" dir="rtl">
                            {month.arabic}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {month.days} days
                        </Badge>
                      </div>
                      <p className="text-sm text-islamic-navy-600">
                        {month.significance}
                      </p>
                      {month.number === 1 || month.number === 7 || month.number === 11 || month.number === 12 ? (
                        <Badge className="mt-2 bg-islamic-gold-100 text-islamic-gold-700 border-islamic-gold-200">
                          Sacred Month
                        </Badge>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Upcoming Islamic Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-islamic-green-100 rounded-lg flex items-center justify-center">
                            {event.type === 'celebration' ? '🎉' : event.type === 'important' ? '⭐' : '🌙'}
                          </div>
                          <div>
                            <p className="font-semibold text-islamic-navy-800">{event.name}</p>
                            <p className="text-sm text-islamic-navy-600">{event.arabic}</p>
                          </div>
                        </div>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.daysUntil === 0 ? 'Today' : `${event.daysUntil} days`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Moon Phases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-32 h-32 bg-islamic-navy-100 rounded-full flex items-center justify-center">
                        <Moon className="w-20 h-20 text-islamic-navy-600" />
                      </div>
                    </div>
                    <p className="text-center text-islamic-navy-600">
                      The Islamic calendar follows lunar cycles. Each month begins with the sighting of the new crescent moon.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-islamic-navy-50 rounded text-center">
                        <p className="font-semibold">New Moon</p>
                        <p className="text-islamic-navy-600">Month begins</p>
                      </div>
                      <div className="p-2 bg-islamic-navy-50 rounded text-center">
                        <p className="font-semibold">Full Moon</p>
                        <p className="text-islamic-navy-600">Mid-month</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Important Notes */}
            <Card className="bg-islamic-gold-50 border-islamic-gold-200">
              <CardHeader>
                <CardTitle className="text-xl">About the Islamic Calendar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-islamic-gold-600 mt-0.5" />
                  <p className="text-sm text-islamic-navy-600">
                    The Islamic (Hijri) calendar is a lunar calendar consisting of 12 months and 354 or 355 days
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-islamic-gold-600 mt-0.5" />
                  <p className="text-sm text-islamic-navy-600">
                    It began with the Hijra (migration) of Prophet Muhammad ﷺ from Makkah to Madinah in 622 CE
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-islamic-gold-600 mt-0.5" />
                  <p className="text-sm text-islamic-navy-600">
                    Four months are considered sacred: Muharram, Rajab, Dhu al-Qidah, and Dhu al-Hijjah
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-islamic-gold-600 mt-0.5" />
                  <p className="text-sm text-islamic-navy-600">
                    Dates may vary by 1-2 days depending on moon sighting and geographical location
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}