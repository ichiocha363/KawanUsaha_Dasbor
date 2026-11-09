import "dotenv/config"; // WAJIB baris pertama: isi .env dibaca sebelum modul lain
import express from "express";
import cors from "cors";
import { pool, testConnection } from "./db.js";
import { produkRouter } from "./routes/produk.js";
import { authRouter, penggunaRouter } from "./routes/pengguna.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Middleware standar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint root sambutan
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Selamat datang di API KawanUsaha Backend!",
    health: "/api/health",
    database: "/api/cek",
  });
});

// Endpoint health-check server KawanUsaha
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Server KawanUsaha Backend siap!",
    time: new Date(),
  });
});

// Endpoint cek status database MySQL
app.get("/api/cek", async (_req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "terhubung" });
  } catch (error) {
    next(error);
  }
});

// Registrasi modul rute API utama
app.use("/api/pengguna", penggunaRouter);
app.use("/api/auth", authRouter);
app.use("/api/produk", produkRouter);

// Fallback rute 404 jika endpoint tidak ditemukan
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// Middleware penanganan error global
app.use(errorHandler);

// Inisialisasi dan jalankan server Express
app.listen(PORT, async () => {
  console.log(`🚀 [KawanUsaha Backend] Server berjalan di http://localhost:${PORT}`);
  // Lakukan uji query ping ke database saat server booting
  await testConnection();
});
