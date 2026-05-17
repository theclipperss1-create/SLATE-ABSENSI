import { useState, useEffect } from 'react';

export function useTimeLock() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverTime, setServerTime] = useState<string | null>(null);

  useEffect(() => {
    async function checkTime() {
      try {
        const res = await fetch('/api/time-lock');
        const data = await res.json();
        
        // Data contains hours in WIB (if server is configured or we handle it)
        // Let's assume the API returns hours in the server's timezone, or we should handle timezone in API.
        // In the API I created, I used `now.getHours()` which depends on the server's local time.
        // Let's assume the server is in WIB or we adjust it.
        
        const hours = data.hours;
        
        // Check if between 05:00 and 07:00 AM
        // Note: 07:00 might mean up to 07:00:00 or inclusive of the hour.
        // Usually "before 07:00" means 05:00 to 06:59.
        const valid = hours >= 5 && hours < 7;
        
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

  return { isValid, loading, serverTime };
}
