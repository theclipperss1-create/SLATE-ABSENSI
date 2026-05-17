import { useState, useEffect } from 'react';
import { getTimeLockSettings } from '@/lib/firebase/firestore';

export function useTimeLock() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [timeSettings, setTimeSettings] = useState<{ startTime: string; endTime: string; days: number[] } | null>(null);

  useEffect(() => {
    async function checkTime() {
      try {
        const res = await fetch('/api/time-lock');
        const data = await res.json();
        
        const settings = await getTimeLockSettings();
        setTimeSettings(settings as any);
        
        const [startHour, startMinute] = settings.startTime.split(':').map(Number);
        const [endHour, endMinute] = settings.endTime.split(':').map(Number);
        
        const hours = data.hours;
        const minutes = data.minutes;
        const day = data.day; // 0 (Sun) - 6 (Sat)
        
        // Convert to minutes from midnight for easier comparison
        const currentMins = hours * 60 + minutes;
        const startMins = startHour * 60 + startMinute;
        const endMins = endHour * 60 + endMinute;
        
        const isTimeValid = currentMins >= startMins && currentMins < endMins;
        
        // Check if current day is in allowed days
        const isDayValid = settings.days.includes(day);
        
        const valid = isTimeValid && isDayValid;
        
        setIsValid(valid);
        setServerTime(data.formatted);
      } catch (error) {
        console.error('Failed to check time lock:', error);
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    }

    checkTime();
  }, []);

  return { isValid, loading, serverTime, timeSettings };
}
