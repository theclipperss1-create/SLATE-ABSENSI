# 🍏 Klas Absensi Studio — Sistem Desain & Panduan Agen AI

Aplikasi Absensi Harian Siswa dengan pendekatan desain **Monokrom Minimalis Apple** menggunakan Next.js 14 (App Router) dan Firebase.

## 🚀 Fitur Utama
- **Desain Premium**: Mengikuti pedoman Apple dengan warna monokrom, kontras tinggi, dan tipografi kuat.
- **Time-Lock & Geofencing**: Pembatasan waktu absensi (05:00 - 07:00 WIB) dan radius lokasi (100 meter) dengan validasi server-side.
- **Role-Based Access Control (RBAC)**: Pemisahan hak akses antara Admin (Guru) dan Siswa.
- **Verifikasi Kamera**: Pengambilan foto selfie sebagai bukti kehadiran dengan filter grayscale.

## 📁 Struktur Folder
```text
/
├── src/
│   ├── app/
│   │   ├── (auth)/login/             # Halaman Login
│   │   ├── (dashboard)/              # Layout & Dashboard
│   │   │   ├── (admin-routes)/       # Dashboard Guru
│   │   │   └── (siswa-routes)/       # Dashboard Siswa
│   │   └── api/time-lock/            # API Waktu Server
│   ├── components/                   # Komponen Reusable
│   ├── hooks/                        # Custom Hooks (Auth, TimeLock)
│   ├── lib/firebase/                 # Konfigurasi & Helper Firebase
│   └── types/                        # Definisi Type TypeScript
```

## 🛠️ Persiapan & Instalasi

1. **Instal Dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Firebase**:
   Buat file `.env.local` di root direktori dan isi dengan kredensial Firebase Anda:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

4. **Firestore Rules**:
   Gunakan file `firestore.rules` untuk mengonfigurasi keamanan di Firebase Console Anda.

## 🎨 Panduan Desain
- **Palette**: Hitam pekat, Putih bersih, Abu-abu mineral, dan Abu-abu sistem.
- **Tipografi**: Menggunakan fallback font sistem Apple (SF Pro) jika tersedia.
- **Whitespace**: Ruang kosong yang lega untuk memberikan kesan premium.

---
Dikembangkan dengan ❤️ untuk Klas Absensi Studio.
