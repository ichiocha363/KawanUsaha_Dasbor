// ============================================================================
// Komponen Header Global Top Bar (MatDash UI Pattern)
// File: frontend/src/components/layout/Header.tsx
// ============================================================================

import { useEffect, useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { USER_KEY } from "../../api/client";
import type { Pengguna } from "../../models/akun";

interface Props {
  nama?: string;
  peran?: string;
  namaUsaha?: string;
  kota?: string;
  onMenu: () => void;
}

export default function Header({
  nama,
  peran,
  namaUsaha,
  kota,
  onMenu,
}: Props) {
  const [userState, setUserState] = useState<Partial<Pengguna> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        setUserState(JSON.parse(raw));
      }
    } catch {
      // Abaikan jika parsing gagal
    }
  }, []);

  const tampilNamaUsaha =
    namaUsaha || userState?.nama_usaha || "Warung Mitra";
  const tampilKota = kota || userState?.kota || "Bekasi";
  const tampilPeran = peran || userState?.peran || "admin";

  // Ambil 2 huruf inisial dari nama usaha
  const inisial =
    tampilNamaUsaha
      .split(" ")
      .map((k) => k[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "WM";

  return (
    <header className="header">
      {/* Sisi Kiri: Tombol Hamburger & Input Pencarian Global */}
      <div className="header-left">
        <button
          type="button"
          className="header-menu-btn"
          onClick={onMenu}
          aria-label="Buka navigasi menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-search-wrap">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Cari bahan, transaksi, menu..."
          />
        </div>
      </div>

      {/* Sisi Kanan: Lonceng Notifikasi & Widget Profil Mitra */}
      <div className="header-right">
        {/* Notifikasi Lonceng */}
        <button
          type="button"
          className="header-notif-btn"
          title="Pemberitahuan stok kritis & transaksi"
          aria-label="Notifikasi"
        >
          <Bell size={18} />
          <span className="notif-badge-dot" />
        </button>

        {/* Profil Ringkas Mitra */}
        <div className="header-profile-widget">
          <div className="avatar-circle" title={nama || userState?.nama_lengkap || "Mitra"}>
            {inisial}
          </div>
          <div className="profile-meta">
            <span className="profile-business-name">{tampilNamaUsaha}</span>
            <span className="profile-city-badge">
              {tampilPeran === "admin" ? "Mitra Premium" : "Kasir"} • {tampilKota}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
