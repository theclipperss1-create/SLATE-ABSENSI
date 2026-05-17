# 📂 Struktur Folder Proyek Next.js 14+ (App Router)

Pastikan semua pembuatan file baru diletakkan secara presisi pada pohon direktori berikut:

```text
/
├── public/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (Font, Meta)
│   │   ├── globals.css               # Import Tailwind & Font Face
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx          # Halaman Login Monokrom
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Wrapper Sidebar & Navigasi
│   │   │   ├── (admin-routes)/
│   │   │   │   └── admin/
│   │   │   │       └── dashboard/
│   │   │   │           └── page.tsx  # Kontrol Console Guru
│   │   │   └── (siswa-routes)/
│   │   │       └── siswa/
│   │   │           └── dashboard/
│   │   │               └── page.tsx  # Halaman Utama Siswa
│   │   └── api/
│   │       └── time-lock/
│   │           └── route.ts          # API Ambil Waktu Absolut Server
│   ├── components/
│   │   ├── ui/                       # Tombol, Modal, Input Minimalis
│   │   └── siswa/                    # Sub-komponen khusus halaman siswa
│   ├── hooks/
│   │   ├── useAuth.ts                # Deteksi Session Firebase Auth
│   │   └── useTimeLock.ts            # Pengecekan Jam 05:00 - 07:00 WIB
│   ├── lib/
│   │   └── firebase/
│   │       ├── config.ts             # Inisialisasi Firebase App
│   │       ├── firestore.ts          # Handler CRUD Firestore
│   │       └── storage.ts            # Handler Upload Bukti Gambar
│   └── types/
│       └── index.ts                  # Deklarasi Type TypeScript (User, Log)
├── tailwind.config.ts                # Konfigurasi Tema Monokrom Apple
└── package.json