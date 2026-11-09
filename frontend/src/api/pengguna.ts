// ============================================================================
// API Service Pengguna & Autentikasi (KawanUsaha)
// File: frontend/src/api/pengguna.ts
// ============================================================================

import { apiClient, TOKEN_KEY, USER_KEY } from "./client";
import type {
  AuthResponse,
  LoginInput,
  Pengguna,
  RegisterInput,
} from "../models/akun";

/**
 * Autentikasi login pengguna mitra / staf
 * Endpoint: POST /api/pengguna/login
 */
export async function loginApi(data: LoginInput): Promise<AuthResponse> {
  const res = await apiClient<AuthResponse>("/api/pengguna/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res && res.token) {
    localStorage.setItem(TOKEN_KEY, res.token);
    if (res.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
  }

  return res;
}

/**
 * Registrasi akun mitra kuliner baru
 * Endpoint: POST /api/pengguna/register
 */
export async function registerApi(data: RegisterInput): Promise<AuthResponse> {
  const res = await apiClient<AuthResponse>("/api/pengguna/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res && res.token) {
    localStorage.setItem(TOKEN_KEY, res.token);
    if (res.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
  }

  return res;
}

/**
 * Mengambil data profil user yang sedang aktif dari token autentikasi
 * Endpoint: GET /api/pengguna/profil
 */
export async function getProfilApi(): Promise<Pengguna> {
  return apiClient<Pengguna>("/api/pengguna/profil");
}

/**
 * Mengambil seluruh daftar staf / pengguna
 * Endpoint: GET /api/pengguna
 */
export async function getSemuaPenggunaApi(): Promise<Pengguna[]> {
  return apiClient<Pengguna[]>("/api/pengguna");
}

/**
 * Menambahkan akun staf baru tanpa mengganti token login admin saat ini
 * Endpoint: POST /api/pengguna/register
 */
export async function tambahStafApi(data: RegisterInput): Promise<Pengguna> {
  const res = await apiClient<AuthResponse>("/api/pengguna/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.user;
}

/**
 * Menghapus akun staf / pengguna
 * Endpoint: DELETE /api/pengguna/:id
 */
export async function hapusPenggunaApi(id: number): Promise<void> {
  await apiClient<void>(`/api/pengguna/${id}`, {
    method: "DELETE",
  });
}

/**
 * Memperbarui pengaturan profil outlet dan modal kas pengguna
 * Endpoint: PUT /api/pengguna/profil
 */
export async function perbaruiProfilApi(
  data: Partial<Pengguna>
): Promise<Pengguna> {
  const res = await apiClient<Pengguna>("/api/pengguna/profil", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res) {
    localStorage.setItem(USER_KEY, JSON.stringify(res));
  }
  return res;
}

/**
 * Mereset data simulasi warung mitra ke kondisi awal
 * Endpoint: POST /api/pengguna/reset-simulasi
 */
export async function resetSimulasiApi(): Promise<{ message: string }> {
  return apiClient<{ message: string }>("/api/pengguna/reset-simulasi", {
    method: "POST",
  });
}

/**
 * Menghapus token autentikasi dan data sesi dari localStorage
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ----------------------------------------------------------------------------
// Ekspor Alias untuk Kompatibilitas Kode KasirKu Lama
// ----------------------------------------------------------------------------
export type DataDaftar = RegisterInput;

export async function login(email: string, password: string): Promise<Pengguna> {
  const res = await loginApi({ email, password });
  return res.user;
}

export async function daftar(data: DataDaftar): Promise<Pengguna> {
  const res = await registerApi(data);
  return res.user;
}

export const getPengguna = getSemuaPenggunaApi;
