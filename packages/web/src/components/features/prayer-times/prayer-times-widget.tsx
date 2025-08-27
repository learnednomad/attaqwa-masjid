import { Clock, Compass, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DailyPrayerTimes } from '@/types';
import { cn } from '@/lib/utils';

interface PrayerTimesWidgetProps {
  prayerTimes: DailyPrayerTimes;
  className?: string;
  compact?: boolean;
  currentPrayer?: string;
}

export function PrayerTimesWidget({ 
  prayerTimes, 
  className, 
  compact = false,
  currentPrayer
}: PrayerTimesWidgetProps) {
  const prayers = [
    { 
      name: 'Fajr', 
      time: prayerTimes.fajr, 
      iqama: prayerTimes.iqama?.fajr,
      key: 'fajr' 
    },
    { 
      name: 'Sunrise', 
      time: prayerTimes.sunrise, 
      key: 'sunrise', 
      isShurooq: true 
    },
    { 
      name: 'Dhuhr', 
      time: prayerTimes.dhuhr, 
      iqama: prayerTimes.iqama?.dhuhr,
      key: 'dhuhr' 
    },
    { 
      name: 'Asr', 
      time: prayerTimes.asr, 
      iqama: prayerTimes.iqama?.asr,
      key: 'asr' 
    },
    { 
      name: 'Maghrib', 
      time: prayerTimes.maghrib, 
      iqama: prayerTimes.iqama?.maghrib,
      key: 'maghrib' 
    },
    { 
      name: 'Isha', 
      time: prayerTimes.isha, 
      iqama: prayerTimes.iqama?.isha,
      key: 'isha' 
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (compact) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-islamic-green-700">
              Today's Prayer Times
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {prayers.filter(prayer => !prayer.isShurooq).map((prayer) => (
              <div 
                key={prayer.key}
                className={cn(
                  'flex justify-between rounded-md p-2',
                  currentPrayer === prayer.key 
                    ? 'bg-islamic-green-100 text-islamic-green-800' 
                    : 'bg-gray-50'
                )}
              >
                <span className="font-medium">{prayer.name}</span>
                <span className="prayer-time font-bold">{prayer.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('islamic-pattern', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-islamic-green-700">
          <Clock className="h-5 w-5" />
          Prayer Times
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{formatDate(prayerTimes.date)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {prayers.map((prayer) => (
            <div key={prayer.key}>
              <div 
                className={cn(
                  'flex items-center justify-between rounded-lg p-3 transition-colors',
                  prayer.isShurooq 
                    ? 'bg-orange-50 border border-orange-200' 
                    : currentPrayer === prayer.key
                    ? 'bg-islamic-green-100 border border-islamic-green-200'
                    : 'bg-white border border-gray-200'
                )}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className={cn(
                      'font-semibold',
                      prayer.isShurooq 
                        ? 'text-orange-700'
                        : currentPrayer === prayer.key
                        ? 'text-islamic-green-800'
                        : 'text-gray-700'
                    )}
                  >
                    {prayer.name}
                  </span>
                  {prayer.isShurooq && (
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                      Shurooq
                    </Badge>
                  )}
                  {currentPrayer === prayer.key && !prayer.isShurooq && (
                    <Badge className="text-xs bg-islamic-green-600">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <span>Adhan</span>
                    {prayer.iqama && <span>• Iqama</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className={cn(
                        'prayer-time text-lg font-bold',
                        prayer.isShurooq 
                          ? 'text-orange-700'
                          : currentPrayer === prayer.key
                          ? 'text-islamic-green-700'
                          : 'text-gray-700'
                      )}
                    >
                      {prayer.time}
                    </span>
                    {prayer.iqama && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span 
                          className={cn(
                            'prayer-time text-lg font-bold',
                            currentPrayer === prayer.key
                              ? 'text-islamic-green-600'
                              : 'text-islamic-green-700'
                          )}
                        >
                          {prayer.iqama}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Jummah Prayer Times */}
        {prayerTimes.jummah && prayerTimes.jummah.length > 0 && (
          <>
            <Separator />
            <div className="rounded-lg bg-islamic-gold-50 border border-islamic-gold-200 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-islamic-gold-800">
                  Jumu'ah Prayer
                </span>
                <div className="flex items-center gap-2">
                  {prayerTimes.jummah.map((time, index) => (
                    <span key={index} className="prayer-time text-lg font-bold text-islamic-gold-700">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="h-4 w-4" />
            <span>Qibla Direction</span>
          </div>
          <span className="font-semibold text-islamic-green-700">
            {prayerTimes.qibla}°
          </span>
        </div>
      </CardContent>
    </Card>
  );
}