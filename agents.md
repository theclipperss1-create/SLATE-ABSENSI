# 🍏 Klas Absensi Studio — Sistem Desain & Panduan Agen AI
> **Versi:** 2.0 (Edisi Monokrom Minimalis Apple)  
> **Target Rute Produksi:** > - Admin Dashboard: `https://absensi-harian.vanzdev.biz.id/admin/dashboard`  
> - Student Dashboard: `https://absensi-harian.vanzdev.biz.id/siswa/dashboard`  

---

## 1. Arsitektur Sistem & Aturan Main

Aplikasi ini menggunakan framework **Next.js 14+ (App Router)**, **Tailwind CSS**, **Framer Motion**, dan **Firebase Suite**. Sistem memisahkan hak akses secara mutlak menggunakan *Role-Based Access Control* (RBAC) pada tingkat folder dan backend (*Firestore Rules*).

### 🔒 Aturan Penguncian Waktu (Time-Lock) & Lokasi
1. **Jendela Waktu Ketat:** Proses absensi hanya dibuka pada pukul **05:00 AM – 07:00 AM WIB**.
2. **Validasi Server-Side:** Pengecekan waktu *wajib* menembak API Route internal (`/api/time-lock/route.ts`) untuk mengambil waktu absolut server, guna mencegah manipulasi jam lokal pada perangkat siswa.
3. **Radius Koordinat (Geofencing):** Pengiriman absensi wajib memvalidasi lokasi menggunakan *Haversine Formula* dengan batas radius maksimal **100 meter** dari titik tengah sekolah.

---

## 2. Spesifikasi Desain (Monokrom Minimalis Apple)

Sistem wajib mengikuti *Apple Human Interface Guidelines* dengan pendekatan editorial premium. Fokus pada kekuatan tipografi, kontras tinggi, dan *whitespace* yang lega. **Dilarang keras menggunakan warna-warni jenuh (No Accent Colors)** seperti tombol hijau/biru SaaS generik.

### 🎨 Konfigurasi Palet Warna Tailwind
* `apple-bg`: `#F5F5F7` (Abu-abu sangat muda khas latar belakang perangkat Apple)
* `apple-card`: `#FFFFFF` (Putih bersih dengan bayangan mikro halus)
* `apple-mono-black`: `#000000` (Hitam pekat untuk judul utama dan teks berbobot tebal)
* `apple-mono-charcoal`: `#1D1D1F` (Arang gelap untuk teks isi/body dan interaksi sekunder)
* `apple-mono-gray-dark`: `#86868B` (Abu-abu mineral untuk label sub-informasi dan deskripsi)
* `apple-mono-gray-light`: `#E5E5EA` (Abu-abu sistem tipis untuk pembatas garis 1px dan kondisi tidak aktif)

---

## 3. Cetak Biru Prompt Frontend (Dasbor Siswa)

*Salin seluruh blok teks di bawah ini dan berikan kepada Agen AI untuk menghasilkan kode halaman sisi siswa secara utuh dan responsif.*

```text
Act as an elite Senior Frontend Engineer and Apple UI/UX Product Architect. Build the complete, production-ready frontend code for the Student Dashboard at `/src/app/(dashboard)/(siswa-routes)/siswa/dashboard/page.tsx` using Next.js 14+ (App Router), Tailwind CSS, and Framer Motion.

STRICT VISUAL HIERARCHY & DESIGN SYSTEM (Apple Monochrome Typography):
- Palette: Pure White (#FFFFFF), Light Gray (#F5F5F7), System Gray Line (#E5E5EA), Mineral Gray (#86868B), True Black (#000000). Strictly NO other colors or color accents allowed.
- Typography: High-contrast Apple editorial style. Massive page titles (text-4xl font-black tracking-tight), bold section headers (text-xl font-bold tracking-tight), and clean labels (text-xs font-medium text-apple-mono-gray-dark tracking-wide uppercase).
- Layout Architecture: Generous whitespace padding (p-6 or p-8) and signature smooth Apple squircle corners (rounded-2xl / rounded-3xl).

MOBILE-FIRST & RESPONSIVE LAYOUT RULES:
- Mobile Phones (< md): Layout MUST stack into a single-column vertical editorial feed. Title scales down slightly to 'text-3xl' and padding condenses to 'p-5' to preserve screen estate. Touch targets must be large, comfortable, and responsive for thumbs with micro-shadow transitions.
- Tablets & Desktops (>= md): Transform layout into a perfectly proportioned 12-column grid. Left Column (Attendance Console) spans 7 slots. Right Column (Timetable) spans 5 slots.

INTEGRATE THESE INTERACTIVE FRONTEND STATES & FEATURES (Using clean inline local useState states for absolute complete functionality):

1. SIMPLE MINIMALIST APPLE BUTTONS [Hadir], [Izin], [Sakit], [Alpa]:
   - DO NOT use generic capsules, pills, or rigid grids. Use flat, clean minimalist rectangular layout buttons with smooth rounded corners.
   - Inactive state: light gray background with mineral gray text.
   - Active state: Instantly flips contrast to solid true black with pure white text using a subtle Framer Motion spring physics bounce (whileTap={{ scale: 0.98 }}).
   - Interaction: Clicking any status (except Alpa) smoothly expands the Camera Drawer downwards.

2. EXPANDABLE CAMERA DRAWER & SELFIE CAPTURE:
   - When a status is active, a container slides open downwards using Framer Motion spring physics.
   - Inside, display a webcam viewfinder container box (styled in sleek gray with premium rounded corners and a 100% grayscale filter depth).
   - Features a text-link style button: "Ambil Foto Selfie". Clicking it simulates a snapshot catch, showing a progress thin black loading line at the bottom, and displays a grayscale image preview inside the container.

3. "KIRIM DATA ABSENSI KE SERVER" SUBMIT ACTION:
   - A solid, true black rectangular full-width button with Apple corner radiuses.
   - Clicking this executes a mock check validating secure 05:00 - 07:00 AM WIB attendance window rules and 100-meter GPS radius bounds.
   - It locks the state (making everything read-only once submitted) and triggers an elegant monochrome frosted-glass custom overlay alert modal (using 'backdrop-blur-md bg-white/80') showing the success/failure state.

4. SYSTEM REMINDER BANNER:
   - Appears conditionally at the top if the student has not checked in.
   - Design: Pure white background, thin border line, 100% clean typography stating: "⚠️ Cek Status: Absensi hari ini belum direkam. Selesaikan sebelum pukul 07:00 WIB."

5. INTEGRATED CLASS SCHEDULE (Jadwal Pelajaran):
   - Title header: "02 / JADWAL MATALATIH".
   - A vertical stack listing the daily subjects. Left side: exact hours in bold true black. Right side: subject titles in charcoal.
   - The currently active running subject row must display a clean solid black vertical accent line indicator on its left border.

6. HISTORICAL LOG TRACKER (Riwayat Absensi):
   - Title header: "03 / PELACAK RIWAYAT LOG".
   - A high-contrast minimalist table view tracking past records for the logged-in student.
   - Each row reveals the Date, Status, precise Check-in time, and a 40x40px rounded preview thumbnail of their selfie snapshot rendered in 100% grayscale.

7. LOGOUT HEADER ACTION:
   - A minimalist "Keluar" text-link on the top-right header with an empty onClick handler structure ready to wire up Firebase Auth signOut.

Output the entire, comprehensive file code. Do not clip, compromise layout whitespace, or use placeholder truncation on the Tailwind and layout structure. Ensure everything is complete, visually engaging to avoid user boredom, and highly interactable instantly.