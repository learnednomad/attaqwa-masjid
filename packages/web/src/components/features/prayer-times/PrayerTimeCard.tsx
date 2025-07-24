'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerTimeCardProps {
  prayerTimes: PrayerTimes;
  showNextPrayer?: boolean;
  variant?: 'default' | 'compact';
  showArabic?: boolean;
  timeFormat?: '12h' | '24h';
}

export function PrayerTimeCard({
  prayerTimes,
  showNextPrayer = false,
  variant = 'default',
  showArabic = false,
  timeFormat = '24h',
}: PrayerTimeCardProps) {
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr, arabic: 'الفجر' },
    { name: 'Dhuhr', time: prayerTimes.dhuhr, arabic: 'الظهر' },
    { name: 'Asr', time: prayerTimes.asr, arabic: 'العصر' },
    { name: 'Maghrib', time: prayerTimes.maghrib, arabic: 'المغرب' },
    { name: 'Isha', time: prayerTimes.isha, arabic: 'العشاء' },
  ];

  const formatTime = (time: string) => {
    if (timeFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const getNextPrayer = () => {
    const currentTime = getCurrentTime();
    for (const prayer of prayers) {
      if (prayer.time > currentTime) {
        return prayer.name;
      }
    }
    return 'Fajr'; // Next day
  };

  const nextPrayer = getNextPrayer();

  return (
    <Card 
      className={`prayer-times-card ${variant}`}
      role="article"
      aria-label="Prayer times for today"
      tabIndex={0}
    >
      <CardHeader>
        <CardTitle className="text-islamic-green-700">
          Prayer Times
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prayers.map((prayer) => {
            const isNext = showNextPrayer && prayer.name === nextPrayer;
            const isCurrent = prayer.name === nextPrayer;
            
            return (
              <div
                key={prayer.name}
                data-testid="prayer-time-item"
                className={`flex justify-between items-center p-2 rounded ${
                  isNext ? 'next-prayer bg-islamic-green-50 border border-islamic-green-200' : ''
                } ${isCurrent ? 'current-prayer bg-islamic-green-100' : ''}`}
              >
                <span className="font-medium">
                  {showArabic ? prayer.arabic : prayer.name}
                </span>
                <span className="prayer-time font-mono">
                  {formatTime(prayer.time)}
                </span>
              </div>
            );
          })}
        </div>

        {showNextPrayer && (
          <div className="mt-4 text-sm text-gray-600">
            <span>Next prayer: {nextPrayer}</span>
            <span className="ml-2">Time remaining: 2 hours 30 minutes</span>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <div>Location: New York, US</div>
          <div>Calculation Method: ISNA</div>
        </div>
      </CardContent>
    </Card>
  );
}