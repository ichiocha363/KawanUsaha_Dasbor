// ============================================================================
// Halaman Kelola Pengguna & Staf Warung (KawanUsaha)
// File: frontend/src/pages/admin/HalamanPengguna.tsx
// ============================================================================

import React, { useEffect, useState } from "react";
import type { Pengguna } from "../../models/akun";
import {
  getSemuaPenggunaApi,
  tambahStafApi,
  hapusPenggunaApi,
  getProfilApi,
} from "../../api/pengguna";
import Toast from "../../components/Toast";
import {
  Users,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Trash2,
  X,
  AlertCircle,
  Mail,
  Lock,
  User,
} from "lucide-react";

type InfoToast = { teks: string; jenis: "sukses" | "gagal" };

interface Props {
  daftarPengguna?: any[];
}

export default function HalamanPengguna({ daftarPengguna: _ }: Props) {
  const [stafList, setStafList] = useState<Pengguna[]>([]);
  const [userAktif, setUserAktif] = useState<Pengguna | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<InfoToast | null>(null);

  // Modal Tambah Staf
  const [modalBuka, setModalBuka] = useState<boolean>(false);
  const [namaLengkap, setNamaLengkap] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [peran, setPeran] = useState<"admin" | "kasir">("kasir");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  function tampilkanToast(teks: string, jenis: "sukses" | "gagal" = "sukses") {
    setToast({ teks, jenis });
    setTimeout(() => setToast(null), 3500);
  }

  function formatTanggal(tanggalStr?: string): string {
    if (!tanggalStr) return "-";
    const date = new Date(tanggalStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function muatData() {
    setLoading(true);
    try {
      const [dataPengguna, profil] = await Promise.all([
        getSemuaPenggunaApi(),
        getProfilApi().catch(() => null),
      ]);
      setStafList(dataPengguna || []);
      setUserAktif(profil);
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal memuat data staf", "gagal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  function bukaModalTambah() {
    setNamaLengkap("");
    setEmail("");
    setPassword("");
    setPeran("kasir");
    setFormError(null);
    setModalBuka(true);
  }

  async function handleSimpanStaf(e: React.FormEvent) {
    e.preventDefault();
    const namaBersih = namaLengkap.trim();
    const emailBersih = email.trim().toLowerCase();

    if (!namaBersih || namaBersih.length < 2) {
      setFormError("Nama lengkap staf wajib diisi minimal 2 karakter.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailBersih || !emailRegex.test(emailBersih)) {
      setFormError("Format alamat email tidak valid.");
      return;
    }

    if (!password || password.length < 6) {
      setFormError("Kata sandi minimal 6 karakter.");
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await tambahStafApi({
        nama_lengkap: namaBersih,
        email: emailBersih,
        password,
        peran,
        nama_usaha: userAktif?.nama_usaha || "Warung Mitra",
        kota: userAktif?.kota || "Bekasi",
      });

      tampilkanToast(`Staf baru "${namaBersih}" berhasil ditambahkan!`, "sukses");
      setModalBuka(false);
      await muatData();
    } catch (error) {
      setFormError((error as Error).message || "Gagal mendaftarkan staf baru");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapusStaf(p: Pengguna) {
    if (userAktif && p.id === userAktif.id) {
      tampilkanToast("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif", "gagal");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus akses staf "${p.nama_lengkap || p.nama}"?`)) {
      return;
    }

    try {
      await hapusPenggunaApi(p.id);
      tampilkanToast(`Staf "${p.nama_lengkap || p.nama}" berhasil dihapus`, "sukses");
      await muatData();
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal menghapus staf", "gagal");
    }
  }

  return (
    <div className="beranda-container">
      {/* Toast Feedback */}
      {toast && <Toast teks={toast.teks} jenis={toast.jenis} />}

      {/* Header Halaman */}
      <div className="beranda-header">
        <div className="beranda-title-wrap">
          <h1>Kelola Pengguna & Staf</h1>
          <p className="beranda-subtitle">
            Atur akun pengelola, staf kasir, dan hak akses operasional Warung Mitra.
          </p>
        </div>
        <div className="beranda-actions">
          <button
            type="button"
            className="btn-secondary-outline"
            onClick={muatData}
            title="Muat ulang daftar staf"
          >
            <RefreshCw size={16} />
            Muat Ulang
          </button>
          <button
            type="button"
            className="btn-primary-action"
            onClick={bukaModalTambah}
          >
            <Plus size={16} />
            + Tambah Staf Baru
          </button>
        </div>
      </div>

      {/* Tabel Data Staf */}
      <div className="widget-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--color-text-main)",
                margin: "0 0 4px 0",
              }}
            >
              Daftar Staf & Pengelola Terdaftar
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              Total {stafList.length} pengguna aktif pada sistem warung.
            </p>
          </div>
        </div>

        <div className="tabel-wrap">
          <table className="tabel">
            <thead>
              <tr>
                <th style={{ width: "8%" }}>ID</th>
                <th style={{ width: "25%" }}>Nama Lengkap</th>
                <th style={{ width: "25%" }}>Alamat Email</th>
                <th style={{ width: "15%" }}>Peran</th>
                <th style={{ width: "15%" }}>Status Langganan</th>
                <th style={{ width: "12%" }}>Terdaftar</th>
                <th style={{ width: "10%", textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 36 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <RefreshCw size={18} className="spinner" />
                      <span>Memuat data staf dan pengelola...</span>
                    </div>
                  </td>
                </tr>
              ) : stafList.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="transaksi-empty-state">
                      <div className="transaksi-empty-icon">
                        <Users size={24} />
                      </div>
                      <strong style={{ color: "var(--color-text-main)" }}>
                        Belum Ada Data Staf
                      </strong>
                      <p style={{ margin: 0, fontSize: 13, maxWidth: 360 }}>
                        Daftarkan staf kasir atau pengelola baru untuk membantu operasional warung.
                      </p>
                      <button
                        type="button"
                        className="btn-primary-action"
                        onClick={bukaModalTambah}
                        style={{ marginTop: 8 }}
                      >
                        <Plus size={15} />
                        + Tambah Staf Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                stafList.map((staf) => {
                  const namaStaf = staf.nama_lengkap || staf.nama || "Pengguna";
                  const isAdmin = staf.peran === "admin";
                  const isCurrent = userAktif && staf.id === userAktif.id;

                  return (
                    <tr key={staf.id}>
                      <td style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                        #{staf.id}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: isAdmin ? "var(--color-primary-light)" : "#FFF7ED",
                              color: isAdmin ? "var(--color-primary)" : "#C2410C",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {namaStaf.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ color: "var(--color-text-main)", fontSize: 13 }}>
                              {namaStaf}
                            </strong>
                            {isCurrent && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 10,
                                  background: "#E2E8F0",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  color: "#475569",
                                }}
                              >
                                Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                        {staf.email}
                      </td>
                      <td>
                        <span className={isAdmin ? "badge-admin" : "badge-kasir"}>
                          {isAdmin ? (
                            <>
                              <ShieldCheck size={13} />
                              Admin (Pemilik)
                            </>
                          ) : (
                            <>
                              <UserCheck size={13} />
                              Kasir Staf
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-primary)",
                          }}
                        >
                          {staf.status_langganan || "Mitra Premium"}
                        </span>
                      </td>
                      <td style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                        {formatTanggal(staf.dibuat_pada)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {!isCurrent && (
                          <button
                            type="button"
                            className="btn-hapus"
                            style={{ padding: "6px 10px", fontSize: 12 }}
                            onClick={() => handleHapusStaf(staf)}
                            title="Hapus akun staf ini"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Tambah Staf Baru */}
      {modalBuka && (
        <div className="modal-backdrop" onClick={() => setModalBuka(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Users size={18} color="var(--color-primary)" />
                <span>Tambah Staf / Pengguna Baru</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalBuka(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#B91C1C",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSimpanStaf}>
              <div className="form-field-group">
                <label htmlFor="staf-nama">
                  <User size={14} style={{ display: "inline", marginRight: 6 }} />
                  Nama Lengkap Staf
                </label>
                <input
                  id="staf-nama"
                  placeholder="mis. Siti Aminah"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="staf-email">
                  <Mail size={14} style={{ display: "inline", marginRight: 6 }} />
                  Alamat Email (Untuk Login)
                </label>
                <input
                  id="staf-email"
                  type="email"
                  placeholder="mis. kasir1@warungmitra.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="staf-password">
                  <Lock size={14} style={{ display: "inline", marginRight: 6 }} />
                  Kata Sandi Sementara
                </label>
                <input
                  id="staf-password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="form-field-helper">
                  Staf dapat menggunakan email dan sandi ini untuk masuk ke dasbor kasir.
                </span>
              </div>

              <div className="form-field-group">
                <label htmlFor="staf-peran">Peran / Hak Akses</label>
                <select
                  id="staf-peran"
                  value={peran}
                  onChange={(e) => setPeran(e.target.value as "admin" | "kasir")}
                >
                  <option value="kasir">Kasir (Transaksi & Menu Kuliner)</option>
                  <option value="admin">Admin (Akses Penuh Semua Modul)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary-outline"
                  onClick={() => setModalBuka(false)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={submitting}
                >
                  {submitting ? "Mendaftarkan Staf..." : "+ Daftarkan Staf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
