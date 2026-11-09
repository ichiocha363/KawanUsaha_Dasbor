// ============================================================================
// Repository Produk & Inventaris Bahan (KawanUsaha Database Layer)
// File: backend/src/repository/produk.ts
// ============================================================================

import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db.js";
import {
  ProdukClass,
  hitungStatusBahan,
  type BahanBaku,
  type DataProduk,
  type Produk,
  type ProdukInput,
  type RingkasanDasbor,
} from "../models/produk.js";

interface BarisProduk extends RowDataPacket {
  id: number;
  pengguna_id: number;
  nama_produk: string;
  kategori: string;
  harga_jual: string | number;
  estimasi_hpp: string | number;
  status_aktif: number | boolean;
  created_at: Date;
}

interface BarisBahan extends RowDataPacket {
  id: number;
  pengguna_id: number;
  nama_bahan: string;
  stok_saat_ini: string | number;
  batas_minimum: string | number;
  satuan: string;
  estimasi_harga_satuan: string | number;
  terakhir_diubah: Date;
}

function petakanProduk(r: BarisProduk): Produk {
  const hargaJual = Number(r.harga_jual || 0);
  const statusAktif = Boolean(r.status_aktif);
  return {
    id: r.id,
    pengguna_id: r.pengguna_id,
    nama_produk: r.nama_produk,
    kategori: r.kategori,
    harga_jual: hargaJual,
    estimasi_hpp: Number(r.estimasi_hpp || 0),
    status_aktif: statusAktif,
    dibuat_pada: r.created_at,
    nama: r.nama_produk, // alias
    harga: hargaJual, // alias
    stok: statusAktif ? 10 : 0, // alias
  };
}

function petakanBahan(r: BarisBahan): BahanBaku {
  const stok = Number(r.stok_saat_ini || 0);
  const min = Number(r.batas_minimum || 1);
  return {
    id: r.id,
    pengguna_id: r.pengguna_id,
    nama_bahan: r.nama_bahan,
    stok_saat_ini: stok,
    batas_minimum: min,
    satuan: r.satuan,
    estimasi_harga_satuan: Number(r.estimasi_harga_satuan || 0),
    terakhir_diubah: r.terakhir_diubah,
    status: hitungStatusBahan(stok, min),
  };
}

/**
 * Mengambil semua daftar menu produk milik pengguna tertentu
 */
export async function ambilSemuaProduk(penggunaId: number = 1): Promise<Produk[]> {
  const [rows] = await pool.execute<BarisProduk[]>(
    `SELECT id, pengguna_id, nama_produk, kategori, harga_jual, estimasi_hpp, status_aktif, created_at
     FROM produk 
     WHERE pengguna_id = ? 
     ORDER BY id ASC`,
    [penggunaId]
  );
  return rows.map(petakanProduk);
}

/**
 * Menambahkan menu kuliner baru untuk pengguna
 * Mendukung signature (penggunaId, data) dan overload legacy (data)
 */
export async function tambahProduk(
  penggunaIdOrData: number | ProdukInput | DataProduk,
  dataOpt?: ProdukInput | DataProduk
): Promise<any> {
  let penggunaId = 1;
  let data: ProdukInput | DataProduk;

  if (typeof penggunaIdOrData === "number") {
    penggunaId = penggunaIdOrData;
    data = dataOpt as ProdukInput;
  } else {
    data = penggunaIdOrData;
  }

  const nama = data.nama_produk || data.nama || "";
  const kategori = (data as ProdukInput).kategori || "makanan";
  const hargaJual = Number((data as ProdukInput).harga_jual ?? data.harga ?? 0);
  const hpp = Number((data as ProdukInput).estimasi_hpp ?? Math.round(hargaJual * 0.6));
  const statusAktif = (data as ProdukInput).status_aktif ?? (data.stok !== undefined ? data.stok > 0 : true);

  const [hasil] = await pool.execute<ResultSetHeader>(
    `INSERT INTO produk (pengguna_id, nama_produk, kategori, harga_jual, estimasi_hpp, status_aktif)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [penggunaId, nama, kategori, hargaJual, hpp, statusAktif]
  );

  // Jika dipanggil dengan signature baru (penggunaId, data) -> kembalikan number (insertId)
  if (typeof penggunaIdOrData === "number") {
    return hasil.insertId;
  }
  // Jika dipanggil secara legacy -> kembalikan instance class Produk
  return new ProdukClass(hasil.insertId, nama, hargaJual, statusAktif ? 10 : 0, penggunaId);
}

/**
 * Mengambil semua daftar bahan mentah inventaris dapur milik pengguna
 */
export async function ambilSemuaBahan(penggunaId: number = 1): Promise<BahanBaku[]> {
  const [rows] = await pool.execute<BarisBahan[]>(
    `SELECT id, pengguna_id, nama_bahan, stok_saat_ini, batas_minimum, satuan, estimasi_harga_satuan, terakhir_diubah
     FROM bahan_baku 
     WHERE pengguna_id = ? 
     ORDER BY id ASC`,
    [penggunaId]
  );
  return rows.map(petakanBahan);
}

/**
 * Menambahkan bahan baku dapur baru
 */
export async function tambahBahan(
  penggunaId: number,
  data: Partial<BahanBaku>
): Promise<number> {
  const nama = data.nama_bahan || "Bahan Baru";
  const stok = Number(data.stok_saat_ini || 0);
  const batasMin = Number(data.batas_minimum || 1);
  const satuan = data.satuan || "kg";
  const hargaSatuan = Number(data.estimasi_harga_satuan || 0);

  const [hasil] = await pool.execute<ResultSetHeader>(
    `INSERT INTO bahan_baku (pengguna_id, nama_bahan, stok_saat_ini, batas_minimum, satuan, estimasi_harga_satuan)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [penggunaId, nama, stok, batasMin, satuan, hargaSatuan]
  );
  return hasil.insertId;
}

/**
 * Memperbarui (menambah atau mengurangi) jumlah stok bahan baku
 * Contoh: restock pasar -> jumlahTambah positif (+3.5)
 * Contoh: pemakaian penjualan -> jumlahTambah negatif (-2.0)
 */
export async function perbaruiStokBahan(
  bahanId: number,
  jumlahTambah: number
): Promise<boolean> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    `UPDATE bahan_baku 
     SET stok_saat_ini = GREATEST(0, stok_saat_ini + ?) 
     WHERE id = ?`,
    [Number(jumlahTambah), Number(bahanId)]
  );
  return hasil.affectedRows > 0;
}

/**
 * Menghitung agregasi ringkasan metrik dapur & keuangan untuk Beranda Dasbor
 */
export async function ambilRingkasanDapur(
  penggunaId: number = 1
): Promise<RingkasanDasbor> {
  // 1. Agregasi arus kas transaksi hari ini
  const [txRows] = await pool.execute<RowDataPacket[]>(
    `SELECT 
       COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' AND kategori != 'modal_awal' THEN nominal ELSE 0 END), 0) AS omzet_hari_ini,
       COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar' AND kategori = 'belanja_modal' THEN nominal ELSE 0 END), 0) AS belanja_modal
     FROM transaksi 
     WHERE pengguna_id = ? AND DATE(tanggal_transaksi) = CURDATE()`,
    [penggunaId]
  );

  let omzet = Number(txRows[0]?.omzet_hari_ini || 0);
  let belanja = Number(txRows[0]?.belanja_modal || 0);

  // Fallback simulasi: jika belum ada transaksi di tanggal hari ini, ambil total transaksi simulasi
  if (omzet === 0 && belanja === 0) {
    const [allTx] = await pool.execute<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(CASE WHEN jenis_transaksi = 'masuk' AND kategori != 'modal_awal' THEN nominal ELSE 0 END), 0) AS omzet_hari_ini,
         COALESCE(SUM(CASE WHEN jenis_transaksi = 'keluar' AND kategori = 'belanja_modal' THEN nominal ELSE 0 END), 0) AS belanja_modal
       FROM transaksi 
       WHERE pengguna_id = ?`,
      [penggunaId]
    );
    omzet = Number(allTx[0]?.omzet_hari_ini || 0);
    belanja = Number(allTx[0]?.belanja_modal || 0);
  }

  // 2. Agregasi status bahan dapur
  const bahanList = await ambilSemuaBahan(penggunaId);
  let kritis = 0;
  let menipis = 0;
  let aman = 0;

  for (const b of bahanList) {
    if (b.status === "Kritis") kritis++;
    else if (b.status === "Menipis") menipis++;
    else aman++;
  }

  return {
    omzet_hari_ini: omzet,
    belanja_modal: belanja,
    estimasi_laba_kotor: omzet - belanja,
    total_bahan_kritis: kritis,
    total_bahan_menipis: menipis,
    total_bahan_aman: aman,
  };
}

/**
 * Mengambil riwayat seluruh transaksi arus kas warung
 */
export async function ambilSemuaTransaksi(penggunaId: number = 1): Promise<any[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, pengguna_id, jenis_transaksi, kategori, nominal, keterangan, tanggal_transaksi, created_at
     FROM transaksi 
     WHERE pengguna_id = ? 
     ORDER BY tanggal_transaksi DESC, id DESC`,
    [penggunaId]
  );
  return rows.map((r) => ({
    id: r.id,
    pengguna_id: r.pengguna_id,
    jenis_transaksi: r.jenis_transaksi,
    kategori: r.kategori,
    nominal: Number(r.nominal || 0),
    keterangan: r.keterangan || "",
    tanggal_transaksi: r.tanggal_transaksi,
    created_at: r.created_at,
  }));
}

/**
 * Menyimpan transaksi arus kas baru (masuk / keluar)
 */
export async function tambahTransaksi(
  penggunaId: number,
  data: {
    jenis_transaksi: "masuk" | "keluar";
    kategori: string;
    nominal: number;
    keterangan: string;
  }
): Promise<number> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    `INSERT INTO transaksi (pengguna_id, jenis_transaksi, kategori, nominal, keterangan, tanggal_transaksi)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [penggunaId, data.jenis_transaksi, data.kategori, data.nominal, data.keterangan]
  );
  return hasil.insertId;
}

// ----------------------------------------------------------------------------
// Ekspor Fungsi Warisan untuk Kompatibilitas Controller Produk KasirKu Lama
// ----------------------------------------------------------------------------
export async function semuaProduk(): Promise<ProdukClass[]> {
  const list = await ambilSemuaProduk(1);
  return list.map((p) => ProdukClass.fromJSON(p));
}

export async function cariProduk(id: number): Promise<ProdukClass | null> {
  const [rows] = await pool.execute<BarisProduk[]>(
    `SELECT id, pengguna_id, nama_produk, kategori, harga_jual, estimasi_hpp, status_aktif, created_at
     FROM produk 
     WHERE id = ? 
     LIMIT 1`,
    [id]
  );
  return rows.length > 0 ? ProdukClass.fromJSON(petakanProduk(rows[0])) : null;
}

export async function ubahProduk(
  id: number,
  data: DataProduk | ProdukInput
): Promise<ProdukClass | null> {
  const nama = data.nama_produk || data.nama || "";
  const hargaJual = Number((data as ProdukInput).harga_jual ?? data.harga ?? 0);
  const statusAktif = (data as ProdukInput).status_aktif ?? (data.stok !== undefined ? data.stok > 0 : true);

  const [hasil] = await pool.execute<ResultSetHeader>(
    `UPDATE produk 
     SET nama_produk = ?, harga_jual = ?, status_aktif = ? 
     WHERE id = ?`,
    [nama, hargaJual, statusAktif, id]
  );

  return hasil.affectedRows > 0
    ? new ProdukClass(id, nama, hargaJual, statusAktif ? 10 : 0)
    : null;
}

export async function hapusProduk(id: number): Promise<boolean> {
  const [hasil] = await pool.execute<ResultSetHeader>(
    "DELETE FROM produk WHERE id = ?",
    [id]
  );
  return hasil.affectedRows > 0;
}
