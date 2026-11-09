// ============================================================================
// Halaman Registrasi Akun Mitra Baru (KawanUsaha)
// File: frontend/src/pages/HalamanRegister.tsx
// ============================================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { registerApi } from "../api/pengguna";
import Toast from "../components/Toast";
import {
  UtensilsCrossed,
  User,
  Store,
  MapPin,
  Mail,
  Lock,
  Coins,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

type Props = {
  daftarPengguna?: any[];
  onDaftar?: (baru: any) => void;
};

type InfoToast = { teks: string; jenis: "sukses" | "gagal" };

export default function HalamanRegister({ onDaftar }: Props) {
  const navigate = useNavigate();

  // Form State
  const [namaLengkap, setNamaLengkap] = useState("");
  const [namaUsaha, setNamaUsaha] = useState("");
  const [kota, setKota] = useState("Bekasi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalAwal, setModalAwal] = useState("500000");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<InfoToast | null>(null);

  function tampilkanToast(teks: string, jenis: "sukses" | "gagal" = "sukses") {
    setToast({ teks, jenis });
    setTimeout(() => setToast(null), 3500);
  }

  function formatRupiah(num: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const namaBersih = namaLengkap.trim();
    const usahaBersih = namaUsaha.trim();
    const kotaBersih = kota.trim();
    const emailBersih = email.trim().toLowerCase();
    const modalNum = Number(modalAwal);

    if (!namaBersih || namaBersih.length < 2) {
      setErrorMsg("Nama lengkap pemilik wajib diisi minimal 2 karakter.");
      return;
    }

    if (!usahaBersih) {
      setErrorMsg("Nama warung atau kuliner wajib diisi.");
      return;
    }

    if (!kotaBersih) {
      setErrorMsg("Kota lokasi outlet wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailBersih || !emailRegex.test(emailBersih)) {
      setErrorMsg("Format alamat email tidak valid.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    if (isNaN(modalNum) || modalNum < 0) {
      setErrorMsg("Modal kas awal harus berupa angka positif.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await registerApi({
        nama_lengkap: namaBersih,
        nama_usaha: usahaBersih,
        kota: kotaBersih,
        email: emailBersih,
        password,
        peran: "admin",
        modal_kas_awal: modalNum,
      });

      tampilkanToast("Pendaftaran berhasil! Mengalihkan ke dasbor...", "sukses");

      if (onDaftar && response.user) {
        onDaftar(response.user);
      }

      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } catch (err) {
      const pesan = (err as Error).message || "Gagal melakukan pendaftaran akun.";
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

      <div className="auth-card register-card">
        {/* Header Kartu Register */}
        <div className="auth-header">
          <div className="auth-logo-wrap">
            <UtensilsCrossed size={28} />
          </div>
          <h1 className="auth-title">Daftar Akun Mitra</h1>
          <p className="auth-subtitle">
            Bergabung dengan KawanUsaha untuk mengelola kasir & dapur warung Anda
          </p>
        </div>

        {/* Error Banner jika ada kesalahan input */}
        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={16} flex-shrink={0} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Baris 1: Nama Pemilik & Nama Usaha */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="auth-input-group">
              <label htmlFor="reg-nama">Nama Lengkap Pemilik</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <User size={16} />
                </span>
                <input
                  id="reg-nama"
                  placeholder="mis. Budi Santoso"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="reg-usaha">Nama Warung / Usaha</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Store size={16} />
                </span>
                <input
                  id="reg-usaha"
                  placeholder="mis. Warung Mitra"
                  value={namaUsaha}
                  onChange={(e) => setNamaUsaha(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Baris 2: Kota Outlet & Modal Awal */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="auth-input-group">
              <label htmlFor="reg-kota">Kota Lokasi Outlet</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <MapPin size={16} />
                </span>
                <input
                  id="reg-kota"
                  placeholder="mis. Bekasi"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="reg-modal">Modal Kasir Awal (Rp)</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <Coins size={16} />
                </span>
                <input
                  id="reg-modal"
                  type="number"
                  min="0"
                  step="50000"
                  placeholder="500000"
                  value={modalAwal}
                  onChange={(e) => setModalAwal(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Info helper modal awal */}
          {modalAwal && Number(modalAwal) > 0 && (
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: -8 }}>
              Saldo awal kasir: <strong>{formatRupiah(Number(modalAwal))}</strong>
            </div>
          )}

          {/* Baris 3: Email */}
          <div className="auth-input-group">
            <label htmlFor="reg-email">Alamat Email (Untuk Login)</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <Mail size={16} />
              </span>
              <input
                id="reg-email"
                type="email"
                placeholder="nama@warungmitra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Baris 4: Kata Sandi */}
          <div className="auth-input-group">
            <label htmlFor="reg-password">Kata Sandi (Minimal 6 karakter)</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <Lock size={16} />
              </span>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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
                <span>Mendaftarkan Akun Mitra...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Daftar Akun Mitra</span>
              </>
            )}
          </button>
        </form>

        {/* Tautan Masuk Footer */}
        <div className="auth-footer">
          <span>Sudah punya akun mitra?</span>
          <Link to="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}
