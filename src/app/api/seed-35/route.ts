export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { seedDummyData } from '@/lib/firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await seedDummyData();
  if (result.success) {
    return NextResponse.json({ success: true, message: '35 data dummy berhasil dibuat.' });
  } else {
    return NextResponse.json({ success: false, error: result.error });
  }
}
