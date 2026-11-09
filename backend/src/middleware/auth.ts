import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Peran } from "../models/pengguna.js";

export interface UserPayload {
  id: number;
  email: string;
  peran: Peran;
  nama_usaha?: string;
  kota?: string;
}

// Augmentasi antarmuka Request Express global agar mengenali req.user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

/**
 * Middleware verifikasi JWT Bearer Token KawanUsaha
 * Memeriksa header 'Authorization: Bearer <token>' dan menempelkan payload ke req.user
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Akses ditolak: Token otentikasi tidak ditemukan atau format salah",
      });
      return;
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Akses ditolak: Token kosong",
      });
      return;
    }

    const secret = process.env.JWT_SECRET || "rahasia_super_kawan_usaha_2026";
    const decoded = jwt.verify(token, secret) as UserPayload;

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Akses ditolak: Token tidak valid atau sudah kedaluwarsa",
    });
  }
}

export default authMiddleware;
