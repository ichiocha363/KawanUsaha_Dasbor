import "dotenv/config";
import mysql from "mysql2/promise";

// Konfigurasi pool koneksi database MySQL KawanUsaha
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "kawan_admin",
  password: process.env.DB_PASSWORD || "KawanUsaha2026!",
  database: process.env.DB_NAME || "kawan_usaha_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Helper untuk memverifikasi koneksi database saat aplikasi booting.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(
      `✅ [Database] Berhasil terhubung ke database '${process.env.DB_NAME || "kawan_usaha_db"}' (User: ${process.env.DB_USER || "kawan_admin"})`
    );
    return true;
  } catch (error) {
    const err = error as Error;
    console.error(`❌ [Database Error] Gagal terhubung ke database: ${err.message}`);
    return false;
  }
}
