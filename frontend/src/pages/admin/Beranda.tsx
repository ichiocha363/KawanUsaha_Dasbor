// ============================================================================
// Halaman Dasbor Beranda / Ringkasan Dapur KawanUsaha
// File: frontend/src/pages/admin/Beranda.tsx
// ============================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Clock,
} from "lucide-react";
import { getRingkasanDasborApi, getBahanBakuApi, getProdukApi } from "../../api/produk";
import type { BahanBaku, Produk, RingkasanDasbor } from "../../models/produk";
import type { Pengguna } from "../../data/pengguna";

interface Props {
  daftarPengguna?: Pengguna[];
}

export default function Beranda({ daftarPengguna: _ }: Props) {
  const navigate = useNavigate();

  const [ringkasan, setRingkasan] = useState<RingkasanDasbor | null>(null);
  const [bahanList, setBahanList] = useState<BahanBaku[]>([]);
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil data real-time saat halaman dimuat
  async function muatData() {
    setLoading(true);
    setError(null);
    try {
      const [dataRingkasan, dataBahan, dataProduk] = await Promise.all([
        getRingkasanDasborApi(),
        getBahanBakuApi(),
        getProdukApi(),
      ]);
      setRingkasan(dataRingkasan);
      setBahanList(dataBahan);
      setProdukList(dataProduk);
    } catch (err) {
      setError((err as Error).message || "Gagal memuat data ringkasan dapur.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  // Format utility mata uang Rupiah
  function formatRupiah(nominal: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nominal);
  }

  // Filter bahan yang butuh perhatian belanja (Kritis & Menipis)
  const bahanPerluBelanja = bahanList.filter(
    (b) => b.status === "Kritis" || b.status === "Menipis"
  );

  // Fungsi Ekspor Draf Laporan (.txt)
  function unduhLaporanTxt() {
    if (!ringkasan) return;
    const tanggal = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const daftarBahanTeks =
      bahanPerluBelanja.length > 0
        ? bahanPerluBelanja
            .map(
              (b) =>
                `- [${b.status.toUpperCase()}] ${b.nama_bahan}: Sisa ${b.stok_saat_ini} ${b.satuan} (Batas Min: ${b.batas_minimum} ${b.satuan})`
            )
            .join("\n")
        : "Semua bahan dapur dalam kondisi aman.";

    const konten = `=====================================================
DRAF LAPORAN OPERASIONAL & KAS - KAWANUSAHA
Tanggal: ${tanggal}
Unit Usaha: Warung Mitra (Bekasi)
=====================================================

1. RINGKASAN KEUANGAN & ARUS KAS
- Omzet Penjualan (Kas Masuk) : ${formatRupiah(ringkasan.omzet_hari_ini)}
- Belanja Modal (Kas Keluar)  : ${formatRupiah(ringkasan.belanja_modal)}
- Estimasi Laba Kotor         : ${formatRupiah(ringkasan.estimasi_laba_kotor)}

2. STATUS INVENTARIS DAPUR
- Bahan Aman                  : ${ringkasan.total_bahan_aman} item
- Bahan Menipis (Perlu Dicek) : ${ringkasan.total_bahan_menipis} item
- Bahan Kritis (Restock Segera): ${ringkasan.total_bahan_kritis} item

3. DAFTAR BAHAN PERLU BELANJA SEGERA:
${daftarBahanTeks}

=====================================================
Dicetak otomatis oleh KawanUsaha System
=====================================================`;

    const blob = new Blob([konten], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_KawanUsaha_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // 5 Data Simulasi Aktivitas Transaksi Terakhir
  const transaksiTerakhir = [
    {
      id: 5,
      jam: "17:45",
      jenis: "masuk",
      kategori: "Penjualan",
      nominal: 165000,
      keterangan: "Penjualan kasir sore (6 nasi goreng, 3 mie jawa, 5 es jeruk)",
    },
    {
      id: 4,
      jam: "13:30",
      jenis: "masuk",
      kategori: "Penjualan",
      nominal: 285000,
      keterangan: "Penjualan kasir makan siang (11 ayam sambal korek, 8 es teh)",
    },
    {
      id: 3,
      jam: "09:15",
      jenis: "keluar",
      kategori: "Operasional",
      nominal: 22000,
      keterangan: "Isi ulang tabung gas LPG 3kg dapur",
    },
    {
      id: 2,
      jam: "07:45",
      jenis: "keluar",
      kategori: "Belanja Modal",
      nominal: 320000,
      keterangan: "Belanja bahan baku subuh di Pasar Baru Bekasi",
    },
    {
      id: 1,
      jam: "07:00",
      jenis: "masuk",
      kategori: "Modal Awal",
      nominal: 500000,
      keterangan: "Setoran modal kas harian awal di laci kasir",
    },
  ];

  // 4 Menu Simulasi Terlaris Hari Ini
  const menuTerlaris = [
    {
      nama: "Ayam Goreng Sambal Korek",
      kategori: "Makanan",
      terjual: 11,
      omzet: 242000,
    },
    {
      nama: "Es Teh Manis",
      kategori: "Minuman",
      terjual: 8,
      omzet: 40000,
    },
    {
      nama: "Nasi Goreng Spesial",
      kategori: "Makanan",
      terjual: 6,
      omzet: 108000,
    },
    {
      nama: "Es Jeruk Peras",
      kategori: "Minuman",
      terjual: 5,
      omzet: 35000,
    },
  ];

  if (loading) {
    return (
      <div className="state-center-box">
        <div className="spinner-teal" />
        <p style={{ margin: 0, fontWeight: 600, color: "var(--color-primary)" }}>
          Memuat ringkasan dapur KawanUsaha...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-center-box">
        <AlertTriangle size={36} color="var(--color-danger)" />
        <h3 style={{ margin: 0 }}>Gagal Menghubungkan ke Server</h3>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>{error}</p>
        <button
          type="button"
          className="btn-primary-action"
          onClick={muatData}
          style={{ marginTop: 12 }}
        >
          <RefreshCw size={16} />
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="beranda-container">
      {/* 1. Header Halaman Ringkasan Dapur */}
      <section className="beranda-header">
        <div className="beranda-title-wrap">
          <h1>Ringkasan Dapur</h1>
          <p className="beranda-subtitle">
            Pantau ringkasan kas harian, pergerakan stok bahan, dan menu terlaris.
          </p>
        </div>

        <div className="beranda-actions">
          <button
            type="button"
            className="btn-secondary-outline"
            onClick={unduhLaporanTxt}
            title="Download ringkasan laporan operasional harian"
          >
            <Download size={16} />
            <span>Unduh Draf Laporan (.txt)</span>
          </button>

          <button
            type="button"
            className="btn-primary-action"
            onClick={() => navigate("/admin/transaksi")}
            title="Catat arus kas masuk/keluar"
          >
            <Plus size={16} />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </section>

      {/* 2. Grid 3 Kartu KPI Keuangan */}
      <section className="kpi-grid">
        {/* Kartu 1: Omzet Kas Masuk */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Omzet (Kas Masuk)</span>
            <div className="kpi-icon-wrap kpi-icon-masuk">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {formatRupiah(ringkasan?.omzet_hari_ini || 0)}
          </div>
          <span className="kpi-label">Total penerimaan kasir hari ini</span>
        </div>

        {/* Kartu 2: Belanja Modal Kas Keluar */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Belanja Modal (Kas Keluar)</span>
            <div className="kpi-icon-wrap kpi-icon-keluar">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="kpi-value">
            {formatRupiah(ringkasan?.belanja_modal || 0)}
          </div>
          <span className="kpi-label">Pembelian bahan & operasional</span>
        </div>

        {/* Kartu 3: Estimasi Laba Kotor */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Estimasi Laba Kotor</span>
            <div className="kpi-icon-wrap kpi-icon-laba">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--color-primary)" }}>
            {formatRupiah(ringkasan?.estimasi_laba_kotor || 0)}
          </div>
          <span className="kpi-label">Omzet dikurangi belanja modal</span>
        </div>
      </section>

      {/* 3. Baris Widget Operasional 2 Kolom */}
      <section className="widget-row-2col">
        {/* Kolom Kiri: Menu Terlaris Hari Ini */}
        <div className="widget-card">
          <div className="widget-card-header">
            <h2 className="widget-card-title">Menu Terlaris Hari Ini</h2>
            <span
              className="widget-link"
              onClick={() => navigate("/admin/produk")}
            >
              Lihat Menu ({produkList.length}) <ArrowRight size={14} />
            </span>
          </div>

          {menuTerlaris.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={36} color="var(--color-text-muted)" />
              <p>Belum ada menu yang dicatat atau transaksi penjualan hari ini.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {menuTerlaris.map((item, index) => (
                <div
                  key={item.nama}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: index === 0 ? "var(--color-primary-light)" : "#FAFAFA",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        backgroundColor: index === 0 ? "var(--color-primary)" : "#E2E8F0",
                        color: index === 0 ? "#FFFFFF" : "var(--color-text-main)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {item.nama}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                        {item.kategori}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary)" }}>
                      {item.terjual} Porsi
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                      {formatRupiah(item.omzet)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Status Bahan Baku Dapur */}
        <div className="widget-card">
          <div className="widget-card-header">
            <h2 className="widget-card-title">Status Bahan Baku Dapur</h2>
            <span
              className="widget-link"
              onClick={() => navigate("/admin/inventaris")}
            >
              Kelola Stok <ArrowRight size={14} />
            </span>
          </div>

          {/* Baris 3 Counter Boxes */}
          <div className="status-boxes-row">
            <div className="status-counter-box box-aman">
              <span className="status-counter-num">
                {ringkasan?.total_bahan_aman ?? 0}
              </span>
              <span className="status-counter-lbl">Aman</span>
            </div>

            <div className="status-counter-box box-menipis">
              <span className="status-counter-num">
                {ringkasan?.total_bahan_menipis ?? 0}
              </span>
              <span className="status-counter-lbl">Perlu Dicek</span>
            </div>

            <div className="status-counter-box box-kritis">
              <span className="status-counter-num">
                {ringkasan?.total_bahan_kritis ?? 0}
              </span>
              <span className="status-counter-lbl">Kritis</span>
            </div>
          </div>

          {/* Kotak Bahan Perlu Belanja Segera */}
          <div className="bahan-segera-box">
            <div className="bahan-segera-title">
              <AlertTriangle size={14} color="var(--color-danger)" />
              Bahan perlu belanja segera ({bahanPerluBelanja.length})
            </div>

            {bahanPerluBelanja.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-success)" }}>
                Semua persediaan aman! Tidak ada bahan dapur yang kritis saat ini.
              </p>
            ) : (
              <div className="bahan-segera-list">
                {bahanPerluBelanja.map((b) => (
                  <div key={b.id} className="bahan-segera-item">
                    <div>
                      <span style={{ fontWeight: 600 }}>{b.nama_bahan}</span>
                      <span style={{ fontSize: 11, color: "var(--color-text-muted)", marginLeft: 6 }}>
                        Sisa: <b>{b.stok_saat_ini} {b.satuan}</b> (Batas: {b.batas_minimum} {b.satuan})
                      </span>
                    </div>
                    <span className={`badge-status badge-${b.status.toLowerCase()}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tombol Asisten AI Belanja */}
          <button
            type="button"
            className="btn-ai-asisten"
            onClick={() => navigate("/admin/inventaris")}
            title="Buat daftar belanja pintar otomatis"
          >
            <Sparkles size={16} />
            <span>Buka Asisten AI Belanja</span>
          </button>
        </div>
      </section>

      {/* 4. Widget Tabel Bawah: 5 Aktivitas Transaksi Terakhir */}
      <section className="widget-card">
        <div className="widget-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={18} color="var(--color-primary)" />
            <h2 className="widget-card-title">5 Aktivitas Transaksi Terakhir</h2>
          </div>
          <span
            className="widget-link"
            onClick={() => navigate("/admin/transaksi")}
          >
            Buka Semua Transaksi <ArrowRight size={14} />
          </span>
        </div>

        <div className="tabel-wrap">
          <table className="tabel">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Waktu</th>
                <th style={{ width: 140 }}>Kategori</th>
                <th>Keterangan Aktivitas</th>
                <th style={{ width: 120 }}>Arus Kas</th>
                <th style={{ width: 140, textAlign: "right" }}>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {transaksiTerakhir.map((trx) => (
                <tr key={trx.id}>
                  <td style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
                    {trx.jam}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: "#F1F5F9",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {trx.kategori}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text-main)" }}>
                    {trx.keterangan}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                          trx.jenis === "masuk"
                            ? "var(--color-success)"
                            : "var(--color-danger)",
                      }}
                    >
                      {trx.jenis === "masuk" ? "↓ Kas Masuk" : "↑ Kas Keluar"}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                      color:
                        trx.jenis === "masuk"
                          ? "var(--color-success)"
                          : "var(--color-danger)",
                    }}
                  >
                    {trx.jenis === "masuk" ? "+" : "-"}
                    {formatRupiah(trx.nominal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
