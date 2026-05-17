export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const q = collection(db, 'attendance_logs');
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ count: data.length, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
