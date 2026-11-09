// ============================================================================
// Model & Interface Produk & Bahan Dapur (KawanUsaha)
// File: backend/src/models/produk.ts
// ============================================================================

/**
 * Representasi entitas menu kuliner pada tabel database MySQL `produk`
 */
export interface Produk {
  id: number;
  pengguna_id: number;
  nama_produk: string;
  kategori: string; // makanan, minuman, camilan
  harga_jual: number;
  estimasi_hpp: number;
  status_aktif: boolean;
  dibuat_pada: Date | string;
  diperbarui_pada?: Date | string;
  // Properti alias untuk kompatibilitas kode lama
  nama?: string;
  harga?: number;
  stok?: number;
}

/**
 * Payload input untuk menambah atau mengubah data menu produk
 */
export interface ProdukInput {
  nama_produk: string;
  kategori: string;
  harga_jual: number;
  estimasi_hpp?: number;
  status_aktif?: boolean;
  // Properti alias untuk kompatibilitas kode lama
  nama?: string;
  harga?: number;
  stok?: number;
}

/**
 * Representasi entitas inventaris bahan baku dapur pada tabel `bahan_baku`
 */
export interface BahanBaku {
  id: number;
  pengguna_id: number;
  nama_bahan: string;
  stok_saat_ini: number;
  batas_minimum: number;
  satuan: string; // kg, gr, butir, liter, ikat, dll
  estimasi_harga_satuan: number;
  terakhir_diubah: Date | string;
  dibuat_pada?: Date | string;
  status?: BahanBakuStatus;
}

/**
 * Tipe status stok bahan dapur sesuai aturan bisnis (Business Rules PRD non-AI)
 * - Kritis : stok <= batas_minimum (Badge Merah)
 * - Menipis: stok <= batas_minimum * 1.5 (Badge Oranye/Kuning)
 * - Aman   : stok > batas_minimum * 1.5 (Badge Hijau)
 */
export type BahanBakuStatus = "Kritis" | "Menipis" | "Aman";

/**
 * Helper untuk menghitung status stok bahan dapur berdasarkan ambang batas
 */
export function hitungStatusBahan(stok: number, batasMin: number): BahanBakuStatus {
  if (stok <= batasMin) return "Kritis";
  if (stok <= batasMin * 1.5) return "Menipis";
  return "Aman";
}

/**
 * Ringkasan agregasi metrik KPI untuk Dasbor Beranda Admin KawanUsaha
 */
export interface RingkasanDasbor {
  omzet_hari_ini: number;
  belanja_modal: number;
  estimasi_laba_kotor: number;
  total_bahan_kritis: number;
  total_bahan_menipis: number;
  total_bahan_aman: number;
}

// ----------------------------------------------------------------------------
// Tipe & Kelas Warisan untuk Kompatibilitas Kode KasirKu Lama
// ----------------------------------------------------------------------------
export type StatusStok = "Habis" | "Menipis" | "Aman";
export type DataProduk = {
  nama: string;
  harga: number;
  stok: number;
  nama_produk?: string;
  kategori?: string;
  harga_jual?: number;
  estimasi_hpp?: number;
};

export class ProdukClass implements Produk {
  readonly id: number;
  readonly pengguna_id: number;
  nama_produk: string;
  kategori: string;
  harga_jual: number;
  estimasi_hpp: number;
  status_aktif: boolean;
  dibuat_pada: Date | string;

  constructor(
    id: number,
    nama: string,
    harga: number,
    stok: number = 0,
    pengguna_id: number = 1
  ) {
    this.id = id;
    this.pengguna_id = pengguna_id;
    this.nama_produk = nama;
    this.kategori = "makanan";
    this.harga_jual = harga;
    this.estimasi_hpp = Math.round(harga * 0.6);
    this.status_aktif = stok > 0;
    this.dibuat_pada = new Date();
  }

  get nama(): string {
    return this.nama_produk;
  }
  set nama(v: string) {
    this.nama_produk = v;
  }

  get harga(): number {
    return this.harga_jual;
  }
  set harga(v: number) {
    this.harga_jual = v;
  }

  get stok(): number {
    return this.status_aktif ? 10 : 0;
  }

  status(): StatusStok {
    if (!this.status_aktif) return "Habis";
    return "Aman";
  }

  toJSON() {
    return {
      id: this.id,
      pengguna_id: this.pengguna_id,
      nama_produk: this.nama_produk,
      kategori: this.kategori,
      harga_jual: this.harga_jual,
      estimasi_hpp: this.estimasi_hpp,
      status_aktif: this.status_aktif,
      nama: this.nama_produk,
      harga: this.harga_jual,
      stok: this.stok,
    };
  }

  static fromJSON(d: {
    id: number;
    nama_produk?: string;
    nama?: string;
    harga_jual?: number;
    harga?: number;
    stok?: number;
    pengguna_id?: number;
  }) {
    return new ProdukClass(
      d.id,
      d.nama_produk || d.nama || "Menu",
      Number(d.harga_jual || d.harga || 0),
      Number(d.stok ?? 10),
      d.pengguna_id || 1
    );
  }
}
