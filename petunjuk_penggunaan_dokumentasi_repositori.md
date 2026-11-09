# Dasbor Admin KawanUsaha (`kasirku-admin`)

Aplikasi web dasbor operasional dan kasir UMKM kuliner berbasis monorepo (React TypeScript + Node.js Express MySQL).

---

## 📋 Prasyarat Sistem
- **Node.js**: versi $\ge 18.x$
- **MySQL Server**: versi $\ge 8.0$ atau MariaDB $\ge 10.4$
- **NPM** atau **Yarn**

---

## 🚀 Panduan Menjalankan Proyek

### 1. Persiapan Database MySQL
1. Buka MySQL client atau phpMyAdmin.
2. Eksekusi script SQL yang berada di folder `backend/database/`:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p < backend/database/seed.sql
   ```

### 2. Konfigurasi dan Jalankan Backend
1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Salin file environment:
   ```bash
   cp .env.example .env
   ```
   *Sesuaikan konfigurasi `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (default: `kawanusaha_db`), dan `PORT` (default: `5000`).*
4. Jalankan backend dalam mode pengembangan:
   ```bash
   npm run dev
   ```
   *Server backend berjalan di `http://localhost:5000`.*

### 3. Konfigurasi dan Jalankan Frontend
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Pastikan `vite.config.ts` telah memproksi endpoint `/api` ke port `5000`:
   ```typescript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
       }
     }
   }
   ```
4. Jalankan server pengembang frontend:
   ```bash
   npm run dev
   ```
   *Buka antarmuka dasbor di browser pada `http://localhost:5173`.*

---

## 🧪 Akun Uji Coba Default (Seeding Data)
- **Email**: `admin@warungmitra.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Unit Usaha**: Warung Mitra Kuliner Bekasi

---

## 📦 Dependensi Utama
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Axios.
- **Backend**: Express, TypeScript, mysql2/promise, dotenv, cors, bcryptjs, jsonwebtoken.