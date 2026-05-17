import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  
  // Calculate WIB (UTC+7)
  // getTimezoneOffset() returns offset in minutes (e.g. -420 for UTC+7 or +300 for UTC-5)
  // We want to force it to UTC+7.
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wib = new Date(utc + (3600000 * 7));
  
  // Return server time in WIB
  return NextResponse.json({
    iso: now.toISOString(),
    hours: wib.getHours(),
    minutes: wib.getMinutes(),
    day: wib.getDay(), // 0 (Sunday) to 6 (Saturday)
    formatted: wib.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  });
}
