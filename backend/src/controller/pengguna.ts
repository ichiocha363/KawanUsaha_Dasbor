// ============================================================================
// Controller Pengguna & Autentikasi (KawanUsaha)
// File: backend/src/controller/pengguna.ts
// ============================================================================

import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as repo from "../repository/pengguna.js";
import type { Peran } from "../models/pengguna.js";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_super_kawan_usaha_2026";

/**
 * Handler registrasi akun baru mitra/kasir KawanUsaha
 * Endpoint: POST /api/pengguna/register (atau /api/auth/daftar)
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const namaLengkap = String(req.body?.nama_lengkap || req.body?.nama || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const namaUsaha = String(req.body?.nama_usaha || "Warung Mitra").trim();
    const kota = String(req.body?.kota || "Bekasi").trim();
    const peran: Peran = req.body?.peran === "kasir" ? "kasir" : "admin";
    const modalAwal = Number(req.body?.modal_kas_awal ?? 500000);

    // Validasi dasar
    if (!namaLengkap || namaLengkap.length < 2) {
      res.status(400).json({
        success: false,
        message: "Nama lengkap wajib diisi minimal 2 karakter",
      });
      return;
    }

    if (!email || !email.includes("@")) {
      res.status(400).json({
        success: false,
        message: "Format alamat email tidak valid",
      });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password wajib diisi minimal 6 karakter",
      });
      return;
    }

    // Cek apakah email sudah digunakan
    const existing = await repo.cariBerdasarkanEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        message: "Email sudah terdaftar, silakan gunakan email lain atau login",
      });
      return;
    }

    // Enkripsi password menggunakan bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Simpan ke database
    const insertId = await repo.buatPengguna({
      nama_lengkap: namaLengkap,
      email,
      password: passwordHash,
      nama_usaha: namaUsaha,
      kota,
      peran,
      status_langganan: "Mitra Premium",
      modal_kas_awal: modalAwal,
    });

    // Buat JWT Token
    const token = jwt.sign(
      {
        id: insertId,
        email,
        peran,
        nama_usaha: namaUsaha,
        kota,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = {
      id: insertId,
      nama_lengkap: namaLengkap,
      email,
      nama_usaha: namaUsaha,
      kota,
      peran,
      status_langganan: "Mitra Premium",
      modal_kas_awal: modalAwal,
    };

    res.status(201).json({
      success: true,
      message: "Registrasi akun mitra berhasil",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler autentikasi login pengguna
 * Endpoint: POST /api/pengguna/login (atau /api/auth/login)
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email dan kata sandi wajib diisi",
      });
      return;
    }

    // Cari user di database
    const user = await repo.cariBerdasarkanEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Alamat email atau kata sandi tidak cocok",
      });
      return;
    }

    // Verifikasi hash password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Alamat email atau kata sandi tidak cocok",
      });
      return;
    }

    // Buat JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        peran: user.peran,
        nama_usaha: user.nama_usaha,
        kota: user.kota,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Format data pengguna tanpa password
    const userData = {
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      nama_usaha: user.nama_usaha,
      kota: user.kota,
      peran: user.peran,
      status_langganan: user.status_langganan,
      modal_kas_awal: user.modal_kas_awal,
    };

    res.status(200).json({
      success: true,
      message: "Login berhasil, selamat datang di KawanUsaha!",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler untuk mengambil profil user yang sedang aktif dari token autentikasi
 * Endpoint: GET /api/pengguna/profil
 */
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Sesi tidak valid atau pengguna belum login",
      });
      return;
    }

    const user = await repo.cariBerdasarkanId(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Profil pengguna tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil profil pengguna",
      data: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        nama_usaha: user.nama_usaha,
        kota: user.kota,
        peran: user.peran,
        status_langganan: user.status_langganan,
        modal_kas_awal: user.modal_kas_awal,
        dibuat_pada: user.dibuat_pada,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler mengambil seluruh daftar pengguna/staf
 * Endpoint: GET /api/pengguna
 */
export async function listPengguna(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const list = await repo.ambilSemuaPengguna();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar staf dan mitra pengguna",
      data: list,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler untuk memperbarui pengaturan profil outlet pengguna
 * Endpoint: PUT /api/pengguna/profil
 */
export async function perbaruiProfil(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    const namaLengkap = req.body?.nama_lengkap;
    const namaUsaha = req.body?.nama_usaha;
    const kota = req.body?.kota;
    const modalKasAwal = req.body?.modal_kas_awal !== undefined ? Number(req.body.modal_kas_awal) : undefined;

    const berhasil = await repo.perbaruiPengguna(userId, {
      nama_lengkap: namaLengkap,
      nama_usaha: namaUsaha,
      kota,
      modal_kas_awal: modalKasAwal,
    });

    if (!berhasil) {
      res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
      return;
    }

    const updated = await repo.cariBerdasarkanId(userId);
    res.status(200).json({
      success: true,
      message: "Pengaturan outlet berhasil disimpan",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler untuk menghapus akun staf
 * Endpoint: DELETE /api/pengguna/:id
 */
export async function hapusPengguna(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.id;

    if (id === userId) {
      res.status(400).json({
        success: false,
        message: "Tidak dapat menghapus akun sendiri yang sedang aktif",
      });
      return;
    }

    const berhasil = await repo.hapusPengguna(id);
    if (!berhasil) {
      res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Akun staf berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler untuk mereset seluruh data simulasi warung mitra ke kondisi awal
 * Endpoint: POST /api/pengguna/reset-simulasi
 */
export async function resetSimulasi(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id || 1;
    await repo.resetSimulasiWarung(userId);
    res.status(200).json({
      success: true,
      message: "Data simulasi warung berhasil direset ke kondisi awal",
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// Ekspor Alias Kompatibilitas dengan Rute KasirKu Lama
// ----------------------------------------------------------------------------
export const daftarPengguna = listPengguna;
export const daftar = register;
