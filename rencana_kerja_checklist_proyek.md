# TODO.md — Roadmap Eksekusi Dasbor KawanUsaha (`kawan_usaha`)

Dokumen ini memetakan seluruh tugas pengisian kode, penyesuaian fungsi, dan penambahan file yang diperlukan tanpa menghapus struktur folder maupun file yang sudah ada.

---

## 🗄️ BAGIAN 1: DATABASE & BACKEND (`backend/`)

### 1.1 Skema & Seeding SQL (`backend/database/`)
- [x] **Edit `schema.sql`**:
  - [x] Pastikan tabel `pengguna` (id, nama_lengkap, email, password, nama_usaha, kota, peran, status_langganan, modal_kas_awal, timestamps) terdefinisi.
  - [x] Pastikan tabel `produk` (id, pengguna_id, nama_produk, kategori, harga_jual, estimasi_hpp, status_aktif, timestamps) siap pakai.
  - [x] **Tambahkan tabel pendukung** (foreign key ON DELETE CASCADE):
    - [x] Tabel `bahan_baku` (id, pengguna_id, nama_bahan, stok_saat_ini, batas_minimum, satuan, estimasi_harga_satuan, terakhir_diubah).
    - [x] Tabel `transaksi` (id, pengguna_id, jenis_transaksi, kategori, nominal, keterangan, tanggal_transaksi).
    - [x] Tabel `mutasi_stok` (id, bahan_baku_id, jenis_mutasi, jumlah, sumber, dibuat_pada).
- [x] **Edit `seed.sql`**:
  - [x] Masukkan data dummy akun pemilik: `admin@warungmitra.com` (role admin, Warung Mitra Bekasi).
  - [x] Masukkan data dummy 5 menu produk kuliner (Ayam Goreng Sambal Korek, Nasi Goreng Spesial, Es Teh Manis, dll.).
  - [x] Masukkan data dummy 5 bahan mentah mencakup status Kritis, Menipis, dan Aman (Cabai Rawit, Ayam Potong, Telur Ayam, Beras, Minyak).
  - [x] Masukkan catatan transaksi awal (kas masuk & keluar belanja modal/operasional) serta mutasi stok.
- [x] **Edit `user.sql`**:
  - [x] Konfigurasi database `kawan_usaha_db` (utf8mb4) & hak akses user lokal MySQL `kawan_admin`@`localhost`.

### 1.2 Koneksi & Server Core (`backend/src/`)
- [x] **Edit `db.ts`**:
  - [x] Buat connection pool `mysql2/promise` membaca variabel environment (`.env`), `connectionLimit: 10`, `waitForConnections: true`, `queueLimit: 0`.
  - [x] Tambahkan helper `testConnection()` untuk memverifikasi ping koneksi database saat startup.
- [x] **Edit `index.ts`**:
  - [x] Konfigurasi middleware Express: `cors()`, `express.json()`, `express.urlencoded()`.
  - [x] Tambahkan endpoint health-check `GET /api/health` dan `GET /api/cek`.
  - [x] Pasang error handling middleware dari `middleware/error.ts`.
  - [x] Daftarkan rute utama: `/api/pengguna`, `/api/auth`, dan `/api/produk` (port 5000).
- [x] **Edit `middleware/error.ts`**:
  - [x] Tangani error global dalam format `{ success: false, message: ... }` dengan status code sesuai (400, 409, 500).

### 1.3 Modul Pengguna & Auth (`backend/src/`)
- [x] **Edit `models/pengguna.ts`**:
  - [x] Definisikan `interface Pengguna`, `interface PenggunaInput`, `interface PenggunaResponse`.
- [x] **Edit `repository/pengguna.ts`**:
  - [x] Method `cariBerdasarkanEmail(email: string)`.
  - [x] Method `cariBerdasarkanId(id: number)`.
  - [x] Method `buatPengguna(data: PenggunaInput)`.
  - [x] Method `ambilSemuaPengguna()`.
- [x] **Buat `middleware/auth.ts`**:
  - [x] Middleware `authMiddleware` verifikasi JWT Bearer token & pasang `req.user`.
- [x] **Edit `controller/pengguna.ts`**:
  - [x] Handler `login`: validasi isian, cek password hash / verifikasi, kirim token JWT dan profil warung.
  - [x] Handler `register`: validasi input unik, hash password bcrypt, simpan data.
  - [x] Handler `getProfile` & `listPengguna`.
- [x] **Edit `routes/pengguna.ts`**:
  - [x] `POST /api/pengguna/login`
  - [x] `POST /api/pengguna/register`
  - [x] `GET /api/pengguna/profil`
  - [x] `GET /api/pengguna`

### 1.4 Modul Produk & Menu (`backend/src/`)
- [x] **Edit `models/produk.ts`**:
  - [x] Definisikan `interface Produk`, `interface ProdukInput`, `interface BahanBaku`, `type BahanBakuStatus`, `interface RingkasanDasbor`.
- [x] **Edit `repository/produk.ts`**:
  - [x] Method `ambilSemuaProduk(penggunaId: number)`.
  - [x] Method `tambahProduk(penggunaId: number, data: ProdukInput)`.
  - [x] Method `ambilSemuaBahan(penggunaId: number)`.
  - [x] Method `tambahBahan(penggunaId: number, data: Partial<BahanBaku>)`.
  - [x] Method `perbaruiStokBahan(bahanId: number, jumlahTambah: number)`.
  - [x] Method `ambilRingkasanDapur(penggunaId: number)`.
- [x] **Edit `controller/produk.ts`**:
  - [x] Handler `getProduk`, `createProduk`.
  - [x] Handler `getBahanBaku`, `createBahanBaku`, `restockBahan`.
  - [x] Handler `getRingkasanDasbor`.
  - [x] Handler detail, ubah, hapus produk.
- [x] **Edit `routes/produk.ts`**:
  - [x] `GET /api/produk`
  - [x] `POST /api/produk`
  - [x] `GET /api/produk/bahan`
  - [x] `POST /api/produk/bahan`
  - [x] `POST /api/produk/bahan/:id/restock`
  - [x] `GET /api/produk/dasbor/ringkasan`

---

## 🎨 BAGIAN 2: FRONTEND DASBOR (`frontend/`)

### 2.1 Konfigurasi, Styles, & Layout Dasar
- [x] **Edit `vite.config.ts`**:
  - [x] Proxy terhubung ke backend: target `http://localhost:5000`, `changeOrigin: true`, `secure: false`.
- [x] **Edit `styles/admin.css` & `styles/base.css`**:
  - [x] Masukkan CSS variables dari `design.md` (`--color-primary: #1F7A6D`, `--color-secondary: #F29A4B`, `--color-bg-warm: #FAF7EE`, dll.).
  - [x] Atur style reset, container, dan badge status (`Aman`, `Menipis`, `Kritis`).
- [x] **Edit `config/menu.ts`**:
  - [x] Tentukan daftar 6 menu navigasi: Beranda, Transaksi, Inventaris Dapur, Produk & Menu, Kelola Pengguna, Pengaturan.
- [x] **Edit `components/layout/Sidebar.tsx`**:
  - [x] Header branding KawanUsaha ("Asisten Kuliner UMKM").
  - [x] List menu dinamis dari `menu.ts` dengan active state toska lembut (`#e8f3f1` & `#1F7A6D`).
  - [x] Footer sidebar: badge sistem multi-tenancy dan tombol Keluar (Logout) merah.
- [x] **Edit `components/layout/Header.tsx`**:
  - [x] Search input global, notifikasi bahan/transaksi, profil Warung Mitra + badge oranye *"Mitra Premium • Bekasi"*.
- [x] **Edit `components/layout/LayoutAdmin.tsx`**:
  - [x] Menggabungkan Sidebar + Header + area `<main>` dinamis berlatar krem hangat (`#FAF7EE`).
- [x] **Edit `components/Toast.tsx`**:
  - [x] Komponen feedback notifikasi mengambang (Sukses Hijau Teal / Gagal Merah).

### 2.2 Integrasi Model & API Client (`frontend/src/`)
- [x] **Model Frontend (`frontend/src/models/`)**:
  - [x] `akun.ts`: Interface `Pengguna`, `AuthResponse`, `LoginInput`, `RegisterInput`.
  - [x] `produk.ts`: Interface `Produk`, `BahanBaku`, `RingkasanDasbor`.
- [x] **Edit `api/client.ts`**:
  - [x] HTTP fetch helper otomatis menyisipkan `Authorization: Bearer <token>` dari localStorage (`token_kawan_usaha`), unwrap JSON, dan tangani error 401.
- [x] **Edit `api/pengguna.ts`**:
  - [x] Fungsi `loginApi(data)`, `registerApi(data)`, `getProfilApi()`, `logout()`.
- [x] **Edit `api/produk.ts`**:
  - [x] Fungsi `getRingkasanDasborApi()`, `getProdukApi()`, `createProdukApi(data)`, `getBahanBakuApi()`, `createBahanBakuApi(data)`, `restockBahanApi(id, jumlah, jenis, sumber)`.

### 2.3 Form & Komponen Input (`frontend/src/components/`)
- [x] **Edit `components/FormProduk.tsx`**:
  - [x] Input: Nama Menu, Kategori (Makanan/Minuman/Camilan), Harga Jual, Modal/HPP.
  - [x] Validasi error inline (misal: harga jual > modal, harga > 0).
  - [x] Tombol Simpan dengan loading state (`Menyimpan...`).

### 2.4 Halaman Autentikasi (`frontend/src/pages/`)
- [x] **Edit `pages/HalamanLogin.tsx`**:
  - [x] Tampilan form login bergaya KawanUsaha dengan latar krem hangat #FAF7EE, logo toska, dan kartu putih modern.
  - [x] Validasi email/password, toggle intip sandi (Eye/EyeOff), submit ke `loginApi`, feedback Toast, dan redirect ke `/admin`.
- [x] **Edit `pages/HalamanRegister.tsx`**:
  - [x] Form pendaftaran mitra UMKM baru (Nama Usaha, Nama Pemilik, Email, Password min 6 kar, Kota Bekasi, Modal Awal).
  - [x] Submit ke `registerApi`, feedback Toast, simpan sesi otomatis dan arahkan ke `/admin`.

### 2.5 Halaman Dasbor Admin (`frontend/src/pages/admin/`)
- [x] **Edit `pages/admin/Beranda.tsx`**:
  - [x] 3 Kartu KPI atas (Omzet Hari Ini, Belanja Modal, Estimasi Laba Kotor).
  - [x] Kartu Status Bahan Baku Dapur (badge Aman, Menipis, Kritis) & counter boxes.
  - [x] Panel Daftar Menu Terlaris (porsi terjual) & 5 Aktivitas Transaksi Terakhir.
  - [x] Tombol "Unduh Draf Laporan (.txt)" & Tombol Aksi "Buka Asisten AI Belanja".
- [x] **Buat / Edit `pages/admin/HalamanTransaksi.tsx`**:
  - [x] Header halaman dengan deskripsi operasional dan tombol "Unduh Draf Laporan (.txt)".
  - [x] Formulir 2 kolom: Catat Kas Masuk (Pemasukan) & Catat Kas Keluar (Pengeluaran + opsi restock bahan dapur otomatis).
  - [x] Tabel Riwayat Arus Kas lengkap dengan tab filter (Semua, Kas Masuk, Kas Keluar) dan paginasi (10 baris).
  - [x] Integrasi umpan balik `Toast.tsx` dan reset form otomatis.
- [x] **Buat / Edit `pages/admin/HalamanInventaris.tsx`**:
  - [x] 3 Counter box status stok bahan: Aman (Hijau), Menipis (Kuning), Kritis (Merah).
  - [x] Tabel inventaris bahan baku dengan badge status, tombol aksi cepat + Restock, Ubah, dan Hapus.
  - [x] Panel riwayat mutasi stok bahan (keluar/masuk) berstempel waktu.
  - [x] Modal dialog untuk pendaftaran bahan baru dan dialog restock cepat.
- [x] **Edit `pages/admin/HalamanProduk.tsx`**:
  - [x] Tabel data produk real-time dari backend API (`GET /api/produk`).
  - [x] Tombol `+ Tambah Menu Baru` yang memicu form `FormProduk.tsx`.
  - [x] Filter kategori tab (Semua, Makanan, Minuman, Camilan) dan fitur pencarian nama menu.
  - [x] Toggle tombol interaktif ketersediaan menu (Tersedia / Habis) dan tombol Ubah / Hapus.
  - [x] Empty state jika belum ada produk terdaftar.
- [x] **Edit `pages/admin/HalamanPengguna.tsx`**:
  - [x] Tabel daftar staf & akun pengelola warung mitra terhubung ke backend API.
  - [x] Modal dialog "+ Tambah Staf Baru" dengan form validasi lengkap & feedback Toast.
  - [x] Aksi hapus staf (dengan proteksi akun sendiri).
- [x] **Edit `pages/admin/HalamanPengaturan.tsx`**:
  - [x] Informasi outlet kuliner, kota lokasi (Bekasi), modal awal kas harian, dan identitas pemilik.
  - [x] Tombol "Simpan Perubahan Pengaturan" dengan umpan balik toast sukses.
  - [x] Tombol bahaya "Reset Data Simulasi" dengan modal dialog konfirmasi peringatan.

### 2.6 Routing & App Root (`frontend/src/`)
- [x] **Edit `App.tsx`**:
  - [x] Konfigurasi React Router DOM (`/login`, `/register`, `/daftar`, dan rute anak di `/admin/*`).
  - [x] Proteksi akses (Auth Guard): redirect ke `/login` jika user belum memiliki sesi token `token_kawan_usaha`.
  - [x] Rute default `/` otomatis redirect ke `/admin` jika sesi login aktif, atau ke `/login` jika belum.
- [x] **Edit `main.tsx`**:
  - [x] Memastikan stylesheet `base.css`, `form.css`, dan `admin.css` terpasang rapi.

---

## 🧪 BAGIAN 3: PENGUJIAN & PENYELESAIAN
- [ ] Jalankan backend (`cd backend && npm run dev`) dan verifikasi output terminal listening port 5000.
- [ ] Jalankan frontend (`cd frontend && npm run dev`) dan buka di browser.
- [ ] Uji login menggunakan akun default `admin@warungmitra.com`.
- [ ] Uji CRUD menu produk di halaman `HalamanProduk.tsx`.
- [ ] Periksa responsivitas pada mode mobile (`Ctrl + Shift + M`).
- [ ] Simpan commit: `git commit -m "feat: implementasi lengkap dasbor kawanusaha monorepo"`.