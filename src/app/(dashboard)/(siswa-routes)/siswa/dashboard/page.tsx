'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Timetable } from '@/components/siswa/Timetable';
import { LogTracker } from '@/components/siswa/LogTracker';
import { useAuth } from '@/hooks/useAuth';
import { useTimeLock } from '@/hooks/useTimeLock';
import { submitAttendance, subscribeToStudentLogs, getSchedule, subscribeToAnnouncement } from '@/lib/firebase/firestore';

// Titik tengah sekolah (contoh: Monas Jakarta)
const SCHOOL_LAT = -6.175392;
const SCHOOL_LNG = 106.827153;

// Haversine Formula untuk menghitung jarak dalam meter
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius bumi dalam meter
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d; // Jarak dalam meter
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { isValid: isTimeValidHook, loading: timeLoading, serverTime, timeSettings } = useTimeLock();
  const isTimeValid = isTimeValidHook;


  // Refs for Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [status, setStatus] = useState<'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | null>(null);
  const [reason, setReason] = useState('');
  const [countdown, setCountdown] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [modal, setModal] = useState<{ show: boolean; success: boolean; message: string }>({
    show: false,
    success: false,
    message: '',
  });

  const [schedule, setSchedule] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    async function fetchSchedule() {
      const data = await getSchedule();
      // Mark the first item as active for UI demonstration
      const mapped = data.map((item: any, index: number) => ({
        ...item,
        active: index === 0
      }));
      setSchedule(mapped);
    }
    fetchSchedule();
  }, []);

  useEffect(() => {
    const unsubscribeAnn = subscribeToAnnouncement((text) => {
      setAnnouncement(text);
    });
    return () => unsubscribeAnn();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setHours(7, 0, 0, 0); // 07:00 AM

      const diff = target.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setCountdown('00:00:00');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    
    if (user) {
      unsubscribe = subscribeToStudentLogs(user.id, (logs) => {
        const mappedHistory = logs.map(log => ({
          id: log.id,
          date: log.date,
          status: log.status,
          time: log.time,
          img: log.selfieUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        }));
        setHistory(mappedHistory);
      });
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Calendar Helper Functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID');
  };

  const getStatusForDay = (date: Date) => {
    const dateStr = formatDate(date);
    const log = history.find((l: any) => l.date === dateStr);
    return log ? log.status : 'Empty';
  };

  const getCalendarDays = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();
    const adjustedStart = startingDay === 0 ? 6 : startingDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < adjustedStart; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };
  
  const calendarDays = getCalendarDays();

  // Camera Handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setModal({ show: true, success: false, message: 'Gagal mengakses kamera. Pastikan izin kamera telah diberikan.' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (cameraOpen && !selfie) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraOpen, selfie]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // Instant capture
        setSelfie(dataUrl);
        setCapturing(false);
        stopCamera();
      }
    }
  };

  // Location Handler
  const getGPSLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser Anda.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (err) => {
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  };

  // Handlers
  const handleStatusSelect = (selectedStatus: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa') => {
    if (submitted) return;
    setStatus(selectedStatus);
    if (selectedStatus !== 'Alpa') {
      setCameraOpen(true);
    } else {
      setCameraOpen(false);
      setSelfie(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (isTimeValid === false) {
      setModal({ 
        show: true, 
        success: false, 
        message: `Waktu absensi telah ditutup. Absensi hanya diperbolehkan pukul ${timeSettings?.startTime || '05:00'} - ${timeSettings?.endTime || '07:00'} WIB.` 
      });
      return;
    }

    if (!status) {
      setModal({ show: true, success: false, message: 'Pilih status absensi terlebih dahulu.' });
      return;
    }

    if (status !== 'Alpa' && !selfie) {
      setModal({ show: true, success: false, message: 'Ambil foto selfie terlebih dahulu.' });
      return;
    }

    setSubmitting(true);
    
    try {
      // 1. Validasi Lokasi (Geofencing) - DISABLED
      const gps = { lat: 0, lng: 0 };
      setLocation(gps);

      // 2. Kirim ke Database
      const payload: any = {
        userId: user.id,
        userName: user.name,
        date: new Date().toLocaleDateString('id-ID'),
        time: serverTime || new Date().toLocaleTimeString('id-ID'),
        status: status,
        selfieUrl: selfie || '',
        location: gps,
      };

      if (status === 'Izin' || status === 'Sakit') {
        payload.reason = reason || '';
      }

      const result = await submitAttendance(payload);

      if (result.success) {
        setModal({ show: true, success: true, message: 'Absensi berhasil direkam. Data telah dikunci.' });
        setSubmitted(true);
      } else {
        setModal({ 
          show: true, 
          success: false, 
          message: `Gagal merekam absensi: ${(result as any).error?.message || 'Terjadi kesalahan pada server database.'}` 
        });
      }
    } catch (error: any) {
      setModal({ 
        show: true, 
        success: false, 
        message: `Gagal mendapatkan lokasi GPS: ${error.message || 'Izin ditolak'}.` 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalLogs = history.length;
  const hadir = history.filter(l => l.status === 'Hadir').length;
  const izinSakit = history.filter(l => l.status === 'Izin' || l.status === 'Sakit').length;
  const alpa = history.filter(l => l.status === 'Alpa').length;
  
  const hadirPct = totalLogs > 0 ? (hadir / totalLogs) * 100 : 0;
  const izinSakitPct = totalLogs > 0 ? (izinSakit / totalLogs) * 100 : 0;

  return (
    <main className="py-8 px-5 md:px-8 max-w-7xl mx-auto">
      {/* Announcement Banner */}
      {announcement && (
        <div className="mb-6 bg-black dark:bg-white text-white dark:text-black rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-medium text-white/70 dark:text-black/70 uppercase tracking-wide">Pengumuman Guru</p>
          <p className="font-bold text-sm md:text-base mt-0.5">
            {announcement}
          </p>
        </div>
      )}

      {/* Banner */}
      {!submitted && (
        <div className="mb-8 bg-white dark:bg-[#1D1D1F] border border-[#E5E5EA] dark:border-[#3A3A3C] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Cek Status</p>
            <p className="font-bold text-black dark:text-white text-sm md:text-base">
              {isTimeValid === false 
                ? `Waktu absensi hari ini telah ditutup (${timeSettings?.startTime || '05:00'} - ${timeSettings?.endTime || '07:00'} WIB).` 
                : `Absensi hari ini belum direkam. Selesaikan sebelum pukul ${timeSettings?.endTime || '07:00'} WIB. (Sisa: ${countdown})`}
            </p>
          </div>
        </div>
      )}

      {/* Header with Logo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8H10C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12H14C15.1046 12 16 12.8954 16 14C16 15.1046 15.1046 16 14 16H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="18" cy="6" r="2" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">Slate</h1>
            <p className="text-xs font-medium text-[#86868B] tracking-wide uppercase">Mark Your Presence</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-black dark:text-white md:text-right">Dasbor Siswa</h2>
          {serverTime && (
            <p className="text-xs text-[#86868B] md:text-right mt-0.5">Waktu Server: {serverTime}</p>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column: Console (7 slots) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Status Selector */}
          <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
            <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide mb-4">Pilih Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as const).map((s) => (
                <Button
                  key={s}
                  variant={status === s ? 'primary' : 'secondary'}
                  onClick={() => handleStatusSelect(s)}
                  disabled={submitted || isTimeValid === false}
                  className={submitted || isTimeValid === false ? 'cursor-not-allowed opacity-70' : ''}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Camera Drawer */}
          <AnimatePresence>
            {cameraOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide mb-4">Verifikasi Kamera</p>
                  
                  {/* Form Alasan for Izin/Sakit */}
                  {(status === 'Izin' || status === 'Sakit') && (
                    <div className="mb-4">
                      <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">Alasan {status}</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={`Tuliskan alasan Anda ${status.toLowerCase()} di sini...`}
                        className="w-full mt-1 p-3 bg-[#F5F5F7] rounded-xl text-sm border border-[#E5E5EA] focus:outline-none focus:ring-1 focus:ring-black"
                        rows={3}
                        disabled={submitted}
                      />
                    </div>
                  )}
                  
                  {/* Viewfinder */}
                  <div className="relative w-full aspect-video bg-[#F5F5F7] rounded-xl overflow-hidden border border-[#E5E5EA]">
                    {selfie ? (
                      <div className="w-full h-full relative">
                        <img src={selfie} alt="Selfie Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => { setSelfie(null); setCameraOpen(true); }}
                          className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white transition-all"
                          disabled={submitted}
                        >
                          Ulangi
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 bg-black/10">
                          <button
                            onClick={capturePhoto}
                            disabled={capturing || submitted}
                            className="w-14 h-14 bg-transparent rounded-full border-2 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                            title="Ambil Foto"
                          >
                            <div className="w-10 h-10 bg-white rounded-full" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Canvas tersembunyi untuk capture */}
                    <canvas ref={canvasRef} className="hidden" />
                    

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || submitted || isTimeValid === false || timeLoading}
            className={submitting || submitted || isTimeValid === false || timeLoading ? 'opacity-70 cursor-not-allowed' : ''}
          >
            {timeLoading ? 'MENGECEK WAKTU...' : submitting ? 'MEMPROSES...' : submitted ? 'DATA TERKUNCI' : 'KIRIM DATA ABSENSI KE SERVER'}
          </Button>

        </div> {/* Close Left Column */}

        {/* Right Column: Timetable & History (5 slots) */}
        <div className="md:col-span-5 space-y-8">
          <Timetable schedule={schedule} />
          
          <div className="bg-white dark:bg-[#1D1D1F] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#3A3A3C] shadow-sm">
            <div className="mb-6">
              <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide">03 / STATISTIK</p>
              <h2 className="text-xl font-bold text-black dark:text-white tracking-tight mt-0.5">Kehadiran Bulan Ini</h2>
            </div>
            <div className="flex flex-col items-center justify-center">
              <motion.div 
                className="w-24 h-24 rounded-full relative" 
                style={{
                  background: `conic-gradient(
                    #000000 0% ${hadirPct}%, 
                    #86868B ${hadirPct}% ${hadirPct + izinSakitPct}%, 
                    #E5E5EA ${hadirPct + izinSakitPct}% 100%
                  )`
                }}
                initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              >
                {/* Inner Circle to make it a Donut */}
                <div className="absolute inset-4 bg-white dark:bg-[#1D1D1F] rounded-full flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-black dark:text-white">{Math.round(hadirPct)}%</span>
                </div>
              </motion.div>
              <div className="flex gap-4 mt-4 text-xs font-medium">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-black rounded-full" />
                  <span>{hadir} Hadir</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#86868B] rounded-full" />
                  <span>{izinSakit} Izin/Sakit</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#E5E5EA] rounded-full" />
                  <span>{alpa} Alpa</span>
                </div>
              </div>

              {/* Calendar Contribution Graph */}
              <div className="mt-6 pt-6 border-t border-[#E5E5EA] dark:border-[#3A3A3C] w-full">
                <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide mb-3">Kalender Kehadiran</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Days of week header */}
                  {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
                    <div key={i} className="text-[10px] font-bold text-[#86868B] text-center">{day}</div>
                  ))}
                  {/* Calendar Squares */}
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={i} className="w-full aspect-square opacity-0" />;
                    
                    const status = getStatusForDay(day);
                    let bgColor = 'bg-[#F5F5F7] dark:bg-[#3A3A3C]'; // Default empty
                    let textColor = 'text-[#86868B] dark:text-[#86868B]'; // Default empty
                    
                    if (status === 'Hadir') {
                      bgColor = 'bg-black dark:bg-white';
                      textColor = 'text-white dark:text-black';
                    }
                    if (status === 'Izin') {
                      bgColor = 'bg-[#1D1D1F] dark:bg-[#E5E5EA]';
                      textColor = 'text-white dark:text-black';
                    }
                    if (status === 'Sakit') {
                      bgColor = 'bg-[#86868B]';
                      textColor = 'text-white';
                    }
                    if (status === 'Alpa') {
                      bgColor = 'bg-[#E5E5EA] dark:bg-[#48484A]';
                      textColor = 'text-black dark:text-white';
                    }
                    
                    return (
                      <div 
                        key={i} 
                        className={`w-full aspect-square rounded-sm ${bgColor} border border-[#E5E5EA] dark:border-[#3A3A3C] flex items-center justify-center`}
                        title={`${day.toLocaleDateString('id-ID')}: ${status}`}
                      >
                        <span className={`text-[9px] font-bold ${textColor}`}>
                          {day.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <LogTracker history={history} />
        </div> {/* Close Right Column */}
      </div> {/* Close Grid Layout */}

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
