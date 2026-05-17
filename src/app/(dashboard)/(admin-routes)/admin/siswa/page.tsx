'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '@/lib/firebase/config';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Modal } from '@/components/ui/Modal';

export default function AdminSiswa() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNoAbsen, setEditNoAbsen] = useState('');
  const [modal, setModal] = useState({ show: false, success: false, message: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNoAbsen, setNewNoAbsen] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'siswa'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const sortedData = data.sort((a: any, b: any) => {
          const noA = parseInt(a.noAbsen) || 999;
          const noB = parseInt(b.noAbsen) || 999;
          return noA - noB;
        });
        
        setStudents(sortedData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const handleEdit = (student: any) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditEmail(student.email);
    setEditNoAbsen(student.noAbsen || '');
  };

  const handleSave = async (id: string) => {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, {
        name: editName,
        email: editEmail,
        noAbsen: editNoAbsen,
      });
      
      setStudents(students.map(s => s.id === id ? { ...s, name: editName, email: editEmail, noAbsen: editNoAbsen } : s));
      setEditingId(null);
      setModal({ show: true, success: true, message: 'Data siswa berhasil diperbarui.' });
    } catch (error) {
      console.error('Error updating student:', error);
      setModal({ show: true, success: false, message: 'Gagal memperbarui data siswa.' });
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Initialize secondary app to avoid signing out current admin
      const secondaryApp = getApps().find(app => app.name === 'Secondary') || initializeApp(firebaseConfig, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);

      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const uid = userCredential.user.uid;

      // 2. Create user doc in Firestore
      await setDoc(doc(db, 'users', uid), {
        name: newName,
        email: newEmail,
        role: 'siswa',
        noAbsen: newNoAbsen,
        createdAt: new Date(),
      });

      setStudents([...students, { id: uid, name: newName, email: newEmail, role: 'siswa', noAbsen: newNoAbsen }]);
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewNoAbsen('');
      setModal({ show: true, success: true, message: 'Siswa berhasil ditambahkan!' });
    } catch (error: any) {
      console.error('Error creating student:', error);
      setModal({ show: true, success: false, message: `Gagal: ${error.message}` });
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="py-8 px-5 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Daftar Siswa</h1>
          <p className="text-sm text-[#86868B] mt-1">Kelas X TKJ 2</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-5 h-10 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <span>Tambah Siswa</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl border border-[#E5E5EA] dark:border-[#3A3A3C] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[#86868B] uppercase bg-[#F5F5F7] dark:bg-[#3A3A3C]">
            <tr>
              <th className="px-6 py-4 font-medium w-20">No</th>
              <th className="px-6 py-4 font-medium">Nama</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5EA] dark:divide-[#3A3A3C]">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-[#F5F5F7]/50 dark:hover:bg-[#3A3A3C]/50 transition-colors">
                <td className="px-6 py-4">
                  {editingId === student.id ? (
                    <input
                      type="text"
                      value={editNoAbsen}
                      onChange={(e) => setEditNoAbsen(e.target.value)}
                      className="w-16 bg-white dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#3A3A3C] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white"
                    />
                  ) : (
                    <span className="font-bold text-black dark:text-white">{student.noAbsen || '-'}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === student.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#3A3A3C] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white"
                    />
                  ) : (
                    <span className="font-medium text-black dark:text-white">{student.name}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === student.id ? (
                    <input
                      type="text"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-white dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#3A3A3C] rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white"
                    />
                  ) : (
                    <span className="text-[#86868B]">{student.email}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === student.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(student.id)}
                        className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-[#E5E5EA] dark:bg-[#3A3A3C] text-black dark:text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-xs font-bold text-black dark:text-white underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="text-center py-10 text-sm text-[#86868B]">Memuat data siswa...</div>
        )}
        {!loading && students.length === 0 && (
          <div className="text-center py-10 text-sm text-[#86868B]">Belum ada data siswa.</div>
        )}
      </div>

      <Modal show={modal.show} success={modal.success} message={modal.message} title={modal.success ? 'Berhasil' : 'Pemberitahuan'} onClose={() => setModal({ ...modal, show: false })} />

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl w-full max-w-md p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-lg">
            <h2 className="text-xl font-bold text-black dark:text-white mb-4">Tambah Siswa Baru</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-4 h-10 text-sm focus:outline-none text-black dark:text-white"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-4 h-10 text-sm focus:outline-none text-black dark:text-white"
                  placeholder="email@sekolah.id"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-4 h-10 text-sm focus:outline-none text-black dark:text-white"
                  placeholder="Min. 6 karakter"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">No. Absensi</label>
                <input
                  type="text"
                  required
                  value={newNoAbsen}
                  onChange={(e) => setNewNoAbsen(e.target.value)}
                  className="w-full mt-1 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-4 h-10 text-sm focus:outline-none text-black dark:text-white"
                  placeholder="Contoh: 01"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black h-10 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {creating ? 'Memproses...' : 'Tambah'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#E5E5EA] dark:bg-[#3A3A3C] text-black dark:text-white h-10 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
