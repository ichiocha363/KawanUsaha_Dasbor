// ============================================================================
// Router Produk & Inventaris Dapur (KawanUsaha)
// File: backend/src/routes/produk.ts
// ============================================================================

import { Router } from "express";
import * as produk from "../controller/produk.js";
import { authMiddleware } from "../middleware/auth.js";

export const produkRouter = Router();

// Rute Dasbor & Ringkasan Metrik Dapur (Wajib sebelum rute :id)
produkRouter.get("/dasbor/ringkasan", authMiddleware, produk.getRingkasanDasbor);

// Rute Transaksi Keuangan Arus Kas
produkRouter.get("/transaksi", authMiddleware, produk.getTransaksi);
produkRouter.post("/transaksi", authMiddleware, produk.createTransaksi);

// Rute Inventaris Bahan Baku Dapur
produkRouter.get("/bahan/mutasi", authMiddleware, produk.getMutasiStok);
produkRouter.get("/bahan", authMiddleware, produk.getBahanBaku);
produkRouter.post("/bahan", authMiddleware, produk.createBahanBaku);
produkRouter.put("/bahan/:id", authMiddleware, produk.ubahBahanBaku);
produkRouter.delete("/bahan/:id", authMiddleware, produk.hapusBahanBaku);
produkRouter.post("/bahan/:id/restock", authMiddleware, produk.restockBahan);

// Rute Manajemen Menu Kuliner (CRUD Produk)
produkRouter.get("/", authMiddleware, produk.getProduk);
produkRouter.post("/", authMiddleware, produk.createProduk);
produkRouter.get("/:id", authMiddleware, produk.detail);
produkRouter.put("/:id", authMiddleware, produk.ubah);
produkRouter.delete("/:id", authMiddleware, produk.hapus);

export default produkRouter;
