import { useState, useEffect } from 'react';
import { getTimeLockSettings } from '@/lib/firebase/firestore';

export function useTimeLock() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [timeSettings, setTimeSettings] = useState<{ startTime: string; endTime: string } | null>(null);

  useEffect(() => {
    async function checkTime() {
      try {
        const res = await fetch('/api/time-lock');
        const data = await res.json();
        
        const settings = await getTimeLockSettings();
        setTimeSettings(settings);
        
        const [startHour, startMinute] = settings.startTime.split(':').map(Number);
        const [endHour, endMinute] = settings.endTime.split(':').map(Number);
        
        const hours = data.hours;
        const minutes = data.minutes;
        
        // Convert to minutes from midnight for easier comparison
        const currentMins = hours * 60 + minutes;
        const startMins = startHour * 60 + startMinute;
        const endMins = endHour * 60 + endMinute;
        
        const valid = currentMins >= startMins && currentMins < endMins;
        
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
