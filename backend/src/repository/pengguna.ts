// ============================================================================
// Repository Pengguna (KawanUsaha Database Layer)
// File: backend/src/repository/pengguna.ts
// ============================================================================

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db.js";
import type {
  Pengguna,
  PenggunaInput,
  PenggunaResponse,
  Peran,
} from "../models/pengguna.js";

interface BarisPengguna extends RowDataPacket {
  id: number;
  nama_lengkap: string;
  email: string;
  password: string;
  nama_usaha: string;
  kota: string;
  peran: Peran;
  status_langganan: string;
  modal_kas_awal: string | number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Helper untuk mapping row database MySQL ke interface Pengguna
 */
function petakanPengguna(r: BarisPengguna): Pengguna {
  return {
    id: r.id,
    nama_lengkap: r.nama_lengkap,
    email: r.email,
    password: r.password,
    nama_usaha: r.nama_usaha,
    kota: r.kota,
    peran: r.peran,
    status_langganan: r.status_langganan,
    modal_kas_awal: Number(r.modal_kas_awal || 0),
    dibuat_pada: r.created_at,
    diperbarui_pada: r.updated_at,
    nama: r.nama_lengkap, // alias kompatibilitas
  };
}

/**
 * Helper untuk mapping row database ke interface PenggunaResponse (tanpa password)
 */
function petakanPenggunaResponse(r: BarisPengguna): PenggunaResponse {
  return {
    id: r.id,
    nama_lengkap: r.nama_lengkap,
    email: r.email,
    nama_usaha: r.nama_usaha,
    kota: r.kota,
    peran: r.peran,
    status_langganan: r.status_langganan,
    modal_kas_awal: Number(r.modal_kas_awal || 0),
    dibuat_pada: r.created_at,
    diperbarui_pada: r.updated_at,
    nama: r.nama_lengkap, // alias kompatibilitas
  };
}

/**
 * Mengambil data pengguna lengkap berdasarkan alamat email (dipakai autentikasi)
 */
export async function cariBerdasarkanEmail(email: string): Promise<Pengguna | null> {
  const [rows] = await pool.execute<BarisPengguna[]>(
    `SELECT id, nama_lengkap, email, password, nama_usaha, kota, peran, status_langganan, modal_kas_awal, created_at, updated_at
     FROM pengguna 
     WHERE email = ? 
     LIMIT 1`,
    [email]
  );
  return rows.length > 0 ? petakanPengguna(rows[0]) : null;
}

/**
 * Mengambil data pengguna lengkap berdasarkan ID primary key
 */
export async function cariBerdasarkanId(id: number): Promise<Pengguna | null> {
  const [rows] = await pool.execute<BarisPengguna[]>(
    `SELECT id, nama_lengkap, email, password, nama_usaha, kota, peran, status_langganan, modal_kas_awal, created_at, updated_at
     FROM pengguna 
     WHERE id = ? 
     LIMIT 1`,
    [id]
  );
  return rows.length > 0 ? petakanPengguna(rows[0]) : null;
}

/**
 * Mendaftarkan akun mitra atau kasir baru ke tabel pengguna
 * @returns ID pengguna baru yang terdaftar
 */
export async function buatPengguna(data: PenggunaInput): Promise<number> {
  const nama = data.nama_lengkap || data.nama || "";
  const namaUsaha = data.nama_usaha || "Warung Mitra";
  const kota = data.kota || "Bekasi";
  const peran = data.peran || "admin";
  const status = data.status_langganan || "Mitra Premium";
  const modalAwal = Number(data.modal_kas_awal ?? 500000);

  const [hasil] = await pool.execute<ResultSetHeader>(
    `INSERT INTO pengguna (nama_lengkap, email, password, nama_usaha, kota, peran, status_langganan, modal_kas_awal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nama, data.email, data.password, namaUsaha, kota, peran, status, modalAwal]
  );
  return hasil.insertId;
}

/**
 * Mengambil semua daftar pengguna untuk administrasi staf (tanpa password)
 */
export async function ambilSemuaPengguna(): Promise<PenggunaResponse[]> {
  const [rows] = await pool.execute<BarisPengguna[]>(
    `SELECT id, nama_lengkap, email, password, nama_usaha, kota, peran, status_langganan, modal_kas_awal, created_at, updated_at
     FROM pengguna 
     ORDER BY id ASC`
  );
  return rows.map(petakanPenggunaResponse);
}

/**
 * Memperbarui data profil atau pengaturan outlet pengguna
 */
export async function perbaruiPengguna(
  id: number,
  data: {
    nama_lengkap?: string;
    nama_usaha?: string;
    kota?: string;
    modal_kas_awal?: number;
  }
): Promise<boolean> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    `UPDATE pengguna 
     SET nama_lengkap = COALESCE(?, nama_lengkap),
         nama_usaha = COALESCE(?, nama_usaha),
         kota = COALESCE(?, kota),
         modal_kas_awal = COALESCE(?, modal_kas_awal)
     WHERE id = ?`,
    [
      data.nama_lengkap || null,
      data.nama_usaha || null,
      data.kota || null,
      data.modal_kas_awal !== undefined ? data.modal_kas_awal : null,
      id,
    ]
  );
  return hasil.affectedRows > 0;
}

/**
 * Menghapus akun pengguna/staf berdasarkan ID
 */
export async function hapusPengguna(id: number): Promise<boolean> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    `DELETE FROM pengguna WHERE id = ?`,
    [id]
  );
  return hasil.affectedRows > 0;
}

/**
 * Reset data simulasi warung mitra ke kondisi awal
 */
export async function resetSimulasiWarung(userId: number): Promise<void> {
  await pool.execute("DELETE FROM mutasi_stok");
  await pool.execute("DELETE FROM transaksi WHERE pengguna_id = ?", [userId]);
  await pool.execute(
    "UPDATE bahan_baku SET stok_saat_ini = 15 WHERE pengguna_id = ? AND nama_bahan LIKE '%Ayam%'",
    [userId]
  );
  await pool.execute(
    "UPDATE bahan_baku SET stok_saat_ini = 2 WHERE pengguna_id = ? AND nama_bahan LIKE '%Cabai%'",
    [userId]
  );
  await pool.execute(
    "UPDATE bahan_baku SET stok_saat_ini = 4 WHERE pengguna_id = ? AND nama_bahan LIKE '%Beras%'",
    [userId]
  );
  await pool.execute("UPDATE produk SET status_aktif = 1 WHERE pengguna_id = ?", [userId]);

  // Tambah transaksi simulasi awal
  await pool.execute(
    `INSERT INTO transaksi (pengguna_id, jenis_transaksi, kategori, nominal, keterangan)
     VALUES (?, 'masuk', 'Penjualan Harian Warung', 450000, 'Penjualan paket makan siang simulasi')`,
    [userId]
  );
  await pool.execute(
    `INSERT INTO transaksi (pengguna_id, jenis_transaksi, kategori, nominal, keterangan)
     VALUES (?, 'keluar', 'Belanja Bahan Dapur', 180000, 'Belanja bumbu & sayur segar simulasi')`,
    [userId]
  );
}

// ----------------------------------------------------------------------------
// Ekspor Alias Kompatibilitas untuk Controller KasirKu Lama
// ----------------------------------------------------------------------------
export const semuaPengguna = ambilSemuaPengguna;
export const cariPenggunaByEmail = cariBerdasarkanEmail;

export async function tambahPengguna(
  nama: string,
  email: string,
  hash: string,
  peran: Peran
): Promise<PenggunaResponse> {
  const insertId = await buatPengguna({
    nama_lengkap: nama,
    email,
    password: hash,
    peran,
  });
  return {
    id: insertId,
    nama_lengkap: nama,
    nama,
    email,
    peran,
    nama_usaha: "Warung Mitra",
    kota: "Bekasi",
    status_langganan: "Mitra Premium",
    modal_kas_awal: 500000,
    dibuat_pada: new Date(),
    diperbarui_pada: new Date(),
  };
}
