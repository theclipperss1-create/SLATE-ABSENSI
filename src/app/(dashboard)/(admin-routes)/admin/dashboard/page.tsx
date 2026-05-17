'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeToAllLogs, deleteAllLogs, seedDummyData, getSchedule, updateSchedule, setAnnouncement, subscribeToAnnouncement, getTimeLockSettings, updateTimeLockSettings } from '@/lib/firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Modal } from '@/components/ui/Modal';
import { AttendanceLog } from '@/types';

export default function AdminDashboard() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [announcement, setAnnouncementText] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [startTime, setStartTime] = useState('05:00');
  const [endTime, setEndTime] = useState('07:00');
  const [allowedDays, setAllowedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [savingTimeLock, setSavingTimeLock] = useState(false);

  const toggleDay = (dayIndex: number) => {
    setAllowedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    );
  };
  const [modal, setModal] = useState<{ show: boolean; success: boolean; message: string }>({
    show: false,
    success: false,
    message: '',
  });
  const [totalSiswaReal, setTotalSiswaReal] = useState(32);

  useEffect(() => {
    // Subscribe to logs
    const unsubscribe = subscribeToAllLogs((fetchedLogs) => {
      setLogs(fetchedLogs);
      setLoading(false);
    });
    
    // Fetch total students
    async function fetchTotalStudents() {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'siswa'));
        const querySnapshot = await getDocs(q);
        setTotalSiswaReal(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching student count:', error);
      }
    }
    fetchTotalStudents();
    
    // Fetch schedule
    async function fetchSchedule() {
      const fetchedSchedule = await getSchedule();
      setSchedule(fetchedSchedule);
    }
    fetchSchedule();
    
    // Fetch time lock settings
    async function fetchTimeLock() {
      const settings = await getTimeLockSettings();
      setStartTime(settings.startTime);
      setEndTime(settings.endTime);
      setAllowedDays(settings.days || [1, 2, 3, 4, 5]);
    }
    fetchTimeLock();

    // Subscribe to announcement
    const unsubscribeAnn = subscribeToAnnouncement((text) => {
      setAnnouncementText(text);
    });
    
    return () => {
      unsubscribe();
      unsubscribeAnn();
    };
  }, []);

  const handleSaveAnnouncement = async () => {
    setSavingAnnouncement(true);
    const result = await setAnnouncement(announcement);
    setSavingAnnouncement(false);
    if (result.success) {
      setModal({ show: true, success: true, message: 'Pengumuman berhasil diperbarui.' });
    } else {
      setModal({ show: true, success: false, message: 'Gagal memperbarui pengumuman.' });
    }
  };

  const handleSaveTimeLock = async () => {
    setSavingTimeLock(true);
    const result = await updateTimeLockSettings({ startTime, endTime, days: allowedDays });
    setSavingTimeLock(false);
    if (result.success) {
      setModal({ show: true, success: true, message: 'Pengaturan waktu absensi berhasil diperbarui.' });
    } else {
      setModal({ show: true, success: false, message: 'Gagal memperbarui pengaturan waktu.' });
    }
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    const firstDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
    const pad = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = 0; i < pad; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedDate) {
      const formattedSelectedDate = selectedDate.toLocaleDateString('id-ID');
      return matchesSearch && log.date === formattedSelectedDate;
    }
    
    return matchesSearch;
  });

  // Stats
  const totalSiswa = totalSiswaReal; // Dynamic total students in class
  const hadir = logs.filter(l => l.status === 'Hadir').length;
  const izin = logs.filter(l => l.status === 'Izin').length;
  const sakit = logs.filter(l => l.status === 'Sakit').length;
  const alpa = logs.filter(l => l.status === 'Alpa').length;
 
  const stats = [
    { label: 'Total Siswa', value: totalSiswa.toString() },
    { label: 'Hadir', value: hadir.toString() },
    { label: 'Izin', value: izin.toString() },
    { label: 'Sakit', value: sakit.toString() },
    { label: 'Alpa', value: alpa.toString() },
  ];

  // Calculate Real-time Weekly Trend (Filtered for current week)
  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Assume DD/MM/YYYY
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date();
  };

  const getDayPresence = (dayIndex: number) => {
    // dayIndex: 1 = Sen, 2 = Sel, 3 = Rab, 4 = Kam, 5 = Jum
    const now = new Date();
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Get Monday of this week
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + (dayIndex - 1));
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);
    
    const dayLogs = logs.filter(log => {
      let logDate: Date;
      const logAny = log as any;
      
      // Use createdAt timestamp if available (robust)
      if (logAny.createdAt && typeof logAny.createdAt.toDate === 'function') {
        logDate = logAny.createdAt.toDate();
      } else if (logAny.createdAt && logAny.createdAt.seconds) {
        logDate = new Date(logAny.createdAt.seconds * 1000);
      } else {
        // Fallback to parsing string
        logDate = parseDate(log.date);
      }
      
      return logDate >= targetDate && logDate < nextDay && log.status === 'Hadir';
    });
    
    return Math.min(100, Math.round((dayLogs.length / totalSiswa) * 100));
  };

  const weekData = [
    { day: 'Sen', value: getDayPresence(1) },
    { day: 'Sel', value: getDayPresence(2) },
    { day: 'Rab', value: getDayPresence(3) },
    { day: 'Kam', value: getDayPresence(4) },
    { day: 'Jum', value: getDayPresence(5) },
  ];

  const totalLogs = logs.length;
  const hadirPct = totalLogs > 0 ? (hadir / totalLogs) * 100 : 0;
  const izinPct = totalLogs > 0 ? (izin / totalLogs) * 100 : 0;
  const sakitPct = totalLogs > 0 ? (sakit / totalLogs) * 100 : 0;
  const alpaPct = totalLogs > 0 ? (alpa / totalLogs) * 100 : 0;

  // Calculate Rank (Top 5 Diligent Students)
  const studentStats: { [key: string]: number } = {};
  logs.forEach(log => {
    if (log.status === 'Hadir') {
      studentStats[log.userName] = (studentStats[log.userName] || 0) + 1;
    }
  });

  const rank = Object.entries(studentStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handleDeleteAll = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA riwayat absensi? Tindakan ini tidak bisa dibatalkan.')) {
      const result = await deleteAllLogs();
      if (result.success) {
        setModal({ show: true, success: true, message: 'Semua riwayat berhasil dihapus.' });
        setLogs([]); // Clear local state
      } else {
        setModal({ show: true, success: false, message: 'Gagal menghapus riwayat.' });
      }
    }
  };

  const handleSeedData = async () => {
    const result = await seedDummyData();
    if (result.success) {
      setModal({ show: true, success: true, message: '5 akun dummy berhasil dibuat dengan riwayat absensi.' });
    } else {
      setModal({ show: true, success: false, message: 'Gagal membuat data dummy.' });
    }
  };

  const handleExport = () => {
    if (logs.length === 0) {
      setModal({ show: true, success: false, message: 'Tidak ada data untuk diekspor.' });
      return;
    }

    const headers = ['Nama Siswa', 'Status', 'Tanggal', 'Waktu', 'Lokasi'];
    const rows = logs.map(log => [
      `"${log.userName}"`,
      `"${log.status}"`,
      `"${log.date}"`,
      `"${log.time}"`,
      log.location ? `"${log.location.lat},${log.location.lng}"` : '"-"'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_absensi_${new Date().toLocaleDateString('id-ID')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setModal({ show: true, success: true, message: 'Data berhasil diekspor ke CSV.' });
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const handleAddScheduleItem = () => {
    setSchedule([...schedule, { id: Date.now(), time: '00:00', subject: '' }]);
  };

  const handleRemoveScheduleItem = (index: number) => {
    const updated = [...schedule];
    updated.splice(index, 1);
    setSchedule(updated);
  };

  const handleSaveSchedule = async () => {
    const result = await updateSchedule(schedule);
    if (result.success) {
      setModal({ show: true, success: true, message: 'Jadwal berhasil diperbarui.' });
    } else {
      setModal({ show: true, success: false, message: 'Gagal memperbarui jadwal.' });
    }
  };

  return (
    <main className="py-8 px-5 md:px-8 max-w-7xl mx-auto text-[#1D1D1F] dark:text-[#F5F5F7]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8H10C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12H14C15.1046 12 16 12.8954 16 14C16 15.1046 15.1046 16 14 16H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="6" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Slate</h1>
            <p className="text-xs font-medium text-[#86868B] tracking-wide uppercase">Mark Your Presence</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-black dark:text-white md:text-right">Dashboard Guru</h2>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-10 print:hidden">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
            <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-black text-black dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 print:hidden">
        
        {/* Weekly Chart (Bar) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mt-0.5">Tren Kehadiran</h2>
          </div>
          <div className="flex items-end justify-between h-40 max-w-xl mx-auto pt-4">
            {weekData.map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-6 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-full h-32 flex flex-col justify-end overflow-hidden">
                  <motion.div 
                    className="bg-black dark:bg-white rounded-full" 
                    initial={{ height: 0 }}
                    animate={{ height: `${data.value}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
                <p className="text-xs font-bold text-black dark:text-white mt-2">{data.day}</p>
                <p className="text-xs text-[#86868B]">{data.value}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Breakdown (Pie) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mt-0.5">Status Kehadiran</h2>
          </div>
          <div className="flex flex-col items-center justify-center h-40">
            <motion.div 
              className="w-28 h-28 rounded-full relative" 
              style={{
                background: `conic-gradient(
                  #000000 0% ${hadirPct}%, 
                  #1D1D1F ${hadirPct}% ${hadirPct + izinPct}%, 
                  #86868B ${hadirPct + izinPct}% ${hadirPct + izinPct + sakitPct}%, 
                  #E5E5EA ${hadirPct + izinPct + sakitPct}% 100%
                )`
              }}
              initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
              {/* Inner Circle to make it a Donut */}
              <div className="absolute inset-5 bg-white dark:bg-[#1D1D1F] rounded-full flex flex-col items-center justify-center">
                <span className="text-xs font-black text-black dark:text-white">{Math.round(hadirPct)}%</span>
                <span className="text-[9px] font-medium text-[#86868B] uppercase tracking-wider">Hadir</span>
              </div>
            </motion.div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-black rounded-full" />
                <span>Hadir</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#1D1D1F] rounded-full" />
                <span>Izin</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#86868B] rounded-full" />
                <span>Sakit</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#E5E5EA] rounded-full" />
                <span>Alpa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rank & Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 print:hidden">
        
        {/* Rank Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mt-0.5">Siswa Terajin</h2>
          </div>
          <div className="space-y-4">
            {rank.map((student, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-black dark:text-white">{index + 1}</span>
                  <span className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{student.name}</span>
                </div>
                <span className="text-xs font-bold bg-[#F5F5F7] dark:bg-[#3A3A3C] px-2.5 py-1 rounded-full text-black dark:text-white">
                  {student.count} Hari
                </span>
              </div>
            ))}
            {rank.length === 0 && (
              <p className="text-sm text-[#86868B] text-center py-4">Belum ada data prestasi.</p>
            )}
          </div>
        </div>

        {/* Schedule Editor */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mt-0.5">Jadwal Pelajaran</h2>
          </div>
          
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {schedule.map((item, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                  className="w-20 h-9 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-2 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white"
                  placeholder="07:30"
                />
                <input
                  type="text"
                  value={item.subject}
                  onChange={(e) => handleScheduleChange(index, 'subject', e.target.value)}
                  className="flex-1 h-9 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white"
                  placeholder="Nama Mata Pelajaran"
                />
                <button 
                  onClick={() => handleRemoveScheduleItem(index)}
                  className="h-9 px-2 bg-[#F5F5F7] dark:bg-[#3A3A3C] text-black dark:text-white text-xs font-bold rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-colors"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <button 
              onClick={handleAddScheduleItem}
              className="h-9 px-3 bg-[#F5F5F7] dark:bg-[#3A3A3C] text-black dark:text-white text-xs font-bold rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-colors"
            >
              Tambah Jam
            </button>
            <button 
              onClick={handleSaveSchedule}
              className="h-9 px-4 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Simpan Jadwal
            </button>
          </div>
        </div>
      </div>

      {/* Announcement & Time Lock Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 print:hidden">
        {/* Announcement Section */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mt-0.5">Broadcast ke Siswa</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Tulis pengumuman di sini..."
              className="flex-1 p-4 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl text-sm border border-[#E5E5EA] dark:border-[#3A3A3C] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white"
              rows={3}
            />
            <div className="flex flex-col justify-end">
              <button
                onClick={handleSaveAnnouncement}
                disabled={savingAnnouncement}
                className="h-10 px-6 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingAnnouncement ? 'Menyimpan...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>

        {/* Time Lock Settings */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mt-0.5">Waktu Absensi</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-10 mt-1 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 mt-1 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white"
                />
              </div>
            </div>

            {/* Days Selection */}
            <div>
              <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Hari Aktif</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName, index) => {
                  const isSelected = allowedDays.includes(index);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={`h-8 px-3 text-xs font-bold rounded-lg transition-colors ${
                        isSelected 
                          ? 'bg-black dark:bg-white text-white dark:text-black' 
                          : 'bg-[#F5F5F7] dark:bg-[#3A3A3C] text-[#86868B]'
                      }`}
                    >
                      {dayName}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveTimeLock}
                disabled={savingTimeLock}
                className="h-10 px-6 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingTimeLock ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid (GitHub Style) */}
      <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl border border-[#E5E5EA] dark:border-[#3A3A3C] p-6 shadow-sm mb-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Aktivitas Absensi</p>
            <h2 className="text-xl font-bold text-black dark:text-white mt-0.5">Kalender Bulanan</h2>
          </div>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm font-medium text-black dark:text-white underline underline-offset-2 hover:text-[#86868B]"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-[#86868B] w-8">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="w-8 h-8" />;
              }

              const formattedDate = date.toLocaleDateString('id-ID');
              const logsOnDay = logs.filter(log => log.date === formattedDate);
              const presentCount = logsOnDay.filter(log => log.status === 'Hadir').length;
              
              // Color intensity based on presence
              let bgColor = 'bg-[#F5F5F7] dark:bg-[#3A3A3C]'; // 0 logs
              if (presentCount > 15) {
                bgColor = 'bg-black dark:bg-white';
              } else if (presentCount > 5) {
                bgColor = 'bg-[#86868B]';
              } else if (presentCount > 0) {
                bgColor = 'bg-[#E5E5EA] dark:bg-[#48484A]';
              }

              const isSelected = selectedDate && selectedDate.toLocaleDateString('id-ID') === formattedDate;

              return (
                <button
                  key={formattedDate}
                  onClick={() => setSelectedDate(date)}
                  className={`w-8 h-8 rounded-lg transition-all ${bgColor} ${
                    isSelected ? 'ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-[#1D1D1F]' : ''
                  } hover:scale-105 flex flex-col items-center justify-center`}
                  title={`${formattedDate}: ${presentCount} Hadir`}
                >
                  <span className={`text-xs font-bold ${
                    presentCount > 15 
                      ? 'text-white dark:text-black' 
                      : presentCount > 5 
                        ? 'text-white' 
                        : 'text-[#1D1D1F] dark:text-white'
                  }`}>
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-xs text-[#86868B]">
            <span>Kurang</span>
            <div className="w-4 h-4 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-sm"></div>
            <div className="w-4 h-4 bg-[#E5E5EA] dark:bg-[#48484A] rounded-sm"></div>
            <div className="w-4 h-4 bg-[#86868B] rounded-sm"></div>
            <div className="w-4 h-4 bg-black dark:bg-white rounded-sm"></div>
            <span>Lebih</span>
          </div>
        </div>
      </div>

      {/* Controls & Table */}
      <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl border border-[#E5E5EA] dark:border-[#3A3A3C] overflow-hidden shadow-sm">
        {/* Print Header */}
        <div className="hidden print:block p-6 text-center border-b border-[#E5E5EA] dark:border-[#3A3A3C]">
          <h1 className="text-2xl font-bold text-black dark:text-white">REKAP ABSENSI SISWA</h1>
          <p className="text-sm text-[#86868B] mt-1">Kelas XII-A • Diekspor pada {new Date().toLocaleDateString('id-ID')}</p>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-[#E5E5EA] dark:border-[#3A3A3C] flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Daftar Kehadiran</p>
            <h2 className="text-xl font-bold text-black dark:text-white mt-0.5">Siswa Kelas XII-A</h2>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 bg-[#F5F5F7] dark:bg-[#3A3A3C] rounded-xl px-4 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white w-full md:w-64 text-black dark:text-white"
            />
            <button 
              onClick={handleExport}
              className="h-10 px-4 bg-[#F5F5F7] dark:bg-[#3A3A3C] text-black dark:text-white text-sm font-bold rounded-xl border border-[#E5E5EA] dark:border-[#3A3A3C] hover:bg-[#E5E5EA] dark:hover:bg-[#48484A] transition-colors"
            >
              Ekspor CSV
            </button>
            <button 
              onClick={() => window.print()}
              className="h-10 px-4 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Cetak PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm text-[#86868B] uppercase tracking-wide">
              Memuat data...
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E5EA] dark:border-[#3A3A3C] bg-[#F5F5F7]/50 dark:bg-[#1D1D1F]/50">
                  <th className="p-4 font-medium text-[#86868B] text-xs uppercase">Siswa</th>
                  <th className="p-4 font-medium text-[#86868B] text-xs uppercase">Status</th>
                  <th className="p-4 font-medium text-[#86868B] text-xs uppercase">Waktu</th>
                  <th className="p-4 font-medium text-[#86868B] text-xs uppercase">Lokasi</th>
                  <th className="p-4 font-medium text-[#86868B] text-xs uppercase">Bukti</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[#E5E5EA] dark:border-[#3A3A3C] last:border-b-0">
                    <td className="p-4 flex items-center gap-3">
                      <span className="font-bold text-black dark:text-white">{log.userName}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className={`font-medium ${
                          log.status === 'Hadir' ? 'text-black dark:text-white' : 'text-[#86868B]'
                        }`}>
                          {log.status}
                        </span>
                        {log.reason && (
                          <span className="text-xs text-[#86868B] mt-0.5">
                            Ket: {log.reason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[#86868B]">{log.time}</td>
                    <td className="p-4">
                      {log.location ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${log.location.lat},${log.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-black dark:text-white underline underline-offset-2 hover:text-[#86868B] transition-colors"
                        >
                          Lihat Peta
                        </a>
                      ) : (
                        <span className="text-xs text-[#86868B]">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {log.selfieUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F5F7] dark:bg-[#3A3A3C] border border-[#E5E5EA] dark:border-[#3A3A3C]">
                          <img src={log.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-xs text-[#86868B]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#86868B] text-sm">
                      Belum ada data absensi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Alert */}
      <Modal
        show={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        success={modal.success}
        title={modal.success ? 'Berhasil' : 'Pemberitahuan'}
        message={modal.message}
      />
    </main>
  );
}
