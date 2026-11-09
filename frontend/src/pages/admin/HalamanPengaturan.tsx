// ============================================================================
// Halaman Pengaturan Outlet & Sistem (KawanUsaha)
// File: frontend/src/pages/admin/HalamanPengaturan.tsx
// ============================================================================

import React, { useEffect, useState } from "react";
import type { Pengguna } from "../../models/akun";
import {
  getProfilApi,
  perbaruiProfilApi,
  resetSimulasiApi,
} from "../../api/pengguna";
import Toast from "../../components/Toast";
import {
  Settings,
  Store,
  MapPin,
  Coins,
  User,
  Mail,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X,
  Shield,
  Layers,
} from "lucide-react";

type InfoToast = { teks: string; jenis: "sukses" | "gagal" };

export default function HalamanPengaturan() {
  const [profil, setProfil] = useState<Pengguna | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<InfoToast | null>(null);

  // Form State
  const [namaUsaha, setNamaUsaha] = useState("");
  const [kota, setKota] = useState("");
  const [modalAwal, setModalAwal] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal Dialog Konfirmasi Reset
  const [modalResetOpen, setModalResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  async function muatProfil() {
    setLoading(true);
    try {
      const data = await getProfilApi();
      setProfil(data);
      setNamaUsaha(data.nama_usaha || "Warung Mitra");
      setKota(data.kota || "Bekasi");
      setModalAwal(String(data.modal_kas_awal || 500000));
      setNamaLengkap(data.nama_lengkap || data.nama || "");
    } catch {
      // Fallback ke localStorage jika koneksi server bermasalah
      const userCached = localStorage.getItem("user_kawan_usaha");
      if (userCached) {
        try {
          const parsed = JSON.parse(userCached);
          setProfil(parsed);
          setNamaUsaha(parsed.nama_usaha || "Warung Mitra");
          setKota(parsed.kota || "Bekasi");
          setModalAwal(String(parsed.modal_kas_awal || 500000));
          setNamaLengkap(parsed.nama_lengkap || parsed.nama || "");
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatProfil();
  }, []);

  async function handleSimpanPengaturan(e: React.FormEvent) {
    e.preventDefault();
    const namaUsahaBersih = namaUsaha.trim();
    const kotaBersih = kota.trim();
    const modalNum = Number(modalAwal);

    if (!namaUsahaBersih) {
      tampilkanToast("Nama usaha tidak boleh kosong", "gagal");
      return;
    }

    if (!kotaBersih) {
      tampilkanToast("Kota lokasi outlet tidak boleh kosong", "gagal");
      return;
    }

    if (isNaN(modalNum) || modalNum < 0) {
      tampilkanToast("Modal awal kasir harus berupa angka positif", "gagal");
      return;
    }

    setSaving(true);
    try {
      const updated = await perbaruiProfilApi({
        nama_usaha: namaUsahaBersih,
        kota: kotaBersih,
        modal_kas_awal: modalNum,
        nama_lengkap: namaLengkap.trim(),
      });
      setProfil(updated);
      tampilkanToast("Pengaturan outlet berhasil disimpan!", "sukses");
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal menyimpan pengaturan", "gagal");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetData() {
    setResetting(true);
    try {
      await resetSimulasiApi();
      tampilkanToast("Seluruh data simulasi berhasil direset ke seed awal!", "sukses");
      setModalResetOpen(false);
      await muatProfil();
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal mereset data simulasi", "gagal");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="beranda-container">
      {/* Toast Feedback */}
      {toast && <Toast teks={toast.teks} jenis={toast.jenis} />}

      {/* Header Halaman */}
      <div className="beranda-header">
        <div className="beranda-title-wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Settings size={24} color="var(--color-primary)" />
            <h1 style={{ margin: 0 }}>Pengaturan Warung</h1>
          </div>
          <p className="beranda-subtitle">
            Kelola profil outlet kuliner, saldo modal awal kasir, dan preferensi sistem.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-muted)" }}>
          Memuat data pengaturan warung...
        </div>
      ) : (
        <div className="pengaturan-grid">
          {/* Kolom Kiri: Formulir Pengaturan Profil */}
          <div className="transaksi-card">
            <div className="transaksi-card-header">
              <div className="transaksi-card-title">
                <Store size={18} color="var(--color-primary)" />
                <span>Informasi Profil Outlet Kuliner</span>
              </div>
              <span className="badge-admin">
                <Shield size={12} />
                {profil?.status_langganan || "Mitra Premium"}
              </span>
            </div>

            <form onSubmit={handleSimpanPengaturan}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-field-group">
                  <label htmlFor="cfg-nama-usaha">
                    <Store size={14} style={{ display: "inline", marginRight: 6 }} />
                    Nama Usaha Warung
                  </label>
                  <input
                    id="cfg-nama-usaha"
                    placeholder="mis. Warung Mitra"
                    value={namaUsaha}
                    onChange={(e) => setNamaUsaha(e.target.value)}
                    required
                  />
                  <span className="form-field-helper">
                    Nama ini tampil pada header nota dan laporan rekap.
                  </span>
                </div>

                <div className="form-field-group">
                  <label htmlFor="cfg-kota">
                    <MapPin size={14} style={{ display: "inline", marginRight: 6 }} />
                    Kota Lokasi Outlet
                  </label>
                  <input
                    id="cfg-kota"
                    placeholder="mis. Bekasi"
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    required
                  />
                  <span className="form-field-helper">
                    Wilayah operasional cabang outlet kuliner.
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-field-group">
                  <label htmlFor="cfg-modal">
                    <Coins size={14} style={{ display: "inline", marginRight: 6 }} />
                    Modal Awal Kasir Harian (Rp)
                  </label>
                  <input
                    id="cfg-modal"
                    type="number"
                    min="0"
                    step="50000"
                    placeholder="mis. 500000"
                    value={modalAwal}
                    onChange={(e) => setModalAwal(e.target.value)}
                    required
                  />
                  <span className="form-field-helper">
                    {modalAwal && Number(modalAwal) > 0
                      ? `Terbaca: ${formatRupiah(Number(modalAwal))}`
                      : "Uang kembalian kasir saat toko mulai buka."}
                  </span>
                </div>

                <div className="form-field-group">
                  <label htmlFor="cfg-pemilik">
                    <User size={14} style={{ display: "inline", marginRight: 6 }} />
                    Nama Pemilik / Pengelola
                  </label>
                  <input
                    id="cfg-pemilik"
                    placeholder="mis. Budi Santoso"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                  />
                  <span className="form-field-helper">
                    Penanggung jawab operasional outlet.
                  </span>
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="cfg-email">
                  <Mail size={14} style={{ display: "inline", marginRight: 6 }} />
                  Alamat Email Terdaftar
                </label>
                <input
                  id="cfg-email"
                  type="email"
                  value={profil?.email || "admin@warungmitra.com"}
                  disabled
                  style={{ background: "#F1F5F9", color: "#64748B", cursor: "not-allowed" }}
                />
                <span className="form-field-helper" style={{ display: "flex", alignItems: "center", gap: 4, color: "#059669" }}>
                  <CheckCircle2 size={13} />
                  Email akun utama terverifikasi sebagai pemilik warung.
                </span>
              </div>

              <div style={{ marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={saving}
                  style={{ width: "100%", justifyContent: "center", padding: 12 }}
                >
                  <Save size={16} />
                  {saving ? "Menyimpan Perubahan..." : "Simpan Perubahan Pengaturan"}
                </button>
              </div>
            </form>
          </div>

          {/* Kolom Kanan: Info Sistem & Zona Bahaya */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Info Sistem KawanUsaha */}
            <div className="widget-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Layers size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--color-text-main)" }}>
                  Informasi Sistem Warung
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: 8 }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Aplikasi</span>
                  <strong>KawanUsaha POS & Kitchen</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: 8 }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Versi</span>
                  <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>v1.0.0 (Release 2026)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", paddingBottom: 8 }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Database</span>
                  <span>MySQL 8.x (kawan_usaha_db)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Mode Akses</span>
                  <span className="badge-status badge-aman">Online / Localhost</span>
                </div>
              </div>
            </div>

            {/* Danger Zone: Reset Data Simulasi */}
            <div className="danger-zone-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#991B1B" }}>
                <AlertTriangle size={18} />
                <strong style={{ fontSize: 15 }}>Zona Bahaya: Reset Data</strong>
              </div>

              <p style={{ margin: 0, fontSize: 13, color: "#7F1D1D", lineHeight: 1.5 }}>
                Mengembalikan seluruh catatan transaksi, mutasi bahan dapur, dan stok menu ke kondisi percontohan awal.
              </p>

              <button
                type="button"
                className="btn-danger"
                onClick={() => setModalResetOpen(true)}
                style={{ marginTop: 4, justifyContent: "center" }}
              >
                <RotateCcw size={15} />
                Reset Data Simulasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Reset */}
      {modalResetOpen && (
        <div className="modal-backdrop" onClick={() => setModalResetOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: "var(--color-danger)" }}>
                <AlertTriangle size={20} color="var(--color-danger)" />
                <span>Konfirmasi Reset Data</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalResetOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 14, color: "var(--color-text-main)", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              Tindakan ini akan <strong>menghapus seluruh riwayat transaksi keuangan dan mutasi stok</strong> yang telah dicatat, kemudian mengembalikan stok bahan dapur ke konfigurasi default.
            </p>

            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: "#991B1B",
                marginBottom: 16,
              }}
            >
              Pastikan Anda sudah mengunduh draf laporan transaksi (.txt) sebelum melakukan reset jika data masih dibutuhkan.
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary-outline"
                onClick={() => setModalResetOpen(false)}
                disabled={resetting}
              >
                Batalkan
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleResetData}
                disabled={resetting}
              >
                {resetting ? "Mereset Data..." : "Ya, Reset Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
