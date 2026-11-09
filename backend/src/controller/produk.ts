// ============================================================================
// Controller Produk & Inventaris Dapur (KawanUsaha)
// File: backend/src/controller/produk.ts
// ============================================================================

import type { NextFunction, Request, Response } from "express";
import * as repo from "../repository/produk.js";
import { pool } from "../db.js";

/**
 * Mengambil daftar menu produk makanan & minuman milik warung yang sedang aktif
 * Endpoint: GET /api/produk
 */
export async function getProduk(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const list = await repo.ambilSemuaProduk(userId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar menu produk",
      data: list,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Menambahkan menu kuliner baru
 * Endpoint: POST /api/produk
 */
export async function createProduk(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const nama = String(req.body?.nama_produk || req.body?.nama || "").trim();
    const kategori = String(req.body?.kategori || "makanan").trim();
    const hargaJual = Number(req.body?.harga_jual ?? req.body?.harga ?? 0);
    const estimasiHpp = Number(req.body?.estimasi_hpp ?? Math.round(hargaJual * 0.6));
    const statusAktif = req.body?.status_aktif !== undefined ? Boolean(req.body.status_aktif) : true;

    if (!nama) {
      res.status(400).json({
        success: false,
        message: "Nama menu produk wajib diisi",
      });
      return;
    }

    if (isNaN(hargaJual) || hargaJual <= 0) {
      res.status(400).json({
        success: false,
        message: "Harga jual harus berupa angka valid lebih dari 0",
      });
      return;
    }

    if (isNaN(estimasiHpp) || estimasiHpp < 0) {
      res.status(400).json({
        success: false,
        message: "Estimasi HPP tidak boleh bernilai negatif",
      });
      return;
    }

    const insertId = await repo.tambahProduk(userId, {
      nama_produk: nama,
      kategori,
      harga_jual: hargaJual,
      estimasi_hpp: estimasiHpp,
      status_aktif: statusAktif,
    });

    res.status(201).json({
      success: true,
      message: "Menu produk baru berhasil ditambahkan",
      data: {
        id: insertId,
        pengguna_id: userId,
        nama_produk: nama,
        kategori,
        harga_jual: hargaJual,
        estimasi_hpp: estimasiHpp,
        status_aktif: statusAktif,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mengambil seluruh inventaris bahan baku dapur beserta kalkulasi status (Kritis, Menipis, Aman)
 * Endpoint: GET /api/produk/bahan
 */
export async function getBahanBaku(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const bahan = await repo.ambilSemuaBahan(userId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil inventaris bahan dapur",
      data: bahan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Menambahkan bahan mentah baru ke dapur
 * Endpoint: POST /api/produk/bahan
 */
export async function createBahanBaku(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const namaBahan = String(req.body?.nama_bahan || "").trim();
    const stok = Number(req.body?.stok_saat_ini ?? 0);
    const batasMin = Number(req.body?.batas_minimum ?? 1);
    const satuan = String(req.body?.satuan || "kg").trim();
    const hargaSatuan = Number(req.body?.estimasi_harga_satuan ?? 0);

    if (!namaBahan) {
      res.status(400).json({
        success: false,
        message: "Nama bahan baku wajib diisi",
      });
      return;
    }

    if (isNaN(stok) || stok < 0) {
      res.status(400).json({
        success: false,
        message: "Stok awal tidak boleh bernilai negatif",
      });
      return;
    }

    if (isNaN(batasMin) || batasMin <= 0) {
      res.status(400).json({
        success: false,
        message: "Batas minimum peringatan harus lebih dari 0",
      });
      return;
    }

    const insertId = await repo.tambahBahan(userId, {
      nama_bahan: namaBahan,
      stok_saat_ini: stok,
      batas_minimum: batasMin,
      satuan,
      estimasi_harga_satuan: hargaSatuan,
    });

    res.status(201).json({
      success: true,
      message: "Bahan baku dapur berhasil ditambahkan",
      data: {
        id: insertId,
        pengguna_id: userId,
        nama_bahan: namaBahan,
        stok_saat_ini: stok,
        batas_minimum: batasMin,
        satuan,
        estimasi_harga_satuan: hargaSatuan,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Memperbarui (menambah atau mengurangi) jumlah stok bahan baku dapur
 * Endpoint: POST /api/produk/bahan/:id/restock
 */
export async function restockBahan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const bahanId = Number(req.params.id);
    const jumlahInput = Number(req.body?.jumlah);
    const jenisMutasi = req.body?.jenis_mutasi === "keluar" ? "keluar" : "masuk";
    const sumber = String(req.body?.sumber || (jenisMutasi === "masuk" ? "restock_pasar" : "pemakaian_dapur"));

    if (isNaN(bahanId) || bahanId <= 0) {
      res.status(400).json({
        success: false,
        message: "ID bahan baku tidak valid",
      });
      return;
    }

    if (isNaN(jumlahInput) || jumlahInput <= 0) {
      res.status(400).json({
        success: false,
        message: "Jumlah penyesuaian stok harus berupa angka positif",
      });
      return;
    }

    // Tentukan delta stok: masuk bertanda positif (+), keluar bertanda negatif (-)
    const delta = jenisMutasi === "keluar" ? -jumlahInput : jumlahInput;

    const berhasil = await repo.perbaruiStokBahan(bahanId, delta);
    if (!berhasil) {
      res.status(404).json({
        success: false,
        message: "Bahan baku tidak ditemukan atau gagal diperbarui",
      });
      return;
    }

    // Catat histori mutasi stok ke database
    await pool.execute(
      `INSERT INTO mutasi_stok (bahan_baku_id, jenis_mutasi, jumlah, sumber) VALUES (?, ?, ?, ?)`,
      [bahanId, jenisMutasi, jumlahInput, sumber]
    );

    res.status(200).json({
      success: true,
      message: `Stok berhasil ${jenisMutasi === "masuk" ? "ditambahkan" : "dikurangkan"} sejumlah ${jumlahInput}`,
      data: {
        bahan_baku_id: bahanId,
        jenis_mutasi: jenisMutasi,
        jumlah: jumlahInput,
        sumber,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mengubah informasi bahan baku dapur
 * Endpoint: PUT /api/produk/bahan/:id
 */
export async function ubahBahanBaku(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const namaBahan = String(req.body?.nama_bahan || "").trim();
    const stok = Number(req.body?.stok_saat_ini ?? 0);
    const batasMin = Number(req.body?.batas_minimum ?? 1);
    const satuan = String(req.body?.satuan || "kg").trim();
    const hargaSatuan = Number(req.body?.estimasi_harga_satuan ?? 0);

    if (!namaBahan) {
      res.status(400).json({ success: false, message: "Nama bahan baku wajib diisi" });
      return;
    }

    await pool.execute(
      `UPDATE bahan_baku 
       SET nama_bahan = ?, stok_saat_ini = ?, batas_minimum = ?, satuan = ?, estimasi_harga_satuan = ? 
       WHERE id = ?`,
      [namaBahan, stok, batasMin, satuan, hargaSatuan, id]
    );

    res.status(200).json({
      success: true,
      message: "Bahan baku berhasil diperbarui",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Menghapus bahan baku dapur
 * Endpoint: DELETE /api/produk/bahan/:id
 */
export async function hapusBahanBaku(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    await pool.execute(`DELETE FROM bahan_baku WHERE id = ?`, [id]);
    res.status(200).json({
      success: true,
      message: "Bahan baku berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mengambil riwayat mutasi stok bahan dapur
 * Endpoint: GET /api/produk/bahan/mutasi
 */
export async function getMutasiStok(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const [rows] = await pool.execute(
      `SELECT m.id, m.bahan_baku_id, b.nama_bahan, b.satuan, m.jenis_mutasi, m.jumlah, m.sumber, m.dibuat_pada
       FROM mutasi_stok m
       JOIN bahan_baku b ON m.bahan_baku_id = b.id
       WHERE b.pengguna_id = ?
       ORDER BY m.id DESC LIMIT 50`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil riwayat mutasi stok",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mengambil ringkasan metrik dasbor (omzet penjualan, belanja modal, laba kotor, item kritis/menipis)
 * Endpoint: GET /api/produk/dasbor/ringkasan
 */
export async function getRingkasanDasbor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const ringkasan = await repo.ambilRingkasanDapur(userId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil ringkasan dasbor operasional dapur",
      data: ringkasan,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mengambil seluruh riwayat transaksi keuangan warung
 * Endpoint: GET /api/produk/transaksi
 */
export async function getTransaksi(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const list = await repo.ambilSemuaTransaksi(userId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil riwayat transaksi",
      data: list,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mencatat transaksi keuangan baru (arus kas masuk / keluar)
 * Endpoint: POST /api/produk/transaksi
 */
export async function createTransaksi(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const jenisTransaksi: "masuk" | "keluar" =
      req.body?.jenis_transaksi === "keluar" ? "keluar" : "masuk";
    const kategori = String(req.body?.kategori || (jenisTransaksi === "masuk" ? "penjualan" : "belanja_modal")).trim();
    const nominal = Number(req.body?.nominal);
    const keterangan = String(req.body?.keterangan || "").trim();
    const bahanBakuId = req.body?.bahan_baku_id ? Number(req.body.bahan_baku_id) : undefined;
    const jumlahStok = req.body?.jumlah_stok ? Number(req.body.jumlah_stok) : undefined;

    if (isNaN(nominal) || nominal <= 0) {
      res.status(400).json({
        success: false,
        message: "Nominal transaksi harus berupa angka lebih dari 0",
      });
      return;
    }

    const insertId = await repo.tambahTransaksi(userId, {
      jenis_transaksi: jenisTransaksi,
      kategori,
      nominal,
      keterangan,
    });

    // Jika memilih bahan dapur dan memasukkan jumlah restock, otomatis perbarui stok dan catat mutasi
    if (bahanBakuId && jumlahStok && jumlahStok > 0) {
      await repo.perbaruiStokBahan(bahanBakuId, jumlahStok);
      await pool.execute(
        `INSERT INTO mutasi_stok (bahan_baku_id, jenis_mutasi, jumlah, sumber) VALUES (?, 'masuk', ?, ?)`,
        [bahanBakuId, jumlahStok, keterangan || "restock_belanja_transaksi"]
      );
    }

    res.status(201).json({
      success: true,
      message: "Transaksi keuangan berhasil dicatat",
      data: {
        id: insertId,
        jenis_transaksi: jenisTransaksi,
        kategori,
        nominal,
        keterangan,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// Ekspor Alias Kompatibilitas Rute KasirKu Lama
// ----------------------------------------------------------------------------
export const daftar = getProduk;
export const tambah = createProduk;

export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const item = await repo.cariProduk(id);
    if (!item) {
      res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
      return;
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function ubah(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const item = await repo.ubahProduk(id, req.body ?? {});
    if (!item) {
      res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
      return;
    }
    res.status(200).json({ success: true, message: "Produk diperbarui", data: item });
  } catch (error) {
    next(error);
  }
}

export async function hapus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const berhasil = await repo.hapusProduk(id);
    if (!berhasil) {
      res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
      return;
    }
    res.status(200).json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    next(error);
  }
}
