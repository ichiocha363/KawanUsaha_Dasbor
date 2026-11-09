// ============================================================================
// Halaman Manajemen Inventaris Dapur & Bahan Baku (KawanUsaha)
// File: frontend/src/pages/admin/HalamanInventaris.tsx
// ============================================================================

import React, { useEffect, useState, useMemo } from "react";
import type { BahanBaku, BahanBakuStatus } from "../../models/produk";
import {
  getBahanBakuApi,
  createBahanBakuApi,
  ubahBahanBakuApi,
  hapusBahanBakuApi,
  restockBahanApi,
  getMutasiStokApi,
  type MutasiStokItem,
} from "../../api/produk";
import Toast from "../../components/Toast";
import {
  Plus,
  RefreshCw,
  Package,
  PackageCheck,
  AlertTriangle,
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  X,
  History,
} from "lucide-react";

type InfoToast = { teks: string; jenis: "sukses" | "gagal" };

export default function HalamanInventaris() {
  const [bahanList, setBahanList] = useState<BahanBaku[]>([]);
  const [mutasiList, setMutasiList] = useState<MutasiStokItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<InfoToast | null>(null);

  // Modal State Tambah / Ubah Bahan
  const [modalBahanOpen, setModalBahanOpen] = useState(false);
  const [bahanDiubah, setBahanDiubah] = useState<BahanBaku | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formStok, setFormStok] = useState("");
  const [formBatasMin, setFormBatasMin] = useState("");
  const [formSatuan, setFormSatuan] = useState("kg");
  const [formHargaSatuan, setFormHargaSatuan] = useState("");
  const [submittingBahan, setSubmittingBahan] = useState(false);

  // Modal State Restock Cepat
  const [modalRestockOpen, setModalRestockOpen] = useState(false);
  const [bahanRestock, setBahanRestock] = useState<BahanBaku | null>(null);
  const [restockJumlah, setRestockJumlah] = useState("");
  const [restockJenis, setRestockJenis] = useState<"masuk" | "keluar">("masuk");
  const [restockSumber, setRestockSumber] = useState("Belanja Pasar");
  const [submittingRestock, setSubmittingRestock] = useState(false);

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

  async function muatData() {
    setLoading(true);
    try {
      const [dataBahan, dataMutasi] = await Promise.all([
        getBahanBakuApi(),
        getMutasiStokApi().catch(() => []),
      ]);
      setBahanList(dataBahan || []);
      setMutasiList(dataMutasi || []);
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal memuat inventaris dapur", "gagal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatData();
  }, []);

  // Hitung Agregasi Status Stok
  const { totalAman, totalMenipis, totalKritis } = useMemo(() => {
    let aman = 0;
    let menipis = 0;
    let kritis = 0;
    bahanList.forEach((b) => {
      if (b.status === "Kritis") kritis++;
      else if (b.status === "Menipis") menipis++;
      else aman++;
    });
    return { totalAman: aman, totalMenipis: menipis, totalKritis: kritis };
  }, [bahanList]);

  // Buka Modal Tambah Bahan Baru
  function bukaModalTambah() {
    setBahanDiubah(null);
    setFormNama("");
    setFormStok("");
    setFormBatasMin("2");
    setFormSatuan("kg");
    setFormHargaSatuan("");
    setModalBahanOpen(true);
  }

  // Buka Modal Edit Bahan
  function bukaModalEdit(b: BahanBaku) {
    setBahanDiubah(b);
    setFormNama(b.nama_bahan);
    setFormStok(String(b.stok_saat_ini));
    setFormBatasMin(String(b.batas_minimum));
    setFormSatuan(b.satuan);
    setFormHargaSatuan(String(b.estimasi_harga_satuan || 0));
    setModalBahanOpen(true);
  }

  // Submit Simpan Bahan Baku (Tambah / Edit)
  async function handleSimpanBahan(e: React.FormEvent) {
    e.preventDefault();
    const namaBersih = formNama.trim();
    if (!namaBersih) {
      tampilkanToast("Nama bahan baku wajib diisi", "gagal");
      return;
    }

    const stokNum = Number(formStok);
    const batasMinNum = Number(formBatasMin);
    const hargaSatuanNum = Number(formHargaSatuan) || 0;

    if (isNaN(stokNum) || stokNum < 0) {
      tampilkanToast("Stok saat ini tidak boleh bernilai negatif", "gagal");
      return;
    }

    if (isNaN(batasMinNum) || batasMinNum <= 0) {
      tampilkanToast("Batas minimum harus bernilai lebih dari 0", "gagal");
      return;
    }

    setSubmittingBahan(true);
    try {
      if (bahanDiubah) {
        await ubahBahanBakuApi(bahanDiubah.id, {
          nama_bahan: namaBersih,
          stok_saat_ini: stokNum,
          batas_minimum: batasMinNum,
          satuan: formSatuan,
          estimasi_harga_satuan: hargaSatuanNum,
        });
        tampilkanToast(`Bahan "${namaBersih}" berhasil diperbarui`, "sukses");
      } else {
        await createBahanBakuApi({
          nama_bahan: namaBersih,
          stok_saat_ini: stokNum,
          batas_minimum: batasMinNum,
          satuan: formSatuan,
          estimasi_harga_satuan: hargaSatuanNum,
        });
        tampilkanToast(`Bahan baru "${namaBersih}" berhasil ditambahkan ke dapur!`, "sukses");
      }
      setModalBahanOpen(false);
      await muatData();
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal menyimpan bahan baku", "gagal");
    } finally {
      setSubmittingBahan(false);
    }
  }

  // Hapus Bahan Baku
  async function handleHapusBahan(b: BahanBaku) {
    if (!confirm(`Hapus bahan baku "${b.nama_bahan}" dari inventaris?`)) return;
    try {
      await hapusBahanBakuApi(b.id);
      tampilkanToast(`Bahan "${b.nama_bahan}" berhasil dihapus`, "sukses");
      await muatData();
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal menghapus bahan", "gagal");
    }
  }

  // Buka Modal Restock Cepat
  function bukaModalRestock(b: BahanBaku) {
    setBahanRestock(b);
    setRestockJumlah("");
    setRestockJenis("masuk");
    setRestockSumber(b.status === "Kritis" ? "Restock Pasar Mendesak" : "Belanja Pasar");
    setModalRestockOpen(true);
  }

  // Submit Restock
  async function handleSimpanRestock(e: React.FormEvent) {
    e.preventDefault();
    if (!bahanRestock) return;

    const jumlahNum = Number(restockJumlah);
    if (isNaN(jumlahNum) || jumlahNum <= 0) {
      tampilkanToast("Jumlah restock harus lebih dari 0", "gagal");
      return;
    }

    setSubmittingRestock(true);
    try {
      await restockBahanApi(
        bahanRestock.id,
        jumlahNum,
        restockJenis,
        restockSumber.trim() || (restockJenis === "masuk" ? "Restock Pasar" : "Pemakaian Dapur")
      );
      tampilkanToast(
        `Stok "${bahanRestock.nama_bahan}" berhasil ${
          restockJenis === "masuk" ? "ditambahkan" : "dikurangkan"
        } sebanyak ${jumlahNum} ${bahanRestock.satuan}`,
        "sukses"
      );
      setModalRestockOpen(false);
      await muatData();
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal memperbarui stok", "gagal");
    } finally {
      setSubmittingRestock(false);
    }
  }

  function getBadgeClass(status: BahanBakuStatus): string {
    if (status === "Kritis") return "badge-kritis";
    if (status === "Menipis") return "badge-menipis";
    return "badge-aman";
  }

  return (
    <div className="beranda-container">
      {/* Toast Feedback */}
      {toast && <Toast teks={toast.teks} jenis={toast.jenis} />}

      {/* Header Halaman */}
      <div className="beranda-header">
        <div className="beranda-title-wrap">
          <h1>Inventaris Dapur</h1>
          <p className="beranda-subtitle">
            Kelola stok bahan baku, batas minimum, dan pemesanan restock dapur.
          </p>
        </div>
        <div className="beranda-actions">
          <button
            type="button"
            className="btn-secondary-outline"
            onClick={muatData}
            title="Muat ulang data inventaris"
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
            + Tambah Bahan Baku
          </button>
        </div>
      </div>

      {/* 3 Counter Cards Status Persediaan */}
      <div className="inventaris-counter-grid">
        <div className="counter-card">
          <div className="counter-icon-wrap" style={{ background: "#ECFDF5", color: "#059669" }}>
            <PackageCheck size={24} />
          </div>
          <div className="counter-card-info">
            <span className="counter-card-label">Bahan Aman</span>
            <strong className="counter-card-value">{totalAman}</strong>
          </div>
        </div>

        <div className="counter-card">
          <div className="counter-icon-wrap" style={{ background: "#FFFBEB", color: "#D97706" }}>
            <AlertTriangle size={24} />
          </div>
          <div className="counter-card-info">
            <span className="counter-card-label">Perlu Dicek (Menipis)</span>
            <strong className="counter-card-value">{totalMenipis}</strong>
          </div>
        </div>

        <div className="counter-card">
          <div className="counter-icon-wrap" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            <AlertOctagon size={24} />
          </div>
          <div className="counter-card-info">
            <span className="counter-card-label">Kritis (Segera Belanja)</span>
            <strong className="counter-card-value">{totalKritis}</strong>
          </div>
        </div>
      </div>

      {/* Tabel Inventaris Bahan Baku */}
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
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "var(--color-text-main)" }}>
              Daftar Stok Bahan Baku
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>
              Pantau sisa kuantitas bahan mentah terhadap ambang batas peringatan.
            </p>
          </div>
        </div>

        <div className="tabel-wrap">
          <table className="tabel">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Nama Bahan</th>
                <th style={{ width: "12%" }}>Satuan</th>
                <th style={{ width: "15%" }}>Sisa Stok</th>
                <th style={{ width: "15%" }}>Batas Min.</th>
                <th style={{ width: "15%" }}>Estimasi Harga</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "18%", textAlign: "right" }}>Aksi</th>
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
                      <span>Memuat inventaris dapur...</span>
                    </div>
                  </td>
                </tr>
              ) : bahanList.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="transaksi-empty-state">
                      <div className="transaksi-empty-icon">
                        <Package size={24} />
                      </div>
                      <strong style={{ color: "var(--color-text-main)" }}>
                        Inventaris Bahan Dapur Masih Kosong
                      </strong>
                      <p style={{ margin: 0, fontSize: 13, maxWidth: 360 }}>
                        Catat persediaan bahan baku masakan Anda agar sistem dapat memantau stok dan memberi peringatan belanja.
                      </p>
                      <button
                        type="button"
                        className="btn-primary-action"
                        onClick={bukaModalTambah}
                        style={{ marginTop: 8 }}
                      >
                        <Plus size={15} />
                        + Tambah Bahan Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                bahanList.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "var(--color-text-main)", fontSize: 14 }}>
                          {b.nama_bahan}
                        </strong>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                          ID: #{b.id}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#F1F5F9",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--color-text-main)",
                        }}
                      >
                        {b.satuan}
                      </span>
                    </td>
                    <td>
                      <strong
                        style={{
                          fontSize: 14,
                          color: b.status === "Kritis" ? "#DC2626" : "var(--color-text-main)",
                        }}
                      >
                        {b.stok_saat_ini} {b.satuan}
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                        {b.batas_minimum} {b.satuan}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "var(--color-text-main)" }}>
                        {b.estimasi_harga_satuan > 0
                          ? `${formatRupiah(b.estimasi_harga_satuan)} / ${b.satuan}`
                          : "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-status ${getBadgeClass(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="aksi" style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{
                            padding: "6px 12px",
                            fontSize: 12,
                            background: "var(--color-primary)",
                          }}
                          onClick={() => bukaModalRestock(b)}
                          title="Restock bahan ini"
                        >
                          + Restock
                        </button>
                        <button
                          type="button"
                          className="btn-secondary-outline"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          onClick={() => bukaModalEdit(b)}
                          title="Ubah info bahan"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn-hapus"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          onClick={() => handleHapusBahan(b)}
                          title="Hapus bahan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Riwayat Mutasi Stok Bahan */}
      <div className="widget-card" style={{ marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <History size={18} color="var(--color-primary)" />
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-text-main)" }}>
            Riwayat Mutasi Stok Dapur Terakhir
          </h2>
        </div>

        <div className="tabel-wrap">
          <table className="tabel">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Waktu Mutasi</th>
                <th style={{ width: "28%" }}>Nama Bahan</th>
                <th style={{ width: "15%" }}>Jenis Mutasi</th>
                <th style={{ width: "15%" }}>Jumlah Perubahan</th>
                <th style={{ width: "20%" }}>Keterangan / Sumber</th>
              </tr>
            </thead>
            <tbody>
              {mutasiList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--color-text-muted)" }}>
                    Belum ada riwayat mutasi stok bahan.
                  </td>
                </tr>
              ) : (
                mutasiList.slice(0, 15).map((m) => {
                  const isMasuk = m.jenis_mutasi === "masuk";
                  return (
                    <tr key={m.id}>
                      <td style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                        {formatTanggal(m.dibuat_pada)}
                      </td>
                      <td>
                        <strong style={{ color: "var(--color-text-main)", fontSize: 13 }}>
                          {m.nama_bahan}
                        </strong>
                      </td>
                      <td>
                        <span className={isMasuk ? "badge-masuk" : "badge-keluar"}>
                          {isMasuk ? (
                            <>
                              <ArrowDownRight size={13} /> Masuk
                            </>
                          ) : (
                            <>
                              <ArrowUpRight size={13} /> Keluar
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <strong
                          style={{
                            color: isMasuk ? "#059669" : "#DC2626",
                            fontSize: 13,
                          }}
                        >
                          {isMasuk ? "+" : "-"}
                          {m.jumlah} {m.satuan}
                        </strong>
                      </td>
                      <td style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                        {m.sumber || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Bahan */}
      {modalBahanOpen && (
        <div className="modal-backdrop" onClick={() => setModalBahanOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Package size={18} color="var(--color-primary)" />
                <span>{bahanDiubah ? `Ubah Bahan: ${bahanDiubah.nama_bahan}` : "Tambah Bahan Baku Baru"}</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalBahanOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSimpanBahan}>
              <div className="form-field-group">
                <label htmlFor="bahan-nama">Nama Bahan Baku</label>
                <input
                  id="bahan-nama"
                  placeholder="mis. Ayam Potong Broiler"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-field-group">
                  <label htmlFor="bahan-satuan">Satuan Takaran</label>
                  <select
                    id="bahan-satuan"
                    value={formSatuan}
                    onChange={(e) => setFormSatuan(e.target.value)}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gr">Gram (gr)</option>
                    <option value="liter">Liter (L)</option>
                    <option value="ml">Mililiter (ml)</option>
                    <option value="butir">Butir</option>
                    <option value="ikat">Ikat</option>
                    <option value="bungkus">Bungkus</option>
                    <option value="ekor">Ekor</option>
                    <option value="pack">Pack / Box</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label htmlFor="bahan-stok">Sisa Stok Sekarang</label>
                  <input
                    id="bahan-stok"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="mis. 15"
                    value={formStok}
                    onChange={(e) => setFormStok(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-field-group">
                  <label htmlFor="bahan-batas-min">Batas Minimum Peringatan</label>
                  <input
                    id="bahan-batas-min"
                    type="number"
                    step="any"
                    min="0.1"
                    placeholder="mis. 3"
                    value={formBatasMin}
                    onChange={(e) => setFormBatasMin(e.target.value)}
                    required
                  />
                  <span className="form-field-helper">
                    Peringatan status Kritis jika stok &le; nilai ini.
                  </span>
                </div>

                <div className="form-field-group">
                  <label htmlFor="bahan-harga">Estimasi Harga / Satuan (Rp)</label>
                  <input
                    id="bahan-harga"
                    type="number"
                    step="500"
                    min="0"
                    placeholder="mis. 38000"
                    value={formHargaSatuan}
                    onChange={(e) => setFormHargaSatuan(e.target.value)}
                  />
                  <span className="form-field-helper">
                    {formHargaSatuan && Number(formHargaSatuan) > 0
                      ? formatRupiah(Number(formHargaSatuan))
                      : "Opsional (untuk acuan belanja)"}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary-outline"
                  onClick={() => setModalBahanOpen(false)}
                  disabled={submittingBahan}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={submittingBahan}
                >
                  {submittingBahan ? "Menyimpan..." : bahanDiubah ? "Simpan Perubahan" : "+ Daftarkan Bahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Restock Cepat */}
      {modalRestockOpen && bahanRestock && (
        <div className="modal-backdrop" onClick={() => setModalRestockOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <RefreshCw size={18} color="var(--color-primary)" />
                <span>Restock: {bahanRestock.nama_bahan}</span>
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalRestockOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSimpanRestock}>
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 13,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Sisa Stok Sekarang:</span>
                <strong style={{ fontSize: 15, color: "var(--color-primary)" }}>
                  {bahanRestock.stok_saat_ini} {bahanRestock.satuan}
                </strong>
              </div>

              <div className="form-field-group">
                <label>Arah Pergerakan Stok</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${restockJenis === "masuk" ? "#10B981" : "var(--color-border)"}`,
                      background: restockJenis === "masuk" ? "#ECFDF5" : "#FFFFFF",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="jenis_mutasi"
                      checked={restockJenis === "masuk"}
                      onChange={() => setRestockJenis("masuk")}
                    />
                    <span>(+) Stok Masuk (Belanja)</span>
                  </label>

                  <label
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${restockJenis === "keluar" ? "#EF4444" : "var(--color-border)"}`,
                      background: restockJenis === "keluar" ? "#FEF2F2" : "#FFFFFF",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="jenis_mutasi"
                      checked={restockJenis === "keluar"}
                      onChange={() => setRestockJenis("keluar")}
                    />
                    <span>(-) Stok Keluar (Masak)</span>
                  </label>
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="restock-jumlah">
                  Jumlah {restockJenis === "masuk" ? "Penambahan" : "Pengurangan"} ({bahanRestock.satuan})
                </label>
                <input
                  id="restock-jumlah"
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder={`mis. 5 (${bahanRestock.satuan})`}
                  value={restockJumlah}
                  onChange={(e) => setRestockJumlah(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="restock-sumber">Keterangan / Sumber</label>
                <input
                  id="restock-sumber"
                  placeholder="mis. Belanja Pasar Kranji atau Masak Katering"
                  value={restockSumber}
                  onChange={(e) => setRestockSumber(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary-outline"
                  onClick={() => setModalRestockOpen(false)}
                  disabled={submittingRestock}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={submittingRestock}
                >
                  {submittingRestock ? "Memproses..." : "Konfirmasi Restock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
