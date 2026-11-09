# Product Requirements Document (PRD) — Dasbor KawanUsaha

- **Nama Proyek**: Dasbor Admin & Operasional KawanUsaha
- **Versi**: 1.0.0 (MVP Pelatihan Fullstack)
- **Target Platform**: Desktop Web & Mobile Responsive (`kasirku-admin`)
- **Struktur Repositori**: Monorepo (`frontend/` Vite React TS + `backend/` Node.js Express TS MySQL)

---

## 1. Ringkasan Eksekutif & Latar Belakang
KawanUsaha adalah platform asisten bisnis dan operasional berbasis web untuk pelaku UMKM kuliner di Indonesia (khususnya wilayah Bekasi dan sekitarnya). Platform ini membantu wirausahawan mencatat transaksi penjualan kasir, memantau persediaan bahan mentah dapur, menghitung estimasi keuntungan bersih, serta memberikan rekomendasi restock bahan sebelum kehabisan.

Dasbor ini dibangun mandiri di dalam repositori `kasirku-admin` tanpa bergantung pada landing page statis terdahulu, menggunakan arsitektur clean monorepo frontend-backend.

---

## 2. Struktur Pohon Folder & Standar Kode

Mengikuti pohon folder resmi pelatihan:
```text
kasirku-admin/
├── frontend/
│   ├── vite.config.ts            # Proxy config ke /api (port backend 5000)
│   ├── src/
│   │   ├── api/                  # client.ts (Axios), produk.ts, pengguna.ts, bahan.ts, transaksi.ts
│   │   ├── components/           # FormProduk.tsx, FormBahan.tsx, StatCard.tsx, ModalDialog.tsx
│   │   ├── data/                 # pengguna.ts (state dummy / mock testing)
│   │   ├── pages/
│   │   │   ├── HalamanLogin.tsx
│   │   │   ├── HalamanRegister.tsx
│   │   │   └── admin/
│   │   │       ├── Beranda.tsx   # Ringkasan KPI, Grafik Omzet, Bahan Perlu Dicek
│   │   │       ├── Produk.tsx    # Manajemen Menu Makanan & Minuman
│   │   │       ├── Pengguna.tsx  # Manajemen User & Mitra
│   │   │       ├── Inventaris.tsx# Tabel Stok Bahan Dapur (Aman, Menipis, Kritis)
│   │   │       └── Transaksi.tsx # Kasir Cepat & Mutasi Kas Masuk/Keluar
│   │   ├── App.tsx               # Routing React Router DOM & Auth Guard
│   │   └── styles/
│   │       └── admin.css         # Styling token, root variables, layout Flexbox/Grid
└── backend/
    ├── database/
    │   ├── schema.sql            # DDL struktur tabel (users, products, ingredients, transactions, stock_mutations)
    │   ├── seed.sql              # Data awal simulasi (Warung Mitra Bekasi)
    │   └── user.sql              # Hak akses user database
    ├── src/
    │   ├── index.ts              # Entry point Express server
    │   ├── db.ts                 # Koneksi pool mysql2/promise
    │   ├── models/               # Interface TypeScript data model
    │   ├── repository/           # Lapisan query SQL langsung
    │   ├── controller/           # Handler request & response JSON
    │   ├── routes/               # Express Router mapping (/api/...)
    │   └── middleware/
    │       └── error.ts          # Global exception & error handler
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## 3. Fitur Utama & Kebutuhan Fungsional

### 3.1 Otentikasi & Pengguna (Auth & RBAC)
- **Halaman Login & Register**: Input email/username dan password dengan validasi ketat di sisi klien dan server.
- **Role**: `admin` (pemilik warung) dan `kasir` (staf operasional).

### 3.2 Dasbor Beranda (Ringkasan Dapur)
- **Kartu Metrik KPI**:
  1. *Omzet Hari Ini*: Penjumlahan transaksi kas masuk hari ini.
  2. *Belanja Modal*: Penjumlahan pengeluaran pembelian bahan hari ini.
  3. *Estimasi Laba Kotor*: $\text{Omzet} - \text{Belanja Modal}$.
  4. *Status Inventaris*: Total bahan kategori Aman, Menipis, dan Kritis.
- **Top 5 Menu Terlaris**: Agregasi jumlah porsi terjual berdasarkan transaksi penjualan.
- **Aktivitas Transaksi Terbaru**: 5-8 baris mutasi arus kas terakhir.

### 3.3 Manajemen Menu (Produk)
- CRUD Daftar Menu kuliner (Nama, Kategori, Harga Jual, Modal/HPP, Status Tersedia).
- Validasi harga jual $\ge$ harga modal dan nilai lebih dari 0.

### 3.4 Inventaris Dapur & Pemantauan Stok
- Tabel bahan baku: Nama Bahan, Sisa Stok, Satuan (kg, gr, butir, liter), Batas Minimum.
- **Aturan Status Stok (Business Rule non-AI)**:
  - Jika $\text{stok} \le \text{batas\_minimum} \implies$ **Kritis** (Badge Merah).
  - Jika $\text{stok} \le \text{batas\_minimum} \times 1.5 \implies$ **Menipis** (Badge Oranye/Kuning).
  - Selainnya $\implies$ **Aman** (Badge Hijau).
- Form Tambah & Restock Bahan: Memperbarui stok dan mencatat mutasi keluar/masuk secara otomatis.

### 3.5 Transaksi Kasir & Arus Kas
- Kasir cepat memilih produk makanan/minuman, menghitung subtotal dan total otomatis.
- Catat Kas Masuk (Penjualan harian, pesanan katering).
- Catat Kas Keluar (Belanja bahan baku pasar, listrik/gas operasional).
- Validasi: Penjualan ditolak jika stok bahan resep terkait tidak mencukupi.

---

## 4. Kebutuhan Non-Fungsional (NFR)
1. **Performa**: Response time API rata-rata $\le 200\text{ ms}$ untuk data operasional lokal.
2. **Aksesibilitas & Tampilan**: Mobile-first responsive, target tombol sentuh minimal 44px, kontras rasio teks memenuhi WCAG AA.
3. **Integritas Data**: Menggunakan transaksi database (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) saat mencatat penjualan multi-item yang memotong stok.