// ============================================================================
// Model & Interface Produk & Inventaris Dapur Frontend (KawanUsaha)
// File: frontend/src/models/produk.ts
// ============================================================================

/**
 * Tipe status stok bahan dapur sesuai aturan bisnis PRD (non-AI):
 * - Kritis : stok <= batas_minimum (Badge Merah)
 * - Menipis: stok <= batas_minimum * 1.5 (Badge Oranye/Kuning)
 * - Aman   : stok > batas_minimum * 1.5 (Badge Hijau)
 */
export type BahanBakuStatus = "Kritis" | "Menipis" | "Aman";
export type StatusBahanBaku = BahanBakuStatus; // Alias kompatibilitas

/**
 * Tipe status ketersediaan menu produk kuliner
 */
export type StatusStok = "Habis" | "Menipis" | "Aman";

/**
 * Kategori menu kuliner warung
 */
export type KategoriProduk = "makanan" | "minuman" | "camilan" | string;

/**
 * Tipe arus kas transaksi keuangan warung
 */
export type JenisTransaksi = "masuk" | "keluar";

/**
 * Tipe pergerakan mutasi stok bahan dapur
 */
export type JenisMutasi = "masuk" | "keluar";

/**
 * Helper aturan bisnis untuk menghitung status persediaan bahan baku
 */
export function hitungStatusBahan(stok: number, batasMin: number): BahanBakuStatus {
  if (stok <= batasMin) return "Kritis";
  if (stok <= batasMin * 1.5) return "Menipis";
  return "Aman";
}

/**
 * Interface dasar representasi skema data produk kuliner dari database / API
 */
export interface IProduk {
  id: number;
  nama_produk: string;
  kategori: string;
  harga_jual: number;
  estimasi_hpp: number;
  status_aktif: boolean;
  pengguna_id?: number;
  dibuat_pada?: string;
  diperbarui_pada?: string;
}

/**
 * Payload data input untuk penambahan atau pengubahan menu produk kuliner
 */
export interface ProdukInput {
  nama_produk?: string;
  kategori?: string;
  harga_jual?: number;
  estimasi_hpp?: number;
  status_aktif?: boolean;
  // Properti alias kompatibilitas formulir lama
  nama?: string;
  harga?: number;
  stok?: number;
}

/**
 * Interface representasi inventaris persediaan bahan dapur KawanUsaha
 */
export interface BahanBaku {
  id: number;
  nama_bahan: string;
  stok_saat_ini: number;
  batas_minimum: number;
  satuan: string;
  status: BahanBakuStatus;
  estimasi_harga_satuan: number;
  pengguna_id?: number;
  terakhir_diubah?: string;
  dibuat_pada?: string;
}

/**
 * Payload data input untuk mendaftarkan bahan baku dapur baru
 */
export interface BahanBakuInput {
  nama_bahan: string;
  stok_saat_ini: number;
  batas_minimum: number;
  satuan: string;
  estimasi_harga_satuan?: number;
}

/**
 * Interface ringkasan metrik KPI Beranda Dasbor KawanUsaha
 */
export interface RingkasanDasbor {
  omzet_hari_ini: number;
  belanja_modal: number;
  estimasi_laba_kotor: number;
  total_bahan_kritis: number;
  total_bahan_menipis: number;
  total_bahan_aman: number;
}

/**
 * Interface representasi catatan transaksi arus kas KawanUsaha
 */
export interface Transaksi {
  id: number;
  pengguna_id?: number;
  jenis_transaksi: JenisTransaksi;
  kategori: string;
  nominal: number;
  keterangan: string;
  tanggal_transaksi: string;
  created_at?: string;
}

/**
 * Payload data input untuk mencatat transaksi kas masuk atau kas keluar baru
 */
export interface TransaksiInput {
  jenis_transaksi: JenisTransaksi;
  kategori: string;
  nominal: number;
  keterangan: string;
  bahan_baku_id?: number;
  jumlah_stok?: number;
}

/**
 * Interface catatan riwayat mutasi stok bahan baku dapur
 */
export interface MutasiStok {
  id: number;
  bahan_baku_id: number;
  jenis_mutasi: JenisMutasi;
  jumlah: number;
  sumber: string;
  dibuat_pada?: string;
}

/**
 * Kelas Model Produk untuk mendukung logika frontend, metode operasional, dan parsing JSON.
 * Di TypeScript, 'export class Produk' secara otomatis menyediakan:
 * 1. Tipe data 'Produk' (instance type) untuk anotasi variabel / props
 * 2. Nilai konstruktor & method statis 'Produk.fromJSON()'
 */
export class Produk implements IProduk {
  id: number;
  nama_produk: string;
  kategori: string;
  harga_jual: number;
  estimasi_hpp: number;
  status_aktif: boolean;
  pengguna_id?: number;
  dibuat_pada?: string;
  diperbarui_pada?: string;
  private _stok: number;

  constructor(
    id: number,
    nama: string,
    harga: number,
    stok: number = 10,
    kategori: string = "makanan",
    estimasi_hpp: number = Math.round(harga * 0.6),
    status_aktif: boolean = stok > 0,
    pengguna_id?: number,
    dibuat_pada?: string,
    diperbarui_pada?: string
  ) {
    this.id = id;
    this.nama_produk = nama;
    this.kategori = kategori;
    this.harga_jual = harga;
    this.estimasi_hpp = estimasi_hpp;
    this.status_aktif = status_aktif;
    this._stok = stok;
    this.pengguna_id = pengguna_id;
    this.dibuat_pada = dibuat_pada;
    this.diperbarui_pada = diperbarui_pada;
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
    return this._stok;
  }
  set stok(v: number) {
    this._stok = v;
  }

  status(): StatusStok {
    if (!this.status_aktif || this._stok === 0) return "Habis";
    if (this._stok < 5) return "Menipis";
    return "Aman";
  }

  kurangiStok(jumlah: number): string {
    if (jumlah <= 0) return "Jumlah harus lebih dari 0";
    if (jumlah > this._stok) return `Stok ${this.nama_produk} tidak mencukupi`;
    this._stok -= jumlah;
    if (this._stok === 0) {
      this.status_aktif = false;
    }
    return `Terjual ${jumlah}, sisa ${this._stok}`;
  }

  /**
   * Factory method untuk konversi payload API backend atau objek JSON menjadi instance Produk
   */
  static fromJSON(d: {
    id: number;
    nama_produk?: string;
    nama?: string;
    harga_jual?: number;
    harga?: number;
    stok?: number;
    kategori?: string;
    estimasi_hpp?: number;
    status_aktif?: boolean | number;
    pengguna_id?: number;
    dibuat_pada?: string;
    diperbarui_pada?: string;
  }): Produk {
    const nama = d.nama_produk || d.nama || "Menu Kuliner";
    const harga = Number(d.harga_jual ?? d.harga ?? 0);
    const stok = Number(d.stok ?? 10);
    const kategori = d.kategori || "makanan";
    const hpp = Number(d.estimasi_hpp ?? Math.round(harga * 0.6));
    const statusAktif =
      d.status_aktif !== undefined
        ? Boolean(Number(d.status_aktif))
        : stok > 0;

    return new Produk(
      d.id,
      nama,
      harga,
      stok,
      kategori,
      hpp,
      statusAktif,
      d.pengguna_id,
      d.dibuat_pada,
      d.diperbarui_pada
    );
  }
}
