// ============================================================================
// Halaman Transaksi Keuangan / Arus Kas Warung (KawanUsaha)
// File: frontend/src/pages/admin/HalamanTransaksi.tsx
// ============================================================================

import React, { useEffect, useState, useMemo } from "react";
import {
  Download,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";
import {
  getTransaksiApi,
  createTransaksiApi,
  getBahanBakuApi,
} from "../../api/produk";
import type { Transaksi, BahanBaku } from "../../models/produk";
import Toast from "../../components/Toast";

export default function HalamanTransaksi() {
  // State Data
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [bahanList, setBahanList] = useState<BahanBaku[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State Toast Notifikasi
  const [toast, setToast] = useState<{
    teks: string;
    jenis: "sukses" | "gagal";
  } | null>(null);

  // Filter & Paginasi
  const [filterJenis, setFilterJenis] = useState<"semua" | "masuk" | "keluar">(
    "semua"
  );
  const [halaman, setHalaman] = useState<number>(1);
  const barisPerHalaman = 10;

  // Form State: Kas Masuk
  const [submittingMasuk, setSubmittingMasuk] = useState<boolean>(false);
  const [masukKategori, setMasukKategori] = useState<string>(
    "Penjualan Harian Warung"
  );
  const [masukNominal, setMasukNominal] = useState<string>("");
  const [masukKeterangan, setMasukKeterangan] = useState<string>("");

  // Form State: Kas Keluar
  const [submittingKeluar, setSubmittingKeluar] = useState<boolean>(false);
  const [keluarAlokasi, setKeluarAlokasi] = useState<string>("");
  const [keluarJumlahStok, setKeluarJumlahStok] = useState<string>("");
  const [keluarNominal, setKeluarNominal] = useState<string>("");
  const [keluarKeterangan, setKeluarKeterangan] = useState<string>("");

  // Helper tampilkan toast
  function showToast(teks: string, jenis: "sukses" | "gagal" = "sukses") {
    setToast({ teks, jenis });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  // Format utility Rupiah
  function formatRupiah(nominal: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nominal);
  }

  // Format utility Tanggal
  function formatTanggal(tanggalStr?: string): string {
    if (!tanggalStr) return "-";
    const date = new Date(tanggalStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Ambil data transaksi dan bahan baku dapur
  async function muatData() {
    setLoading(true);
    setError(null);
    try {
      const [dataTransaksi, dataBahan] = await Promise.all([
        getTransaksiApi(),
        getBahanBakuApi(),
      ]);
      setTransaksiList(dataTransaksi || []);
      setBahanList(dataBahan || []);
    } catch (err) {
      setError((err as Error).message || "Gagal memuat catatan transaksi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  // Bahan terpilih jika user memilih bahan baku di kas keluar
  const bahanTerpilih = useMemo(() => {
    const idNum = Number(keluarAlokasi);
    if (!isNaN(idNum) && idNum > 0) {
      return bahanList.find((b) => b.id === idNum) || null;
    }
    return null;
  }, [keluarAlokasi, bahanList]);

  // Handle Submit Kas Masuk
  async function handleSubmitMasuk(e: React.FormEvent) {
    e.preventDefault();
    const nominal = Number(masukNominal.replace(/\D/g, ""));
    if (!nominal || nominal <= 0) {
      showToast("Nominal penerimaan kas masuk harus lebih dari Rp 0", "gagal");
      return;
    }

    setSubmittingMasuk(true);
    try {
      await createTransaksiApi({
        jenis_transaksi: "masuk",
        kategori: masukKategori,
        nominal,
        keterangan: masukKeterangan.trim() || `Penerimaan kas dari ${masukKategori}`,
      });

      showToast("Kas masuk sebesar " + formatRupiah(nominal) + " berhasil dicatat!");
      setMasukNominal("");
      setMasukKeterangan("");
      await muatData();
    } catch (err) {
      showToast((err as Error).message || "Gagal mencatat kas masuk", "gagal");
    } finally {
      setSubmittingMasuk(false);
    }
  }

  // Handle Submit Kas Keluar
  async function handleSubmitKeluar(e: React.FormEvent) {
    e.preventDefault();
    if (!keluarAlokasi) {
      showToast("Pilih kebutuhan atau alokasi belanja terlebih dahulu", "gagal");
      return;
    }

    const nominal = Number(keluarNominal.replace(/\D/g, ""));
    if (!nominal || nominal <= 0) {
      showToast("Nominal pengeluaran kas keluar harus lebih dari Rp 0", "gagal");
      return;
    }

    let payloadKategori = keluarAlokasi;
    let bahanBakuId: number | undefined = undefined;
    let jumlahStok: number | undefined = undefined;

    if (bahanTerpilih) {
      payloadKategori = `Belanja Bahan (${bahanTerpilih.nama_bahan})`;
      bahanBakuId = bahanTerpilih.id;
      if (keluarJumlahStok) {
        const parsedStok = parseFloat(keluarJumlahStok);
        if (!isNaN(parsedStok) && parsedStok > 0) {
          jumlahStok = parsedStok;
        }
      }
    } else {
      // Map label kategori operasional yang mudah dibaca
      const kategoriLabels: Record<string, string> = {
        gas_listrik_air: "Operasional (Gas/Listrik/Air)",
        gaji_karyawan: "Gaji & Upah Karyawan",
        kemasan_plastik: "Kemasan & Pembungkus",
        sewa_kebersihan: "Kebersihan & Retribusi",
        operasional_lainnya: "Biaya Operasional Lainnya",
      };
      payloadKategori = kategoriLabels[keluarAlokasi] || keluarAlokasi;
    }

    setSubmittingKeluar(true);
    try {
      await createTransaksiApi({
        jenis_transaksi: "keluar",
        kategori: payloadKategori,
        nominal,
        keterangan:
          keluarKeterangan.trim() ||
          (bahanTerpilih
            ? `Pembelian ${bahanTerpilih.nama_bahan} (${jumlahStok || 0} ${bahanTerpilih.satuan})`
            : payloadKategori),
        bahan_baku_id: bahanBakuId,
        jumlah_stok: jumlahStok,
      });

      const restockMsg =
        bahanTerpilih && jumlahStok
          ? ` (+${jumlahStok} ${bahanTerpilih.satuan} stok ditambahkan)`
          : "";
      showToast(
        "Pengeluaran " +
          formatRupiah(nominal) +
          " berhasil dicatat!" +
          restockMsg
      );

      setKeluarAlokasi("");
      setKeluarJumlahStok("");
      setKeluarNominal("");
      setKeluarKeterangan("");
      await muatData();
    } catch (err) {
      showToast((err as Error).message || "Gagal mencatat kas keluar", "gagal");
    } finally {
      setSubmittingKeluar(false);
    }
  }

  // Filter daftar transaksi
  const filteredTransaksi = useMemo(() => {
    if (filterJenis === "semua") return transaksiList;
    return transaksiList.filter((t) => t.jenis_transaksi === filterJenis);
  }, [transaksiList, filterJenis]);

  // Statistik Counter Tab
  const countMasuk = useMemo(
    () => transaksiList.filter((t) => t.jenis_transaksi === "masuk").length,
    [transaksiList]
  );
  const countKeluar = useMemo(
    () => transaksiList.filter((t) => t.jenis_transaksi === "keluar").length,
    [transaksiList]
  );

  // Data Paginasi
  const totalHalaman = Math.max(
    1,
    Math.ceil(filteredTransaksi.length / barisPerHalaman)
  );
  const halamanAman = Math.min(halaman, totalHalaman);
  const dataHalaman = useMemo(() => {
    const awal = (halamanAman - 1) * barisPerHalaman;
    return filteredTransaksi.slice(awal, awal + barisPerHalaman);
  }, [filteredTransaksi, halamanAman]);

  // Ekspor Draf Laporan (.txt)
  function unduhLaporanTxt() {
    const tanggalCetak = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const totalMasukNominal = transaksiList
      .filter((t) => t.jenis_transaksi === "masuk")
      .reduce((sum, item) => sum + Number(item.nominal), 0);

    const totalKeluarNominal = transaksiList
      .filter((t) => t.jenis_transaksi === "keluar")
      .reduce((sum, item) => sum + Number(item.nominal), 0);

    const arusKasBersih = totalMasukNominal - totalKeluarNominal;

    const barisTransaksiTeks =
      transaksiList.length > 0
        ? transaksiList
            .map((t, idx) => {
              const tanda = t.jenis_transaksi === "masuk" ? "(+) MASUK" : "(-) KELUAR";
              return `${idx + 1}. [${tanda}] ${formatTanggal(t.tanggal_transaksi || t.created_at)}
   Kategori   : ${t.kategori}
   Keterangan : ${t.keterangan || "-"}
   Nominal    : ${formatRupiah(Number(t.nominal))}`;
            })
            .join("\n-----------------------------------------------------\n")
        : "Belum ada transaksi yang tercatat.";

    const konten = `=====================================================
DRAF LAPORAN ARUS KAS KEUANGAN - KAWANUSAHA
Tanggal Cetak : ${tanggalCetak}
Unit Usaha    : Warung Mitra (Bekasi)
=====================================================

RINGKASAN ARUS KAS:
- Total Kas Masuk (Omzet)  : ${formatRupiah(totalMasukNominal)}
- Total Kas Keluar (Modal) : ${formatRupiah(totalKeluarNominal)}
- Saldo Kas Bersih         : ${formatRupiah(arusKasBersih)}
- Total Catatan Transaksi  : ${transaksiList.length} transaksi

=====================================================
RINCIAN RIWAYAT TRANSAKSI:
=====================================================
${barisTransaksiTeks}

=====================================================
Dicetak otomatis oleh KawanUsaha Sistem Manajemen Warung
=====================================================`;

    const blob = new Blob([konten], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Draf_Transaksi_WarungMitra_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="beranda-container">
      {/* Toast Notifikasi */}
      {toast && <Toast teks={toast.teks} jenis={toast.jenis} />}

      {/* Header Halaman */}
      <div className="beranda-header">
        <div className="beranda-title-wrap">
          <h1>Transaksi Keuangan</h1>
          <p className="beranda-subtitle">
            Catat seluruh arus kas masuk omzet jualan dan kas keluar operasional
            warung secara terperinci.
          </p>
        </div>
        <div className="beranda-actions">
          <button
            type="button"
            className="btn-secondary-outline"
            onClick={muatData}
            title="Muat ulang data transaksi"
          >
            <RefreshCw size={16} />
            Muat Ulang
          </button>
          <button
            type="button"
            className="btn-secondary-outline"
            onClick={unduhLaporanTxt}
          >
            <Download size={16} />
            Unduh Draf Laporan (.txt)
          </button>
        </div>
      </div>

      {/* Pesan Error Global jika ada */}
      {error && (
        <div className="error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Dua Kolom Formulir Input */}
      <div className="transaksi-form-grid">
        {/* Kolom Kiri: Catat Kas Masuk */}
        <div className="transaksi-card">
          <div className="transaksi-card-header">
            <div className="transaksi-card-title">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowDownRight size={18} />
              </div>
              <span>Catat Kas Masuk</span>
            </div>
            <span className="badge-status badge-aman">Pemasukan Warung</span>
          </div>

          <form onSubmit={handleSubmitMasuk}>
            <div className="form-field-group">
              <label htmlFor="masuk-kategori">Kategori / Sumber Penerimaan</label>
              <select
                id="masuk-kategori"
                value={masukKategori}
                onChange={(e) => setMasukKategori(e.target.value)}
              >
                <option value="Penjualan Harian Warung">
                  Penjualan Harian Warung
                </option>
                <option value="Katering & Pesanan Nasi Kotak">
                  Katering & Pesanan Nasi Kotak
                </option>
                <option value="Pesanan Online (GoFood / GrabFood)">
                  Pesanan Online (GoFood / GrabFood)
                </option>
                <option value="Penjualan Minuman & Camilan">
                  Penjualan Minuman & Camilan
                </option>
                <option value="Pendapatan Kas Lain-lain">
                  Pendapatan Kas Lain-lain
                </option>
              </select>
            </div>

            <div className="form-field-group">
              <label htmlFor="masuk-nominal">Nominal Penerimaan (Rp)</label>
              <input
                id="masuk-nominal"
                type="number"
                min="1000"
                step="500"
                placeholder="mis. 150000"
                value={masukNominal}
                onChange={(e) => setMasukNominal(e.target.value)}
                required
              />
              <span className="form-field-helper">
                {masukNominal && Number(masukNominal) > 0
                  ? `Terbaca: ${formatRupiah(Number(masukNominal))}`
                  : "Masukkan nominal uang tunai atau transfer yang diterima."}
              </span>
            </div>

            <div className="form-field-group">
              <label htmlFor="masuk-keterangan">Keterangan / Rincian Singkat</label>
              <input
                id="masuk-keterangan"
                type="text"
                placeholder="mis. 12 porsi paket makan siang rombongan kantor"
                value={masukKeterangan}
                onChange={(e) => setMasukKeterangan(e.target.value)}
              />
            </div>

            <div
              style={{
                background: "#F0FDF4",
                border: "1px dashed #86EFAC",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: "#166534",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} color="#16A34A" />
              <span>Otomatis menambah saldo omzet hari ini di Beranda.</span>
            </div>

            <button
              type="submit"
              className="btn-submit-masuk"
              disabled={submittingMasuk}
            >
              {submittingMasuk ? "Menyimpan Transaksi..." : "Simpan Kas Masuk"}
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Catat Kas Keluar */}
        <div className="transaksi-card">
          <div className="transaksi-card-header">
            <div className="transaksi-card-title">
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#FEF2F2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowUpRight size={18} />
              </div>
              <span>Catat Kas Keluar</span>
            </div>
            <span className="badge-status badge-kritis">Pengeluaran</span>
          </div>

          <form onSubmit={handleSubmitKeluar}>
            <div className="form-field-group">
              <label htmlFor="keluar-alokasi">Kebutuhan / Alokasi Belanja</label>
              <select
                id="keluar-alokasi"
                value={keluarAlokasi}
                onChange={(e) => setKeluarAlokasi(e.target.value)}
                required
              >
                <option value="">-- Pilih Alokasi Belanja --</option>
                <optgroup label="Bahan Dapur (Otomatis Tambah Stok)">
                  {bahanList.map((b) => (
                    <option key={b.id} value={b.id}>
                      Bahan: {b.nama_bahan} (Sisa saat ini: {b.stok_saat_ini}{" "}
                      {b.satuan})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Biaya Operasional Warung">
                  <option value="gas_listrik_air">
                    Operasional (Gas LPG / Listrik / Air)
                  </option>
                  <option value="gaji_karyawan">
                    Gaji / Upah Karyawan Harian
                  </option>
                  <option value="kemasan_plastik">
                    Kemasan & Plastik Pembungkus
                  </option>
                  <option value="sewa_kebersihan">
                    Kebersihan & Retribusi Pasar
                  </option>
                  <option value="operasional_lainnya">
                    Pengeluaran Operasional Lainnya
                  </option>
                </optgroup>
              </select>
            </div>

            {/* Input jumlah stok jika memilih bahan dapur */}
            {bahanTerpilih && (
              <div
                className="form-field-group"
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <label
                  htmlFor="keluar-stok"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#92400E",
                  }}
                >
                  <Package size={15} />
                  Jumlah Tambahan Stok Masuk ({bahanTerpilih.satuan}):
                </label>
                <input
                  id="keluar-stok"
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder={`mis. 5 (${bahanTerpilih.satuan})`}
                  value={keluarJumlahStok}
                  onChange={(e) => setKeluarJumlahStok(e.target.value)}
                />
                <span
                  className="form-field-helper"
                  style={{ color: "#B45309" }}
                >
                  Stok <strong>{bahanTerpilih.nama_bahan}</strong> di inventaris
                  akan otomatis ditambah sejumlah ini.
                </span>
              </div>
            )}

            <div className="form-field-group">
              <label htmlFor="keluar-nominal">Total Nominal Pengeluaran (Rp)</label>
              <input
                id="keluar-nominal"
                type="number"
                min="1000"
                step="500"
                placeholder="mis. 75000"
                value={keluarNominal}
                onChange={(e) => setKeluarNominal(e.target.value)}
                required
              />
              <span className="form-field-helper">
                {keluarNominal && Number(keluarNominal) > 0
                  ? `Terbaca: ${formatRupiah(Number(keluarNominal))}`
                  : "Total rupiah yang dibayarkan untuk belanja atau operasional."}
              </span>
            </div>

            <div className="form-field-group">
              <label htmlFor="keluar-keterangan">Keterangan / Catatan Tambahan</label>
              <input
                id="keluar-keterangan"
                type="text"
                placeholder="mis. Beli cabai & bawang di Pasar Kranji"
                value={keluarKeterangan}
                onChange={(e) => setKeluarKeterangan(e.target.value)}
              />
            </div>

            <div
              style={{
                background: "#FEF2F2",
                border: "1px dashed #FCA5A5",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                color: "#991B1B",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle size={16} color="#DC2626" />
              <span>
                Otomatis dicatat ke belanja modal & mengurangi laba harian.
              </span>
            </div>

            <button
              type="submit"
              className="btn-submit-keluar"
              disabled={submittingKeluar}
            >
              {submittingKeluar ? "Menyimpan Transaksi..." : "Simpan Kas Keluar"}
            </button>
          </form>
        </div>
      </div>

      {/* Tabel Riwayat Arus Kas */}
      <div className="widget-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
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
              Riwayat Arus Kas Lengkap
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              Daftar seluruh catatan kas masuk dan belanja modal warung.
            </p>
          </div>

          {/* Filter Tab Row */}
          <div className="filter-tab-row">
            <button
              type="button"
              className={`filter-tab-btn ${
                filterJenis === "semua" ? "active" : ""
              }`}
              onClick={() => {
                setFilterJenis("semua");
                setHalaman(1);
              }}
            >
              Semua ({transaksiList.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${
                filterJenis === "masuk" ? "active" : ""
              }`}
              onClick={() => {
                setFilterJenis("masuk");
                setHalaman(1);
              }}
            >
              Kas Masuk ({countMasuk})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${
                filterJenis === "keluar" ? "active" : ""
              }`}
              onClick={() => {
                setFilterJenis("keluar");
                setHalaman(1);
              }}
            >
              Kas Keluar ({countKeluar})
            </button>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="tabel-wrap">
          <table className="tabel">
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Tanggal & Waktu</th>
                <th style={{ width: "25%" }}>Jenis & Kategori</th>
                <th style={{ width: "35%" }}>Rincian / Keterangan</th>
                <th style={{ width: "20%", textAlign: "right" }}>
                  Nominal (Rp)
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 36 }}>
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
                      <span>Memuat riwayat transaksi...</span>
                    </div>
                  </td>
                </tr>
              ) : dataHalaman.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="transaksi-empty-state">
                      <div className="transaksi-empty-icon">
                        <Receipt size={24} />
                      </div>
                      <strong style={{ color: "var(--color-text-main)" }}>
                        Belum Ada Catatan Transaksi
                      </strong>
                      <p style={{ margin: 0, fontSize: 13, maxWidth: 360 }}>
                        {filterJenis === "semua"
                          ? "Gunakan formulir di atas untuk mencatat arus kas masuk jualan atau kas keluar belanja warung."
                          : `Belum ada transaksi dengan filter '${
                              filterJenis === "masuk" ? "Kas Masuk" : "Kas Keluar"
                            }'.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                dataHalaman.map((item) => {
                  const isMasuk = item.jenis_transaksi === "masuk";
                  return (
                    <tr key={item.id}>
                      <td style={{ color: "var(--color-text-muted)" }}>
                        {formatTanggal(item.tanggal_transaksi || item.created_at)}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            className={isMasuk ? "badge-masuk" : "badge-keluar"}
                          >
                            {isMasuk ? (
                              <>
                                <ArrowDownRight size={13} />
                                Masuk
                              </>
                            ) : (
                              <>
                                <ArrowUpRight size={13} />
                                Keluar
                              </>
                            )}
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: "var(--color-text-main)",
                              fontSize: 13,
                            }}
                          >
                            {item.kategori}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {item.keterangan || (
                          <span style={{ color: "var(--color-text-muted)" }}>
                            -
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          className={
                            isMasuk ? "nominal-masuk" : "nominal-keluar"
                          }
                          style={{ fontSize: 14 }}
                        >
                          {isMasuk ? "+ " : "- "}
                          {formatRupiah(Number(item.nominal))}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Kontrol Paginasi */}
          {!loading && filteredTransaksi.length > 0 && (
            <div className="pagination-container">
              <span>
                Menampilkan{" "}
                <strong>
                  {Math.min(
                    (halamanAman - 1) * barisPerHalaman + 1,
                    filteredTransaksi.length
                  )}
                </strong>{" "}
                -{" "}
                <strong>
                  {Math.min(
                    halamanAman * barisPerHalaman,
                    filteredTransaksi.length
                  )}
                </strong>{" "}
                dari <strong>{filteredTransaksi.length}</strong> transaksi
              </span>

              <div className="pagination-btn-group">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={halamanAman <= 1}
                  onClick={() => setHalaman((prev) => Math.max(1, prev - 1))}
                >
                  Sebelumnya
                </button>
                <span
                  style={{
                    alignSelf: "center",
                    padding: "0 6px",
                    fontWeight: 600,
                  }}
                >
                  {halamanAman} / {totalHalaman}
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={halamanAman >= totalHalaman}
                  onClick={() =>
                    setHalaman((prev) => Math.min(totalHalaman, prev + 1))
                  }
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
