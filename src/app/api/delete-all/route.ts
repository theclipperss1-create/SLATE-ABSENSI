import { deleteAllLogs } from '@/lib/firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await deleteAllLogs();
  if (result.success) {
    return NextResponse.json({ success: true, message: 'Semua logs berhasil dihapus.' });
  } else {
    return NextResponse.json({ success: false, error: result.error });
  }
}
