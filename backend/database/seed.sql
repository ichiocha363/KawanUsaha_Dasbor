-- ============================================================================
-- Data Awal / Seeding Simulasi - KawanUsaha (kawan_usaha_db)
-- File: backend/database/seed.sql
-- Profil Usaha: Warung Mitra (Bekasi)
-- ============================================================================

USE kawan_usaha_db;

-- Nonaktifkan sementara pemeriksaan foreign key agar seeding bersih & idompoten
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE mutasi_stok;
TRUNCATE TABLE transaksi;
TRUNCATE TABLE bahan_baku;
TRUNCATE TABLE produk;
TRUNCATE TABLE pengguna;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. DATA PENGGUNA (Admin Pemilik Warung Mitra Bekasi)
-- Password default: 'admin123' (disimpan dalam format hash bcrypt)
-- ----------------------------------------------------------------------------
INSERT INTO pengguna (
  id,
  nama_lengkap,
  email,
  password,
  nama_usaha,
  kota,
  peran,
  status_langganan,
  modal_kas_awal
) VALUES (
  1,
  'Siti Rahmawati',
  'admin@warungmitra.com',
  '$2b$10$a6bZAzl3FjRtc4dLp9f68Od6LZqHeYSaDbSZ8UbIlFDkzsigg6vTu',
  'Warung Mitra',
  'Bekasi',
  'admin',
  'Mitra Premium',
  500000.00
);

-- ----------------------------------------------------------------------------
-- 2. DATA MENU PRODUK KULINER (5 Menu Utama)
-- ----------------------------------------------------------------------------
INSERT INTO produk (
  id,
  pengguna_id,
  nama_produk,
  kategori,
  harga_jual,
  estimasi_hpp,
  status_aktif
) VALUES
  (1, 1, 'Ayam Goreng Sambal Korek', 'makanan', 22000.00, 14000.00, TRUE),
  (2, 1, 'Nasi Goreng Spesial', 'makanan', 18000.00, 10000.00, TRUE),
  (3, 1, 'Mie Goreng Jawa', 'makanan', 16000.00, 8500.00, TRUE),
  (4, 1, 'Es Teh Manis', 'minuman', 5000.00, 1800.00, TRUE),
  (5, 1, 'Es Jeruk Peras', 'minuman', 7000.00, 3000.00, TRUE);

-- ----------------------------------------------------------------------------
-- 3. DATA BAHAN BAKU DAPUR (5 Bahan: Mencakup Kritis, Menipis, & Aman)
-- Aturan Status:
--   - KRITIS : stok <= batas_minimum
--   - MENIPIS: stok <= 1.5 * batas_minimum AND stok > batas_minimum
--   - AMAN   : stok > 1.5 * batas_minimum
-- ----------------------------------------------------------------------------
INSERT INTO bahan_baku (
  id,
  pengguna_id,
  nama_bahan,
  stok_saat_ini,
  batas_minimum,
  satuan,
  estimasi_harga_satuan
) VALUES
  -- 1. Status KRITIS: 0.80 kg <= 2.00 kg (Cabai menipis drastis, butuh restock segera)
  (1, 1, 'Cabai Rawit Merah', 0.80, 2.00, 'kg', 65000.00),

  -- 2. Status MENIPIS: 4.00 kg < 4.50 kg <= 6.00 kg (Ayam potong perlu dipantau)
  (2, 1, 'Ayam Potong Segar', 4.50, 4.00, 'kg', 38000.00),

  -- 3. Status MENIPIS: 3.00 kg < 3.50 kg <= 4.50 kg (Telur ayam mendekati batas)
  (3, 1, 'Telur Ayam Negeri', 3.50, 3.00, 'kg', 28000.00),

  -- 4. Status AMAN: 25.00 kg > 15.00 kg (Persediaan beras sangat mencukupi)
  (4, 1, 'Beras Putih Premium', 25.00, 10.00, 'kg', 14000.00),

  -- 5. Status AMAN: 12.00 liter > 7.50 liter (Persediaan minyak aman)
  (5, 1, 'Minyak Goreng Sawit', 12.00, 5.00, 'liter', 17000.00);

-- ----------------------------------------------------------------------------
-- 4. DATA TRANSAKSI AWAL (Arus Kas Masuk & Keluar Harian)
-- ----------------------------------------------------------------------------
INSERT INTO transaksi (
  id,
  pengguna_id,
  jenis_transaksi,
  kategori,
  nominal,
  keterangan,
  tanggal_transaksi
) VALUES
  (1, 1, 'masuk', 'modal_awal', 500000.00, 'Modal kas harian awal di laci kasir', '2026-11-07 07:00:00'),
  (2, 1, 'keluar', 'belanja_modal', 320000.00, 'Belanja bahan baku subuh di Pasar Baru Bekasi (ayam, cabai, telur, beras)', '2026-11-07 07:45:00'),
  (3, 1, 'keluar', 'operasional', 22000.00, 'Isi ulang tabung gas LPG 3kg dapur', '2026-11-07 09:15:00'),
  (4, 1, 'masuk', 'penjualan', 285000.00, 'Pendapatan kasir makan siang (11 porsi ayam sambal korek & 8 es teh manis)', '2026-11-07 13:30:00'),
  (5, 1, 'masuk', 'penjualan', 165000.00, 'Pendapatan kasir sore (6 porsi nasi goreng spesial, 3 mie goreng jawa & 5 es jeruk)', '2026-11-07 17:45:00');

-- ----------------------------------------------------------------------------
-- 5. DATA MUTASI STOK BAHAN BAKU (Histori Pergerakan Inventaris)
-- ----------------------------------------------------------------------------
INSERT INTO mutasi_stok (
  id,
  bahan_baku_id,
  jenis_mutasi,
  jumlah,
  sumber,
  dibuat_pada
) VALUES
  -- Mutasi Cabai Rawit Merah (id: 1) -> Sisa: 3.00 - 2.20 = 0.80 kg
  (1, 1, 'masuk', 3.00, 'restock_pasar', '2026-11-07 08:00:00'),
  (2, 1, 'keluar', 2.20, 'pemakaian_penjualan', '2026-11-07 14:00:00'),

  -- Mutasi Ayam Potong Segar (id: 2) -> Sisa: 10.00 - 5.50 = 4.50 kg
  (3, 2, 'masuk', 10.00, 'restock_pasar', '2026-11-07 08:00:00'),
  (4, 2, 'keluar', 5.50, 'pemakaian_penjualan', '2026-11-07 14:00:00'),

  -- Mutasi Telur Ayam Negeri (id: 3) -> Sisa: 5.00 - 1.50 = 3.50 kg
  (5, 3, 'masuk', 5.00, 'restock_pasar', '2026-11-07 08:00:00'),
  (6, 3, 'keluar', 1.50, 'pemakaian_penjualan', '2026-11-07 18:00:00'),

  -- Mutasi Beras Putih Premium (id: 4) -> Sisa: 30.00 - 5.00 = 25.00 kg
  (7, 4, 'masuk', 30.00, 'restock_pasar', '2026-11-07 08:00:00'),
  (8, 4, 'keluar', 5.00, 'pemakaian_penjualan', '2026-11-07 14:00:00'),

  -- Mutasi Minyak Goreng Sawit (id: 5) -> Sisa: 15.00 - 3.00 = 12.00 liter
  (9, 5, 'masuk', 15.00, 'restock_pasar', '2026-11-07 08:00:00'),
  (10, 5, 'keluar', 3.00, 'pemakaian_penjualan', '2026-11-07 18:00:00');
