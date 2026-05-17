# 📋 Daftar Tugas (Tasks) — Klas Absensi Studio

## 🟢 Selesai (Completed)
- [x] Inisialisasi proyek Next.js 14 dengan Tailwind CSS.
- [x] Implementasi Desain Monokrom Apple di semua halaman.
- [x] Pembuatan Halaman Login.
- [x] Pembuatan Dashboard Siswa (Kamera Rill & GPS Rill).
- [x] Pembuatan Dashboard Admin (Tabel Data Rill).
- [x] Konfigurasi API Waktu Server (`/api/time-lock`).
- [x] Pembuatan file Aturan Keamanan Firestore (`firestore.rules`).
- [x] Pembuatan file `.firebaserc` dan `firebase.json`.
- [x] Pendaftaran Web App di Firebase dan pembuatan `.env.local`.

## 🟡 Perlu Dilakukan (To Do)

### Sisi Pengguna (Firebase Console)
- [x] Aktifkan **Firestore Database** di Firebase Console (Selesai otomatis via API).
- [x] Aktifkan **Authentication** (Email/Password) di Firebase Console (Selesai otomatis via API).
- [x] Aktifkan **Storage** di Firebase Console (Dibatalkan, dialihkan ke Base64 di Firestore).

### Sisi Developer (Asisten AI)
- [x] **Optimasi Upload Foto**: Ubah penyimpanan dari Base64 ke Firebase Storage (Dibatalkan, tetap menggunakan Base64).
- [x] **Data Seeding**: Buat script/fungsi untuk membuat user dummy (Otomatis saat login dengan admin@test.com).
- [x] **Deploy Aturan Keamanan**: Jalankan `firebase deploy --only firestore:rules` atau salin manual ke console.
- [ ] **Uji Coba (Testing)**: Jalankan aplikasi dan coba alur login hingga absensi.
