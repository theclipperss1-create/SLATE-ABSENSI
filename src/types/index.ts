export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'siswa';
  kelas?: string;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  userName: string;
  date: string;
  time: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  selfieUrl?: string;
  reason?: string;
  location?: {
    lat: number;
    lng: number;
  };
}
