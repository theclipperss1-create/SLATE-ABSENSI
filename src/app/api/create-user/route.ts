export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Firebase memerlukan password minimal 6 karakter
    const userCredential = await createUserWithEmailAndPassword(auth, 'abdul@bc.com', '123456');
    
    // Buat dokumen user di Firestore
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      name: 'Abdul',
      role: 'siswa',
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Akun abdul@bc.com berhasil didaftarkan dengan password 123456',
      uid: userCredential.user.uid 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
