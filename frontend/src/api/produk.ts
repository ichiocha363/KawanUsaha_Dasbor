// ============================================================================
// API Service Produk & Inventaris Dapur (KawanUsaha)
// File: frontend/src/api/produk.ts
// ============================================================================

import { apiClient } from "./client";
import {
  Produk,
  type BahanBaku,
  type RingkasanDasbor,
  type Transaksi,
} from "../models/produk";

export type DataProduk = {
  nama: string;
  harga: number;
  stok?: number;
  nama_produk?: string;
  kategori?: string;
  harga_jual?: number;
  estimasi_hpp?: number;
  status_aktif?: boolean;
};

const URL_PRODUK = "/api/produk";

/**
 * Mengambil ringkasan metrik KPI operasional dan keuangan untuk Beranda Dasbor
 * Endpoint: GET /api/produk/dasbor/ringkasan
 */
export async function getRingkasanDasborApi(): Promise<RingkasanDasbor> {
  return apiClient<RingkasanDasbor>(`${URL_PRODUK}/dasbor/ringkasan`);
}

/**
 * Mengambil seluruh daftar menu makanan & minuman dari backend
 * Endpoint: GET /api/produk
 */
export async function getProdukApi(): Promise<Produk[]> {
  const data = await apiClient<any[]>(URL_PRODUK);
  return data.map((d) => Produk.fromJSON(d));
}

/**
 * Menambahkan menu kuliner baru
 * Endpoint: POST /api/produk
 */
export async function createProdukApi(data: Partial<Produk> | DataProduk): Promise<Produk> {
  const payload = {
    nama_produk: data.nama_produk || data.nama,
    kategori: data.kategori || "makanan",
    harga_jual: Number(data.harga_jual ?? data.harga ?? 0),
    estimasi_hpp: Number(data.estimasi_hpp ?? Math.round(Number(data.harga_jual ?? data.harga ?? 0) * 0.6)),
    status_aktif: data.status_aktif !== undefined ? data.status_aktif : true,
  };

  const res = await apiClient<any>(URL_PRODUK, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return Produk.fromJSON(res);
}

/**
 * Mengambil seluruh data inventaris bahan baku dapur beserta statusnya
 * Endpoint: GET /api/produk/bahan
 */
export async function getBahanBakuApi(): Promise<BahanBaku[]> {
  return apiClient<BahanBaku[]>(`${URL_PRODUK}/bahan`);
}

/**
 * Mendaftarkan bahan baku dapur baru
 * Endpoint: POST /api/produk/bahan
 */
export async function createBahanBakuApi(data: Partial<BahanBaku>): Promise<BahanBaku> {
  return apiClient<BahanBaku>(`${URL_PRODUK}/bahan`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Memperbarui stok bahan baku dapur (restock belanja pasar atau pemakaian memasak)
 * Endpoint: POST /api/produk/bahan/:id/restock
 */
export async function restockBahanApi(
  id: number,
  jumlah: number,
  jenis: "masuk" | "keluar" = "masuk",
  sumber: string = "restock_pasar"
): Promise<any> {
  return apiClient<any>(`${URL_PRODUK}/bahan/${id}/restock`, {
    method: "POST",
    body: JSON.stringify({
      jumlah,
      jenis_mutasi: jenis,
      sumber,
    }),
  });
}

/**
 * Interface representasi catatan mutasi keluar/masuk bahan dapur
 */
export interface MutasiStokItem {
  id: number;
  bahan_baku_id: number;
  nama_bahan: string;
  satuan: string;
  jenis_mutasi: "masuk" | "keluar";
  jumlah: number;
  sumber: string;
  dibuat_pada: string;
}

/**
 * Mengambil riwayat mutasi stok bahan dapur
 * Endpoint: GET /api/produk/bahan/mutasi
 */
export async function getMutasiStokApi(): Promise<MutasiStokItem[]> {
  return apiClient<MutasiStokItem[]>(`${URL_PRODUK}/bahan/mutasi`);
}

/**
 * Mengubah data bahan baku dapur
 * Endpoint: PUT /api/produk/bahan/:id
 */
export async function ubahBahanBakuApi(
  id: number,
  data: Partial<BahanBaku>
): Promise<any> {
  return apiClient<any>(`${URL_PRODUK}/bahan/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Menghapus bahan baku dapur
 * Endpoint: DELETE /api/produk/bahan/:id
 */
export async function hapusBahanBakuApi(id: number): Promise<void> {
  await apiClient<void>(`${URL_PRODUK}/bahan/${id}`, { method: "DELETE" });
}

/**
 * Mengubah status ketersediaan produk (Tersedia / Habis)
 * Endpoint: PUT /api/produk/:id
 */
export async function toggleStatusProdukApi(
  id: number,
  status_aktif: boolean
): Promise<Produk> {
  const res = await apiClient<any>(`${URL_PRODUK}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status_aktif }),
  });
  return Produk.fromJSON(res);
}

/**
 * Mengambil seluruh riwayat transaksi keuangan warung
 * Endpoint: GET /api/produk/transaksi
 */
export async function getTransaksiApi(): Promise<Transaksi[]> {
  return apiClient<Transaksi[]>(`${URL_PRODUK}/transaksi`);
}

/**
 * Menyimpan catatan transaksi kas masuk atau kas keluar baru
 * Endpoint: POST /api/produk/transaksi
 */
export async function createTransaksiApi(data: {
  jenis_transaksi: "masuk" | "keluar";
  kategori: string;
  nominal: number;
  keterangan: string;
  bahan_baku_id?: number;
  jumlah_stok?: number;
}): Promise<any> {
  return apiClient<any>(`${URL_PRODUK}/transaksi`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ----------------------------------------------------------------------------
// Ekspor Fungsi Warisan untuk Kompatibilitas Kode Halaman KasirKu Lama
// ----------------------------------------------------------------------------
export const getProduk = getProdukApi;
export const tambahProduk = createProdukApi;

export async function ubahProduk(
  id: number,
  data: DataProduk | Partial<Produk>
): Promise<Produk> {
  const payload = {
    nama_produk: data.nama_produk || data.nama,
    harga_jual: Number(data.harga_jual ?? data.harga ?? 0),
    status_aktif: data.status_aktif !== undefined ? data.status_aktif : true,
  };

  const res = await apiClient<any>(`${URL_PRODUK}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return Produk.fromJSON(res);
}

export async function hapusProduk(id: number): Promise<void> {
  await apiClient<void>(`${URL_PRODUK}/${id}`, { method: "DELETE" });
}
