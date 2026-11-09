// ============================================================================
// Layout Admin Induk KawanUsaha (MatDash Layout Template)
// File: frontend/src/components/layout/LayoutAdmin.tsx
// ============================================================================

import { useState } from "react";
import { Navigate, Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { TOKEN_KEY, USER_KEY } from "../../api/client";
import type { Pengguna } from "../../models/akun";

interface Props {
  pengguna?: Pengguna | any | null;
  onKeluar?: () => void;
}

export default function LayoutAdmin({ pengguna, onKeluar }: Props) {
  const [sidebarTerbuka, setSidebarTerbuka] = useState(false);

  // Periksa autentikasi: apakah ada token tersimpan di localStorage atau state aktif
  const token = localStorage.getItem(TOKEN_KEY);
  let userAktif = pengguna;

  if (!userAktif) {
    try {
      const rawUser = localStorage.getItem(USER_KEY);
      if (rawUser) {
        userAktif = JSON.parse(rawUser);
      }
    } catch {
      // Abaikan jika parsing gagal
    }
  }

  // Proteksi rute: arahkan ke /login jika tidak memiliki token autentikasi
  if (!token && !userAktif) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin">
      {/* Sidebar Navigasi Tetap di Sisi Kiri */}
      <Sidebar
        terbuka={sidebarTerbuka}
        onTutup={() => setSidebarTerbuka(false)}
        onKeluar={onKeluar}
      />

      {/* Area Konten Utama KawanUsaha */}
      <div className="admin-utama">
        <Header
          nama={userAktif?.nama_lengkap || userAktif?.nama}
          peran={userAktif?.peran}
          namaUsaha={userAktif?.nama_usaha}
          kota={userAktif?.kota}
          onMenu={() => setSidebarTerbuka(!sidebarTerbuka)}
        />
        <main className="admin-konten">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
