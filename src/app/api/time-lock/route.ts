import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  
  // Return server time
  return NextResponse.json({
    iso: now.toISOString(),
    hours: now.getHours(),
    minutes: now.getMinutes(),
    formatted: now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }),
  });
}
