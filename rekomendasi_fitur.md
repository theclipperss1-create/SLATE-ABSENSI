# Rekomendasi Fitur Lanjutan - Klas Absensi Studio

Dokumen ini berisi daftar rekomendasi fitur lanjutan yang dapat ditambahkan ke aplikasi Klas Absensi Studio untuk meningkatkan fungsionalitas, keamanan, dan pengalaman pengguna.

---

## 1. Keamanan & Validasi Kehadiran

### 1.1 Validasi Wi-Fi Sekolah (Anti-Titip Absen)
* **Deskripsi**: Siswa hanya dapat melakukan absensi jika perangkat mereka terhubung ke jaringan Wi-Fi resmi sekolah.
* **Tujuan**: Mencegah siswa melakukan absensi dari rumah meskipun mereka menggunakan aplikasi pengubah lokasi GPS (Fake GPS).
* **Implementasi**: Mengecek SSID atau IP Address jaringan yang digunakan saat tombol absen ditekan.

### 1.2 Scan QR Code Dinamis
* **Deskripsi**: Guru menampilkan QR Code di layar proyektor kelas yang berganti setiap 30 detik. Siswa harus memindai QR Code tersebut untuk bisa absen.
* **Tujuan**: Memastikan siswa benar-benar hadir secara fisik di dalam ruang kelas.
* **Implementasi**: Menggunakan library generator QR di sisi admin dan scanner di sisi siswa.

---

## 2. Pelaporan & Manajemen Data

### 2.1 Unduh Laporan format PDF Siap Cetak
* **Deskripsi**: Menambahkan opsi untuk mengunduh rekap absensi bulanan atau mingguan dalam format PDF yang rapi.
* **Tujuan**: Memudahkan guru dalam mencetak laporan fisik untuk diserahkan ke pihak sekolah atau arsip.
* **Implementasi**: Menggunakan library seperti jsPDF atau React-PDF dengan template desain Apple yang konsisten.

### 2.2 Kirim Rekap Otomatis ke Telegram / WhatsApp
* **Deskripsi**: Sistem otomatis mengirimkan ringkasan daftar siswa yang tidak hadir hari itu ke grup chat guru atau wali kelas setelah jam absen ditutup (pukul 07:00 WIB).
* **Tujuan**: Mempercepat koordinasi dan tindakan dari pihak sekolah terhadap siswa yang tidak hadir.
* **Implementasi**: Integrasi dengan API Telegram Bot atau WhatsApp Gateway.

---

## 3. Pengalaman Pengguna (UX) & Keterlibatan

### 3.1 Statistik Pribadi untuk Siswa
* **Deskripsi**: Menampilkan grafik lingkaran (pie chart) atau ringkasan persentase kehadiran siswa tersebut selama sebulan di dashboard mereka.
* **Tujuan**: Memberikan transparansi kepada siswa mengenai rekam jejak kehadiran mereka sendiri.
* **Implementasi**: Mengambil data logs spesifik user dan menghitung persentase Hadir, Izin, Sakit, dan Alpa.

### 3.2 Sistem Poin Kehadiran (Gamifikasi)
* **Deskripsi**: Memberikan poin kepada siswa yang selalu hadir tepat waktu. Poin ini dapat ditampilkan di dashboard.
* **Tujuan**: Meningkatkan motivasi siswa untuk hadir tepat waktu.
* **Implementasi**: Menambahkan field poin pada dokumen user di Firestore.
