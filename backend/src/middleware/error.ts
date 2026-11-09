import type { NextFunction, Request, Response } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
  type?: string;
}

/**
 * Middleware penanganan error global Express KawanUsaha
 * Mengembalikan respons berformat konsisten: { success: false, message: string }
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const customErr = err as CustomError;
  let statusCode = customErr.statusCode || customErr.status || 500;
  let message = customErr.message || "Terjadi kesalahan pada server";

  // Tangani syntax error body-parser JSON malformed
  if (customErr.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Format JSON dalam request tidak valid";
  }

  // Tangani error duplikasi data unik MySQL (ER_DUP_ENTRY)
  if (customErr.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Data sudah terdaftar (duplikasi entri data)";
  }

  // Log error di console server untuk pelacakan debugging jika status 500
  if (statusCode >= 500) {
    console.error("❌ [Server Error]:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

export default errorHandler;
