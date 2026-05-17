# Slate — Mark Your Presence

Sistem Absensi Harian Digital berbasis web dengan pendekatan desain **Monokrom Minimalis Apple** menggunakan Next.js 14 (App Router) dan Firebase.

---

## 🔒 PANDUAN MANAJEMEN AKUN (PENTING)

Sistem ini menggunakan pemisahan hak akses (*Role-Based Access Control*) berdasarkan data di Firestore.

### 1. Cara Menambah Admin Baru
Untuk alasan keamanan, penambahan Admin **hanya bisa dilakukan secara manual** melalui Firebase Console:
1. Buka **Firebase Console** -> **Authentication** -> Tab **Users**.
2. Klik **Add user** dan buat email & password untuk admin baru.
3. Salin **User UID** yang digenerate.
4. Buka **Firestore Database** -> Koleksi `users`.
5. Klik **Add document**, isi **Document ID** dengan **User UID** tadi.
6. Tambahkan field:
   - `name` (string): Nama Admin
   - `email` (string): Email Admin
   - `role` (string): **`admin`** (harus huruf kecil semua)

### 2. Cara Menambah Siswa Baru
Admin dapat menambah siswa langsung melalui aplikasi di halaman **Daftar Siswa**:
1. Klik tombol **Tambah Siswa**.
2. Isi Nama, Email, Password, dan No. Absen.
3. Sistem akan otomatis mendaftarkan akun ke Firebase Auth dan membuat datanya di Firestore dengan role `siswa`.
*Catatan: Fitur ini menggunakan aplikasi sekunder di latar belakang agar sesi login Admin Anda tidak terputus.*

---

## 🛡️ PANDUAN KEAMANAN & DEPLOY (VERCEL)

Aplikasi ini siap di-deploy ke **Vercel**, namun Anda **WAJIB** memperhatikan hal-hal keamanan berikut:

### 1. Lindungi API Key dan Environment Variables
Jangan pernah memasukkan file `.env.local` ke dalam Git/GitHub. File ini sudah otomatis diabaikan oleh `.gitignore` yang saya buat.
Saat men-deploy di Vercel, masukkan variabel berikut di bagian **Environment Variables** di Dashboard Vercel:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 2. Terapkan Firestore Security Rules
Pastikan Anda telah mengunggah aturan keamanan dari file `firestore.rules` ke Firebase Console Anda. Aturan ini membatasi agar:
- Siswa hanya bisa membaca data mereka sendiri.
- Hanya Admin yang bisa mengubah data penting.
- Mencegah manipulasi data dari luar aplikasi.

---

## 🚀 FITUR UTAMA (CORE FEATURES)

- **Desain Premium Apple**: Antarmuka monokrom ultra-clean, kontras tinggi, dan lega.
- **Geofencing (Radius GPS)**: Memvalidasi jarak siswa maksimal 100 meter dari titik koordinat sekolah (Bisa disesuaikan di kode).
- **Time-Lock Server**: Mengunci waktu absen hanya pada pukul 05:00 - 07:00 WIB menggunakan waktu absolut dari API server untuk mencegah manipulasi jam HP siswa.
- **Selfie Capture**: Mengambil foto bukti kehadiran menggunakan kamera depan dengan filter grayscale estetik.
- **Live Broadcast Announcement**: Guru dapat mengirimkan pengumuman yang langsung muncul di dashboard seluruh siswa secara real-time.
- **Grafik Kalender Kehadiran**: Visualisasi kehadiran siswa dalam bentuk grid kotak seperti GitHub kontribusi.

---

## 🛠️ INSTALASI LOKAL

1. Clone repositori ini.
2. Jalankan `npm install` untuk memasang dependensi.
3. Duplikat file environment dan isi dengan kredensial Firebase Anda.
4. Jalankan `npm run dev` untuk memulai server lokal.

---
*Dikembangkan dengan standar keamanan tinggi dan estetika premium.*
