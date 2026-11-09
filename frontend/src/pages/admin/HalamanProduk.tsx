// ============================================================================
// Halaman Manajemen Produk & Menu Kuliner (KawanUsaha)
// File: frontend/src/pages/admin/HalamanProduk.tsx
// ============================================================================

import { useEffect, useState, useMemo } from "react";
import type { Produk } from "../../models/produk";
import {
  getProdukApi,
  createProdukApi,
  ubahProduk,
  hapusProduk,
  toggleStatusProdukApi,
  type DataProduk,
} from "../../api/produk";
import FormProduk from "../../components/FormProduk";
import Toast from "../../components/Toast";
import {
  Plus,
  RefreshCw,
  UtensilsCrossed,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
} from "lucide-react";

type InfoToast = { teks: string; jenis: "sukses" | "gagal" };

export default function HalamanProduk() {
  const [daftarProduk, setDaftarProduk] = useState<Produk[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [produkDiubah, setProdukDiubah] = useState<Produk | null>(null);
  const [bukaForm, setBukaForm] = useState(false);
  const [toast, setToast] = useState<InfoToast | null>(null);

  // Filter & Search
  const [filterKategori, setFilterKategori] = useState<string>("semua");
  const [kataKunci, setKataKunci] = useState<string>("");

  function tampilkanToast(teks: string, jenis: "sukses" | "gagal") {
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

  async function muatProduk() {
    setMemuat(true);
    try {
      const data = await getProdukApi();
      setDaftarProduk(data || []);
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal memuat produk", "gagal");
    } finally {
      setMemuat(false);
    }
  }

  useEffect(() => {
    muatProduk();
  }, []);

  async function handleSimpan(data: DataProduk): Promise<boolean> {
    try {
      if (produkDiubah) {
        await ubahProduk(produkDiubah.id, data);
        tampilkanToast(`Menu "${data.nama}" berhasil diperbarui`, "sukses");
      } else {
        await createProdukApi(data);
        tampilkanToast(`Menu baru "${data.nama}" berhasil ditambahkan!`, "sukses");
      }
      setProdukDiubah(null);
      setBukaForm(false);
      await muatProduk();
      return true;
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal menyimpan menu", "gagal");
      return false;
    }
  }

  async function handleHapus(p: Produk) {
    const namaMenu = p.nama_produk || p.nama;
    if (!confirm(`Apakah Anda yakin ingin menghapus menu "${namaMenu}"?`)) return;
    try {
      await hapusProduk(p.id);
      tampilkanToast(`Menu "${namaMenu}" berhasil dihapus`, "sukses");
      await muatProduk();
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal menghapus menu", "gagal");
    }
  }

  async function handleToggleStatus(p: Produk) {
    const statusBaru = !p.status_aktif;
    try {
      await toggleStatusProdukApi(p.id, statusBaru);
      tampilkanToast(
        `Menu "${p.nama_produk || p.nama}" kini ${statusBaru ? "Tersedia" : "Ditandai Habis"}`,
        "sukses"
      );
      await muatProduk();
    } catch (error) {
      tampilkanToast((error as Error).message || "Gagal mengubah status menu", "gagal");
    }
  }

  // Filter daftar produk
  const produkTersaring = useMemo(() => {
    return daftarProduk.filter((item) => {
      const cocokKategori =
        filterKategori === "semua" || item.kategori.toLowerCase() === filterKategori.toLowerCase();
      const namaItem = (item.nama_produk || item.nama || "").toLowerCase();
      const cocokSearch = !kataKunci || namaItem.includes(kataKunci.toLowerCase());
      return cocokKategori && cocokSearch;
    });
  }, [daftarProduk, filterKategori, kataKunci]);

  // Statistik Kategori
  const countMakanan = useMemo(
    () => daftarProduk.filter((p) => p.kategori === "makanan").length,
    [daftarProduk]
  );
  const countMinuman = useMemo(
    () => daftarProduk.filter((p) => p.kategori === "minuman").length,
    [daftarProduk]
  );
  const countCamilan = useMemo(
    () => daftarProduk.filter((p) => p.kategori === "camilan").length,
    [daftarProduk]
  );

  return (
    <div className="beranda-container">
      {/* Toast Feedback */}
      {toast && <Toast teks={toast.teks} jenis={toast.jenis} />}

      {/* Header Halaman */}
      <div className="beranda-header">
        <div className="beranda-title-wrap">
          <h1>Daftar Menu & Produk Jualan</h1>
          <p className="beranda-subtitle">
            Atur harga jual, estimasi HPP, dan ketersediaan menu makanan & minuman warung.
          </p>
        </div>
        <div className="beranda-actions">
          <button
            type="button"
            className="btn-secondary-outline"
            onClick={muatProduk}
            title="Muat ulang menu"
          >
            <RefreshCw size={16} />
            Muat Ulang
          </button>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => {
              setProdukDiubah(null);
              setBukaForm(!bukaForm);
            }}
          >
            <Plus size={16} />
            {bukaForm ? "Tutup Form" : "+ Tambah Menu Baru"}
          </button>
        </div>
      </div>

      {/* Form Tambah / Ubah Produk */}
      {(bukaForm || produkDiubah) && (
        <FormProduk
          key={produkDiubah?.id ?? "baru"}
          produkDiubah={produkDiubah}
          onSimpan={handleSimpan}
          onBatal={() => {
            setProdukDiubah(null);
            setBukaForm(false);
          }}
        />
      )}

      {/* Filter Kategori & Pencarian */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div className="filter-tab-row">
          <button
            type="button"
            className={`filter-tab-btn ${filterKategori === "semua" ? "active" : ""}`}
            onClick={() => setFilterKategori("semua")}
          >
            Semua ({daftarProduk.length})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filterKategori === "makanan" ? "active" : ""}`}
            onClick={() => setFilterKategori("makanan")}
          >
            Makanan ({countMakanan})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filterKategori === "minuman" ? "active" : ""}`}
            onClick={() => setFilterKategori("minuman")}
          >
            Minuman ({countMinuman})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${filterKategori === "camilan" ? "active" : ""}`}
            onClick={() => setFilterKategori("camilan")}
          >
            Camilan / Snack ({countCamilan})
          </button>
        </div>

        {/* Kotak Pencarian */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#FFFFFF",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "6px 12px",
            width: 240,
          }}
        >
          <Search size={15} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Cari nama menu..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: 13,
              width: "100%",
              background: "transparent",
            }}
          />
        </div>
      </div>

      {/* Tabel Produk */}
      <div className="tabel-wrap">
        <table className="tabel">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Nama Menu</th>
              <th style={{ width: "12%" }}>Kategori</th>
              <th style={{ width: "15%" }}>Harga Jual</th>
              <th style={{ width: "15%" }}>Estimasi HPP</th>
              <th style={{ width: "15%" }}>Estimasi Margin</th>
              <th style={{ width: "13%" }}>Ketersediaan</th>
              <th style={{ width: "10%", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {memuat ? (
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
                    <span>Memuat daftar menu kuliner...</span>
                  </div>
                </td>
              </tr>
            ) : produkTersaring.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="transaksi-empty-state">
                    <div className="transaksi-empty-icon">
                      <UtensilsCrossed size={24} />
                    </div>
                    <strong style={{ color: "var(--color-text-main)" }}>
                      Belum Ada Menu yang Sesuai
                    </strong>
                    <p style={{ margin: 0, fontSize: 13, maxWidth: 360 }}>
                      {kataKunci
                        ? `Tidak ada menu kuliner yang cocok dengan kata kunci "${kataKunci}".`
                        : "Klik tombol '+ Tambah Menu Baru' di atas untuk mendaftarkan menu kuliner warung Anda."}
                    </p>
                    {!bukaForm && (
                      <button
                        type="button"
                        className="btn-primary-action"
                        onClick={() => setBukaForm(true)}
                        style={{ marginTop: 8 }}
                      >
                        <Plus size={15} />
                        + Tambah Menu Pertama
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              produkTersaring.map((p) => {
                const hargaJual = Number(p.harga_jual ?? p.harga ?? 0);
                const hpp = Number(p.estimasi_hpp ?? Math.round(hargaJual * 0.6));
                const marginRp = hargaJual - hpp;
                const marginPct = hargaJual > 0 ? Math.round((marginRp / hargaJual) * 100) : 0;
                const namaMenu = p.nama_produk || p.nama || "Menu";

                const badgeKategoriClass =
                  p.kategori === "makanan"
                    ? "badge-makanan"
                    : p.kategori === "minuman"
                    ? "badge-minuman"
                    : "badge-camilan";

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "var(--color-text-main)", fontSize: 14 }}>
                          {namaMenu}
                        </strong>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                          ID: #{p.id}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={badgeKategoriClass}>
                        {p.kategori.charAt(0).toUpperCase() + p.kategori.slice(1)}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--color-text-main)", fontSize: 13 }}>
                        {formatRupiah(hargaJual)}
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                        {formatRupiah(hpp)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "#059669", fontWeight: 600, fontSize: 13 }}>
                          +{formatRupiah(marginRp)}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                          ({marginPct}%)
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn-status-toggle ${p.status_aktif ? "aktif" : "nonaktif"}`}
                        onClick={() => handleToggleStatus(p)}
                        title="Klik untuk mengubah ketersediaan menu"
                      >
                        {p.status_aktif ? (
                          <>
                            <CheckCircle size={14} color="#059669" />
                            <span>Tersedia</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} color="#DC2626" />
                            <span>Habis</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="aksi" style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn-secondary-outline"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          onClick={() => {
                            setBukaForm(false);
                            setProdukDiubah(p);
                          }}
                          title="Ubah data menu"
                        >
                          <Edit2 size={13} />
                          Ubah
                        </button>
                        <button
                          type="button"
                          className="btn-hapus"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          onClick={() => handleHapus(p)}
                          title="Hapus menu kuliner"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
