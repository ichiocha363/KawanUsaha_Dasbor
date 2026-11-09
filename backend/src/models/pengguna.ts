// ============================================================================
// Model & Interface Pengguna (KawanUsaha)
// File: backend/src/models/pengguna.ts
// ============================================================================

export type Peran = "admin" | "kasir";

/**
 * Representasi entitas lengkap pengguna sesuai tabel database MySQL `pengguna`
 */
export interface Pengguna {
  id: number;
  nama_lengkap: string;
  email: string;
  password: string;
  nama_usaha: string;
  kota: string;
  peran: Peran;
  status_langganan: string;
  modal_kas_awal: number;
  dibuat_pada: Date | string;
  diperbarui_pada: Date | string;
  // Properti alias untuk kompatibilitas kode lama
  nama?: string;
}

/**
 * Tipe data payload untuk registrasi / pembuatan akun baru pengguna
 */
export interface PenggunaInput {
  nama_lengkap: string;
  email: string;
  password: string;
  nama_usaha?: string;
  kota?: string;
  peran?: Peran;
  status_langganan?: string;
  modal_kas_awal?: number;
  // Properti alias untuk kompatibilitas form login/daftar sederhana
  nama?: string;
}

/**
 * Representasi data pengguna yang aman dikirim ke browser / frontend (tanpa password)
 */
export interface PenggunaResponse {
  id: number;
  nama_lengkap: string;
  email: string;
  nama_usaha: string;
  kota: string;
  peran: Peran;
  status_langganan: string;
  modal_kas_awal: number;
  dibuat_pada: Date | string;
  diperbarui_pada: Date | string;
  // Properti alias untuk frontend
  nama?: string;
}

// Tipe alias warisan untuk kompatibilitas file lama
export type DataDaftar = PenggunaInput;
