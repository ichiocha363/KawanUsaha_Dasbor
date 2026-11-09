// ============================================================================
// Komponen Formulir Input & Edit Menu Kuliner (KawanUsaha)
// File: frontend/src/components/FormProduk.tsx
// ============================================================================

import React, { useState, useEffect } from "react";
import type { DataProduk } from "../api/produk";
import type { Produk } from "../models/produk";
import { AlertCircle, CheckCircle2, TrendingUp, X } from "lucide-react";

type Props = {
  produkDiubah: Produk | null;
  onSimpan: (data: DataProduk) => Promise<boolean>;
  onBatal: () => void;
};

export default function FormProduk({ produkDiubah, onSimpan, onBatal }: Props) {
  const [nama, setNama] = useState(
    produkDiubah?.nama_produk || produkDiubah?.nama || ""
  );
  const [kategori, setKategori] = useState(produkDiubah?.kategori || "makanan");
  const [harga, setHarga] = useState(
    produkDiubah ? String(produkDiubah.harga_jual ?? produkDiubah.harga) : ""
  );
  const [hpp, setHpp] = useState(
    produkDiubah
      ? String(produkDiubah.estimasi_hpp)
      : ""
  );
  const [statusAktif, setStatusAktif] = useState<boolean>(
    produkDiubah?.status_aktif ?? true
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Otomatis isi estimasi HPP (60% default) saat harga jual diisi jika HPP belum diisi
  useEffect(() => {
    if (!produkDiubah && harga && Number(harga) > 0 && (!hpp || hpp === "0")) {
      const perkiraanHpp = Math.round(Number(harga) * 0.6);
      setHpp(String(perkiraanHpp));
    }
  }, [harga, produkDiubah, hpp]);

  // Perhitungan margin keuntungan
  const nominalHarga = Number(harga) || 0;
  const nominalHpp = Number(hpp) || 0;
  const estimasiLaba = nominalHarga - nominalHpp;
  const persentaseMargin =
    nominalHarga > 0
      ? Math.round((estimasiLaba / nominalHarga) * 100)
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const namaBersih = nama.trim();
    if (!namaBersih) {
      setError("Nama menu produk kuliner wajib diisi.");
      return;
    }

    if (nominalHarga <= 0) {
      setError("Harga jual harus berupa angka lebih dari Rp 0.");
      return;
    }

    if (nominalHpp <= 0) {
      setError("Estimasi modal (HPP) harus lebih dari Rp 0.");
      return;
    }

    if (nominalHpp >= nominalHarga) {
      setError("Estimasi modal (HPP) tidak boleh sama atau lebih tinggi dari harga jual.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const berhasil = await onSimpan({
        nama: namaBersih,
        nama_produk: namaBersih,
        kategori,
        harga: nominalHarga,
        harga_jual: nominalHarga,
        estimasi_hpp: nominalHpp,
        status_aktif: statusAktif,
        stok: statusAktif ? 10 : 0,
      });

      if (berhasil && !produkDiubah) {
        setNama("");
        setHarga("");
        setHpp("");
        setKategori("makanan");
        setStatusAktif(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function formatRupiah(num: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  }

  return (
    <div className="transaksi-card" style={{ marginBottom: 24 }}>
      <div className="transaksi-card-header">
        <div className="transaksi-card-title">
          <TrendingUp size={18} color="var(--color-primary)" />
          <span>
            {produkDiubah ? `Ubah Menu: ${produkDiubah.nama_produk || produkDiubah.nama}` : "Tambah Menu Kuliner Baru"}
          </span>
        </div>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onBatal}
          title="Tutup formulir"
        >
          <X size={18} />
        </button>
      </div>

      {error && (
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
            marginBottom: 16,
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-field-group">
            <label htmlFor="produk-nama">Nama Menu Kuliner</label>
            <input
              id="produk-nama"
              placeholder="mis. Nasi Goreng Spesial Babat"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group">
            <label htmlFor="produk-kategori">Kategori Menu</label>
            <select
              id="produk-kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            >
              <option value="makanan">Makanan Utama</option>
              <option value="minuman">Minuman Segar</option>
              <option value="camilan">Camilan / Snack</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-field-group">
            <label htmlFor="produk-harga">Harga Jual Konsumen (Rp)</label>
            <input
              id="produk-harga"
              type="number"
              min="500"
              step="500"
              placeholder="mis. 25000"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              required
            />
            <span className="form-field-helper">
              {nominalHarga > 0 ? `Harga: ${formatRupiah(nominalHarga)}` : "Harga jual yang dibayar pelanggan."}
            </span>
          </div>

          <div className="form-field-group">
            <label htmlFor="produk-hpp">Estimasi Modal / HPP (Rp)</label>
            <input
              id="produk-hpp"
              type="number"
              min="0"
              step="500"
              placeholder="mis. 15000"
              value={hpp}
              onChange={(e) => setHpp(e.target.value)}
              required
            />
            <span className="form-field-helper">
              {nominalHpp > 0 ? `Modal: ${formatRupiah(nominalHpp)}` : "Biaya bahan per porsi sajian."}
            </span>
          </div>
        </div>

        {/* Kalkulasi Margin Keuntungan Real-Time */}
        {nominalHarga > 0 && nominalHpp > 0 && (
          <div
            style={{
              background: nominalHpp < nominalHarga ? "#ECFDF5" : "#FEF2F2",
              border: `1px solid ${nominalHpp < nominalHarga ? "#A7F3D0" : "#FECACA"}`,
              borderRadius: 8,
              padding: "10px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} color={nominalHpp < nominalHarga ? "#059669" : "#DC2626"} />
              <span>
                Estimasi Untung Bersih: <strong>{formatRupiah(estimasiLaba)}</strong> per porsi
              </span>
            </div>
            <span
              style={{
                fontWeight: 700,
                color: nominalHpp < nominalHarga ? "#047857" : "#B91C1C",
              }}
            >
              Margin: {persentaseMargin}%
            </span>
          </div>
        )}

        {/* Status Ketersediaan */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 14px 0" }}>
          <label
            htmlFor="produk-status-aktif"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <input
              id="produk-status-aktif"
              type="checkbox"
              checked={statusAktif}
              onChange={(e) => setStatusAktif(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <span>Status Menu: {statusAktif ? "Tersedia untuk Pelanggan" : "Habis / Tidak Dijual"}</span>
          </label>
        </div>

        <div className="modal-actions" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="btn-secondary-outline"
            onClick={onBatal}
            disabled={submitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn-primary-action"
            disabled={submitting}
          >
            {submitting ? "Menyimpan Menu..." : produkDiubah ? "Simpan Perubahan" : "+ Tambah Menu"}
          </button>
        </div>
      </form>
    </div>
  );
}
