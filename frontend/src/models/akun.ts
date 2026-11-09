// ============================================================================
// Model & Interface Akun & Pengguna Frontend (KawanUsaha)
// File: frontend/src/models/akun.ts
// ============================================================================

export type Peran = "admin" | "kasir";

/**
 * Representasi entitas pengguna / mitra KawanUsaha di sisi frontend
 */
export interface Pengguna {
  id: number;
  nama_lengkap: string;
  email: string;
  nama_usaha: string;
  kota: string;
  peran: Peran;
  status_langganan: string;
  modal_kas_awal: number;
  dibuat_pada?: string;
  diperbarui_pada?: string;
  // Alias untuk kompatibilitas tampilan lama
  nama?: string;
}

/**
 * Payload respons autentikasi (login / register) dari backend
 */
export interface AuthResponse {
  token: string;
  user: Pengguna;
}

/**
 * Input form autentikasi login
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Input form registrasi mitra / staf baru
 */
export interface RegisterInput {
  nama_lengkap: string;
  email: string;
  password: string;
  nama_usaha?: string;
  kota?: string;
  peran?: Peran;
  modal_kas_awal?: number;
  // Alias kompatibilitas
  nama?: string;
}

// ----------------------------------------------------------------------------
// Kelas Warisan untuk Kompatibilitas Kode KasirKu Lama
// ----------------------------------------------------------------------------
export class Akun {
  nama: string;
  email: string;

  constructor(nama: string, email: string) {
    this.nama = nama;
    this.email = email;
  }

  peran(): string {
    return "Akun";
  }
  hakAkses(): string[] {
    return ["Beranda"];
  }

  info(): string {
    return `${this.nama} (${this.peran()}) → ${this.hakAkses().join(", ")}`;
  }
}

export class Admin extends Akun {
  override peran(): string {
    return "Admin";
  }
  override hakAkses(): string[] {
    return ["Beranda", "Produk", "Pengguna", "Pengaturan"];
  }
}

export class Kasir extends Akun {
  override peran(): string {
    return "Kasir";
  }
  override hakAkses(): string[] {
    return [...super.hakAkses(), "Produk"];
  }
}
