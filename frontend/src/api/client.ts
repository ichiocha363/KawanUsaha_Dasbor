// ============================================================================
// API Client Helper (KawanUsaha HTTP Wrapper)
// File: frontend/src/api/client.ts
// ============================================================================

export const TOKEN_KEY = "token_kawan_usaha";
export const USER_KEY = "user_kawan_usaha";

/**
 * Helper HTTP fetch yang otomatis menyisipkan Authorization header Bearer token
 * dan menangani penyeragaman payload response { success: true, data: ... }
 */
export async function apiClient<T>(url: string, opsi: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opsi.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...opsi,
    headers,
  });

  // Tangani sesi kedaluwarsa (401 Unauthorized)
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  const isi = await res.json().catch(() => ({}));
  if (!res.ok) {
    const pesan = isi.message || isi.error || `Terjadi kesalahan server (${res.status})`;
    throw new Error(pesan);
  }

  // Ekstrak data jika format respons seragam { success: true, data: ... }
  if (isi && typeof isi === "object" && "data" in isi && isi.success !== undefined) {
    return isi.data as T;
  }

  return isi as T;
}

// Ekspor alias kirim untuk kompatibilitas fungsi lama
export const kirim = apiClient;

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function getStoredUser<T = any>(): T | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as T;
  } catch {
    return null;
  }
}
export default apiClient;
