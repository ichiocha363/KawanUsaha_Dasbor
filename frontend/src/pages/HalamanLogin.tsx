// ============================================================================
// Halaman Masuk Akun Mitra (KawanUsaha)
// File: frontend/src/pages/HalamanLogin.tsx
// ============================================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { loginApi } from "../api/pengguna";
import Toast from "../components/Toast";
import type { Pengguna } from "../models/akun";
import {
  UtensilsCrossed,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

type Props = {
  daftarPengguna?: any[];
  onMasuk?: (p: Pengguna) => void;
};

type InfoToast = { teks: string; jenis: "sukses" | "gagal" };

export default function HalamanLogin({ onMasuk }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<InfoToast | null>(null);

  function tampilkanToast(teks: string, jenis: "sukses" | "gagal" = "sukses") {
    setToast({ teks, jenis });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailBersih = email.trim().toLowerCase();

    if (!emailBersih) {
      setErrorMsg("Alamat email wajib diisi.");
      return;
    }

    if (!emailBersih.includes("@")) {
      setErrorMsg("Format email tidak valid.");
      return;
    }

    if (!password) {
      setErrorMsg("Kata sandi wajib diisi.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await loginApi({ email: emailBersih, password });
      tampilkanToast("Login berhasil! Mengalihkan ke dasbor...", "sukses");

      if (onMasuk && response.user) {
        onMasuk(response.user);
      }

      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } catch (err) {
      const pesan = (err as Error).message || "Email atau kata sandi tidak cocok.";
      setErrorMsg(pesan);
      tampilkanToast(pesan, "gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      {/* Toast Feedback */}
      {toast && <Toast teks={toast.teks} jenis={toast.jenis} />}

      <div className="auth-card">
        {/* Header Kartu Login */}
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <UtensilsCrossed size={28} />
          </div>
          <h1 className="auth-title">KawanUsaha</h1>
          <p className="auth-subtitle">
            Asisten Kuliner UMKM • Masuk Akun Mitra
          </p>
        </div>

        {/* Error Banner jika ada kesalahan input / login */}
        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={16} flex-shrink={0} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Input Email */}
          <div className="auth-input-group">
            <label htmlFor="login-email">Alamat Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <Mail size={16} />
              </span>
              <input
                id="login-email"
                type="email"
                placeholder="nama@warungmitra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="auth-input-group">
            <label htmlFor="login-password">Kata Sandi</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <Lock size={16} />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spinner" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Masuk ke Dasbor</span>
              </>
            )}
          </button>
        </form>

        {/* Tautan Pendaftaran Footer */}
        <div className="auth-footer">
          <span>Belum punya akun mitra?</span>
          <Link to="/register">Daftar di sini</Link>
        </div>
      </div>
    </div>
  );
}
