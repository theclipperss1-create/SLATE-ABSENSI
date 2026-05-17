# Checklist Kesiapan Produksi (Go-Live)
Dokumen ini mencantumkan hal-hal yang harus disesuaikan kembali sebelum aplikasi absensi dideploy ke server produksi agar berjalan secara aman dan normal.

## 1. Validasi Keamanan & Aturan Bisnis
- [ ] **Aktifkan Radius GPS (Geofencing)**: Hapus kode `false &&` pada file `src/app/(dashboard)/(siswa-routes)/siswa/dashboard/page.tsx` di bagian fungsi `handleSubmit` agar jarak 100 meter divalidasi secara ketat.
- [ ] **Kunci Jendela Waktu Server**: Pastikan pengecekan waktu absolut dari API Route (`/api/time-lock/route.ts`) tidak dapat dilewati dan berjalan sesuai aturan (05:00 - 07:00 WIB).

## 2. Pembersihan Jalur Pengembang (Developer Routes)
- [ ] **Hapus/Proteksi Halaman Dummy**: Halaman `/seed-35` (untuk membuat 35 data palsu) dan `/delete-all` (untuk menghapus semua logs) harus dihapus atau diberi proteksi admin agar tidak bisa diakses oleh publik atau siswa.
- [ ] **Pembersihan Database**: Kosongkan koleksi `attendance_logs` di Firestore produksi dari data-data hasil uji coba selama pengembangan.

## 3. Konfigurasi Firebase & Environment
- [ ] **Update Firestore Rules**: Pastikan file `firestore.rules` sudah dideploy ke Firebase Console untuk membatasi hak akses baca/tulis berdasarkan role pengguna.
- [ ] **Environment Variables**: Pastikan file `.env.local` sudah disesuaikan dengan kredensial Firebase proyek produksi Anda (jika menggunakan proyek berbeda antara dev dan prod).

## 4. Optimalisasi Performa
- [ ] **Kompresi Gambar Selfie**: Pastikan ukuran file foto selfie yang diupload tidak terlalu besar untuk menghemat kuota Firebase Storage dan mempercepat proses submit.
