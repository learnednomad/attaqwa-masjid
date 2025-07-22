'use client';

import { useQuery } from '@tanstack/react-query';
import { prayerTimesApi } from '@/lib/api';
import { CACHE_KEYS, CACHE_TTL } from '@attaqwa/shared';

interface UsePrayerTimesParams {
  city?: string;
  country?: string;
  method?: string;
}

export function useTodayPrayerTimes(params: UsePrayerTimesParams = {}) {
  return useQuery({
    queryKey: [CACHE_KEYS.PRAYER_TIMES, 'today', params],
    queryFn: () => prayerTimesApi.getToday(params),
    staleTime: CACHE_TTL.PRAYER_TIMES,
    // Refetch every hour to ensure prayer times are up to date
    refetchInterval: CACHE_TTL.PRAYER_TIMES,
  });
}

export function useWeekPrayerTimes(params: UsePrayerTimesParams = {}) {
  return useQuery({
    queryKey: [CACHE_KEYS.PRAYER_TIMES, 'week', params],
    queryFn: () => prayerTimesApi.getWeek(params),
    staleTime: CACHE_TTL.PRAYER_TIMES,
  });
}

export function useMonthPrayerTimes(
  month: string,
  params: UsePrayerTimesParams = {}
) {
  return useQuery({
    queryKey: [CACHE_KEYS.PRAYER_TIMES, 'month', month, params],
    queryFn: () => prayerTimesApi.getMonth({ month, ...params }),
    staleTime: CACHE_TTL.PRAYER_TIMES,
    enabled: !!month,
  });
}