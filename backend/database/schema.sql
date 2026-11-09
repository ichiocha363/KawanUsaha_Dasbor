-- ============================================================================
-- Skema Database KawanUsaha (kawan_usaha_db)
-- File: backend/database/schema.sql
-- Engine: MySQL 8.x (InnoDB)
-- ============================================================================

-- Inisialisasi Database
CREATE DATABASE IF NOT EXISTS kawan_usaha_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kawan_usaha_db;

-- ----------------------------------------------------------------------------
-- 1. TABEL PENGGUNA (Akun Pengelola & Staf Mitra UMKM)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengguna (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt password akun',
  nama_usaha VARCHAR(100) NOT NULL DEFAULT 'Warung Mitra',
  kota VARCHAR(50) NOT NULL DEFAULT 'Bekasi',
  peran ENUM('admin', 'kasir') NOT NULL DEFAULT 'admin',
  status_langganan VARCHAR(50) NOT NULL DEFAULT 'Mitra Premium',
  modal_kas_awal DECIMAL(12, 2) NOT NULL DEFAULT 500000.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pengguna_email (email),
  INDEX idx_pengguna_peran (peran)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABEL PRODUK (Daftar Menu Makanan, Minuman, & Camilan)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produk (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pengguna_id INT UNSIGNED NOT NULL,
  nama_produk VARCHAR(100) NOT NULL,
  kategori VARCHAR(50) NOT NULL COMMENT 'makanan, minuman, camilan',
  harga_jual DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  estimasi_hpp DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Estimasi Harga Pokok Penjualan / Modal per porsi',
  status_aktif BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE jika menu aktif/dijual',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_produk_pengguna (pengguna_id),
  INDEX idx_produk_kategori (kategori),
  CONSTRAINT fk_produk_pengguna
    FOREIGN KEY (pengguna_id) REFERENCES pengguna (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. TABEL BAHAN BAKU (Inventaris Persediaan Bahan Dapur)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bahan_baku (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pengguna_id INT UNSIGNED NOT NULL,
  nama_bahan VARCHAR(100) NOT NULL,
  stok_saat_ini DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  batas_minimum DECIMAL(10, 2) NOT NULL DEFAULT 1.00 COMMENT 'Batas peringatan status kritis',
  satuan VARCHAR(20) NOT NULL COMMENT 'kg, gr, butir, liter, ikat, dll',
  estimasi_harga_satuan DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  terakhir_diubah TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bahan_pengguna (pengguna_id),
  CONSTRAINT fk_bahan_baku_pengguna
    FOREIGN KEY (pengguna_id) REFERENCES pengguna (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. TABEL TRANSAKSI (Arus Kas Masuk & Keluar)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaksi (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pengguna_id INT UNSIGNED NOT NULL,
  jenis_transaksi ENUM('masuk', 'keluar') NOT NULL,
  kategori VARCHAR(50) NOT NULL COMMENT 'penjualan, belanja_modal, operasional, modal_awal',
  nominal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  keterangan TEXT NULL,
  tanggal_transaksi DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_transaksi_pengguna (pengguna_id),
  INDEX idx_transaksi_jenis (jenis_transaksi),
  INDEX idx_transaksi_tanggal (tanggal_transaksi),
  CONSTRAINT fk_transaksi_pengguna
    FOREIGN KEY (pengguna_id) REFERENCES pengguna (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. TABEL MUTASI STOK (Riwayat Arus Keluar / Masuk Stok Bahan)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mutasi_stok (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bahan_baku_id INT UNSIGNED NOT NULL,
  jenis_mutasi ENUM('masuk', 'keluar') NOT NULL,
  jumlah DECIMAL(10, 2) NOT NULL,
  sumber VARCHAR(100) NOT NULL COMMENT 'restock_pasar, pemakaian_penjualan, basi_rusak, penyesuaian',
  dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mutasi_bahan (bahan_baku_id),
  INDEX idx_mutasi_jenis (jenis_mutasi),
  CONSTRAINT fk_mutasi_bahan_baku
    FOREIGN KEY (bahan_baku_id) REFERENCES bahan_baku (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
