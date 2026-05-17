'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr: any) {
        // Jika user tidak ditemukan, otomatis buat akun baru (Sangat berguna untuk testing)
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Buat dokumen user di Firestore
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            await setDoc(userDocRef, {
              name: email.split('@')[0], // Gunakan nama depan email
              role: email === 'admin@test.com' ? 'admin' : 'siswa',
            });
          } catch (createErr: any) {
            setError('Gagal membuat akun baru. Pastikan password minimal 6 karakter.');
            console.error(createErr);
            setLoading(false);
            return;
          }
        } else {
          throw authErr;
        }
      }
      
      const user = userCredential.user;

      // Redirect berdasarkan email/role
      if (email === 'admin@test.com') {
        router.push('/admin/dashboard');
      } else {
        router.push('/siswa/dashboard');
      }
    } catch (err: any) {
      setError('Gagal masuk. Silakan periksa email dan kata sandi Anda.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    // This function can be used to manually trigger seeding if needed
    // But the self-seeding on login is more automatic.
    alert('Self-seeding otomatis aktif saat login dengan admin@test.com');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased flex items-center justify-center p-5">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, 0.05, 0.2, 0.9] }}
        className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full border border-[#E5E5EA] shadow-sm"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="font-bold text-sm uppercase tracking-widest text-[#86868B]">Slate</span>
          <h1 className="text-3xl font-black tracking-tight text-black mt-2">Selamat Datang</h1>
          <p className="text-[#86868B] text-sm mt-1">Masuk untuk melanjutkan ke dashboard.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@sekolah.id"
            required
          />

          <Input
            label="Kata Sandi"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="text-sm font-medium text-black bg-[#F5F5F7] p-3 rounded-lg border border-[#E5E5EA]">
              ⚠️ {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'MEMPROSES...' : 'MASUK'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
