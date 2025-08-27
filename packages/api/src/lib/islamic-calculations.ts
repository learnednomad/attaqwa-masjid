// Islamic Calculations Library
// Local calculation fallback for prayer times and Islamic features

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PrayerTimesOptions {
  method?: CalculationMethod;
  madhab?: Madhab;
  adjustments?: PrayerAdjustments;
  highLatitudeRule?: HighLatitudeRule;
}

interface PrayerAdjustments {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

type CalculationMethod = 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Jafari';
type Madhab = 'Shafi' | 'Hanafi';
type HighLatitudeRule = 'NightMiddle' | 'AngleBased' | 'OneSeventh';

interface CalculatedPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  midnight: string;
  date: string;
  method: string;
  coordinates: Coordinates;
}

interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  weekday: string;
  formatted: string;
}

// Calculation methods configuration
const CALCULATION_METHODS = {
  MWL: { fajr: 18, isha: 17 }, // Muslim World League
  ISNA: { fajr: 15, isha: 15 }, // Islamic Society of North America
  Egypt: { fajr: 19.5, isha: 17.5 }, // Egyptian General Authority
  Makkah: { fajr: 18.5, isha: 90 }, // Umm Al-Qura University
  Karachi: { fajr: 18, isha: 18 }, // University of Islamic Sciences, Karachi
  Tehran: { fajr: 17.7, isha: 14 }, // Institute of Geophysics, Tehran
  Jafari: { fajr: 16, isha: 14 }, // Shia Ithna-Ashari
};

// Hijri month names
const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
  'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

export class IslamicCalculations {
  private static readonly JULIAN_EPOCH = 1948439.5;
  private static readonly HIJRI_EPOCH = 1948439.5;

  /**
   * Calculate prayer times for given coordinates and date
   */
  static calculatePrayerTimes(
    coordinates: Coordinates,
    date: Date = new Date(),
    options: PrayerTimesOptions = {}
  ): CalculatedPrayerTimes {
    const {
      method = 'MWL',
      madhab = 'Shafi',
      adjustments = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      highLatitudeRule = 'NightMiddle'
    } = options;

    const { latitude, longitude } = coordinates;
    const julianDate = this.getJulianDate(date);
    
    // Sun calculations
    const sunData = this.getSunData(julianDate, latitude, longitude);
    const { declination, equation, transit } = sunData;

    // Calculate prayer angles
    const methodConfig = CALCULATION_METHODS[method];
    const fajrAngle = methodConfig.fajr;
    const ishaAngle = typeof methodConfig.isha === 'number' ? methodConfig.isha : 18;

    // Base prayer times
    const times = {
      fajr: this.calculatePrayerTime(fajrAngle, 'ccw', sunData, latitude),
      sunrise: this.calculatePrayerTime(0.833, 'ccw', sunData, latitude),
      dhuhr: transit,
      asr: this.calculateAsrTime(madhab, sunData, latitude),
      maghrib: this.calculatePrayerTime(0.833, 'cw', sunData, latitude),
      isha: this.calculatePrayerTime(ishaAngle, 'cw', sunData, latitude),
    };

    // Apply high latitude adjustments if needed
    const adjustedTimes = this.applyHighLatitudeRule(times, latitude, highLatitudeRule);

    // Apply manual adjustments
    Object.keys(adjustments).forEach(prayer => {
      if (adjustedTimes[prayer as keyof typeof adjustedTimes] !== undefined) {
        adjustedTimes[prayer as keyof typeof adjustedTimes] += adjustments[prayer as keyof PrayerAdjustments] / 60;
      }
    });

    // Calculate midnight
    const midnight = (adjustedTimes.maghrib + adjustedTimes.fajr + 24) / 2 % 24;

    // Convert to time strings
    const formatTime = (time: number) => {
      const hours = Math.floor(time);
      const minutes = Math.floor((time - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return {
      fajr: formatTime(adjustedTimes.fajr),
      sunrise: formatTime(adjustedTimes.sunrise),
      dhuhr: formatTime(adjustedTimes.dhuhr),
      asr: formatTime(adjustedTimes.asr),
      maghrib: formatTime(adjustedTimes.maghrib),
      isha: formatTime(adjustedTimes.isha),
      midnight: formatTime(midnight),
      date: date.toISOString().split('T')[0],
      method: method,
      coordinates
    };
  }

  /**
   * Calculate Qibla direction from given coordinates
   */
  static calculateQiblaDirection(coordinates: Coordinates): number {
    const { latitude, longitude } = coordinates;
    
    // Kaaba coordinates (Makkah)
    const kaabaLat = 21.422487;
    const kaabaLng = 39.826206;
    
    const lat1 = this.toRadians(latitude);
    const lat2 = this.toRadians(kaabaLat);
    const dLng = this.toRadians(kaabaLng - longitude);
    
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let bearing = this.toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360;
  }

  /**
   * Convert Gregorian date to Hijri
   */
  static gregorianToHijri(date: Date = new Date()): HijriDate {
    const julianDate = this.getJulianDate(date);
    const hijriJulianDate = julianDate - this.HIJRI_EPOCH;
    
    // Islamic calendar calculation (approximation)
    const islamicYear = Math.floor((hijriJulianDate * 30) / 10631) + 1;
    const yearStart = Math.floor(((islamicYear - 1) * 10631) / 30) + 1;
    const dayOfYear = Math.floor(hijriJulianDate - yearStart) + 1;
    
    // Calculate month and day
    const monthLengths = this.getIslamicMonthLengths(islamicYear);
    let month = 1;
    let dayInMonth = dayOfYear;
    
    for (let i = 0; i < 12; i++) {
      if (dayInMonth <= monthLengths[i]) {
        month = i + 1;
        break;
      }
      dayInMonth -= monthLengths[i];
    }
    
    const hijriWeekdays = ['Ahad', 'Ithnayn', 'Thulatha', 'Arba', 'Khamis', 'Jumua', 'Sabt'];
    const weekday = hijriWeekdays[date.getDay()];
    
    return {
      day: dayInMonth,
      month: month,
      year: islamicYear,
      monthName: HIJRI_MONTHS[month - 1],
      weekday: weekday,
      formatted: `${dayInMonth} ${HIJRI_MONTHS[month - 1]} ${islamicYear} AH`
    };
  }

  /**
   * Get distance to Makkah from coordinates
   */
  static getDistanceToMakkah(coordinates: Coordinates): number {
    const { latitude, longitude } = coordinates;
    const kaabaLat = 21.422487;
    const kaabaLng = 39.826206;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(kaabaLat - latitude);
    const dLng = this.toRadians(kaabaLng - longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(latitude)) * Math.cos(this.toRadians(kaabaLat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Private helper methods
  private static getJulianDate(date: Date): number {
    return date.getTime() / 86400000 + 2440587.5;
  }

  private static getSunData(julianDate: number, latitude: number, longitude: number) {
    const n = julianDate - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = this.toRadians((357.528 + 0.9856003 * n) % 360);
    const lambda = this.toRadians(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    
    const alpha = Math.atan2(Math.cos(this.toRadians(23.439)) * Math.sin(lambda), Math.cos(lambda));
    const declination = Math.asin(Math.sin(this.toRadians(23.439)) * Math.sin(lambda));
    
    const equation = 4 * (longitude - this.toDegrees(alpha));
    const transit = 12 - equation / 60;
    
    return { declination, equation, transit };
  }

  private static calculatePrayerTime(
    angle: number, 
    direction: 'cw' | 'ccw', 
    sunData: any, 
    latitude: number
  ): number {
    const { declination, transit } = sunData;
    const latRad = this.toRadians(latitude);
    const angleRad = this.toRadians(angle);
    
    const cosH = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declination)) /
                 (Math.cos(latRad) * Math.cos(declination));
    
    if (Math.abs(cosH) > 1) {
      // Handle extreme latitudes
      return direction === 'ccw' ? transit - 6 : transit + 6;
    }
    
    const H = this.toDegrees(Math.acos(cosH)) / 15;
    return direction === 'ccw' ? transit - H : transit + H;
  }

  private static calculateAsrTime(madhab: Madhab, sunData: any, latitude: number): number {
    const { declination, transit } = sunData;
    const latRad = this.toRadians(latitude);
    
    // Shadow ratio: 1 for Shafi, 2 for Hanafi
    const shadowRatio = madhab === 'Hanafi' ? 2 : 1;
    const cotAlpha = shadowRatio + Math.tan(Math.abs(latRad - declination));
    const alpha = Math.atan(1 / cotAlpha);
    
    const cosH = (Math.sin(alpha) - Math.sin(latRad) * Math.sin(declination)) /
                 (Math.cos(latRad) * Math.cos(declination));
    
    if (Math.abs(cosH) > 1) {
      return transit + 3; // Default fallback
    }
    
    const H = this.toDegrees(Math.acos(cosH)) / 15;
    return transit + H;
  }

  private static applyHighLatitudeRule(
    times: any, 
    latitude: number, 
    rule: HighLatitudeRule
  ): any {
    if (Math.abs(latitude) < 48) {
      return times; // No adjustment needed
    }

    const nightLength = times.fajr - times.isha + 24;
    
    switch (rule) {
      case 'NightMiddle':
        if (nightLength > 10) {
          const adjustment = (nightLength - 10) / 2;
          times.fajr -= adjustment;
          times.isha += adjustment;
        }
        break;
      case 'AngleBased':
        // Use 1/7 of night for Fajr and Isha each
        const portion = nightLength / 7;
        times.fajr = times.isha - portion + 24;
        times.isha = times.maghrib + portion;
        break;
      case 'OneSeventh':
        times.fajr = times.isha - nightLength / 7 + 24;
        times.isha = times.maghrib + nightLength / 7;
        break;
    }

    return times;
  }

  private static getIslamicMonthLengths(year: number): number[] {
    // Simplified approximation - in reality this would use more complex calculations
    const isLeapYear = ((year * 11 + 14) % 30) < 11;
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    
    if (isLeapYear) {
      monthLengths[11] = 30; // Dhu al-Hijjah has 30 days in leap year
    }
    
    return monthLengths;
  }

  private static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private static toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }
}