-- ============================================================================
-- Skrip Manajemen Pengguna & Database MySQL - KawanUsaha
-- File: backend/database/user.sql
-- Engine: MySQL 8.x
-- ============================================================================

-- 1. Buat database kawan_usaha_db jika belum ada (karakter utf8mb4)
CREATE DATABASE IF NOT EXISTS kawan_usaha_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Buat user database MySQL 'kawan_admin'@'localhost' dengan password aman
-- Password disinkronkan dengan .env: KawanUsaha2026!
CREATE USER IF NOT EXISTS 'kawan_admin'@'localhost' IDENTIFIED BY 'KawanUsaha2026!';

-- Memastikan autentikasi tersinkronisasi jika user sudah pernah dibuat sebelumnya
ALTER USER 'kawan_admin'@'localhost' IDENTIFIED BY 'KawanUsaha2026!';

-- 3. Berikan hak akses penuh (GRANT ALL PRIVILEGES) ke database kawan_usaha_db
GRANT ALL PRIVILEGES ON kawan_usaha_db.* TO 'kawan_admin'@'localhost';

-- 4. Terapkan pembaruan hak akses (privileges)
FLUSH PRIVILEGES;
