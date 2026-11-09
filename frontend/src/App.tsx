import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import HalamanLogin from "./pages/HalamanLogin";
import HalamanRegister from "./pages/HalamanRegister";
import LayoutAdmin from "./components/layout/LayoutAdmin";
import Beranda from "./pages/admin/Beranda";
import HalamanTransaksi from "./pages/admin/HalamanTransaksi";
import HalamanInventaris from "./pages/admin/HalamanInventaris";
import HalamanProduk from "./pages/admin/HalamanProduk";
import HalamanPengguna from "./pages/admin/HalamanPengguna";
import HalamanPengaturan from "./pages/admin/HalamanPengaturan";
import { penggunaAwal } from "./data/pengguna";
import type { Pengguna } from "./data/pengguna";
import { isLoggedIn, getStoredUser } from "./api/client";
import { logout } from "./api/pengguna";

export default function App() {
  const [pengguna, setPengguna] = useState<Pengguna[]>(penggunaAwal);
  const [penggunaAktif, setPenggunaAktif] = useState<any>(() => getStoredUser());

  function tambahPengguna(baru: Pengguna) {
    setPengguna([...pengguna, baru]);
  }

  function handleKeluar() {
    logout();
    setPenggunaAktif(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Awal: Redirect dinamis berdasarkan status sesi login */}
        <Route
          path="/"
          element={
            isLoggedIn() ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Rute Publik Autentikasi */}
        <Route
          path="/login"
          element={
            <HalamanLogin
              daftarPengguna={pengguna}
              onMasuk={setPenggunaAktif}
            />
          }
        />
        <Route
          path="/register"
          element={
            <HalamanRegister
              daftarPengguna={pengguna}
              onDaftar={tambahPengguna}
            />
          }
        />
        {/* Alias rute pendaftaran lama */}
        <Route path="/daftar" element={<Navigate to="/register" replace />} />

        {/* Rute Terproteksi Dasbor Admin */}
        <Route
          path="/admin"
          element={
            <LayoutAdmin
              pengguna={penggunaAktif}
              onKeluar={handleKeluar}
            />
          }
        >
          <Route index element={<Beranda daftarPengguna={pengguna} />} />
          <Route path="transaksi" element={<HalamanTransaksi />} />
          <Route path="inventaris" element={<HalamanInventaris />} />
          <Route path="produk" element={<HalamanProduk />} />
          <Route
            path="pengguna"
            element={<HalamanPengguna daftarPengguna={pengguna} />}
          />
          <Route path="pengaturan" element={<HalamanPengaturan />} />
        </Route>

        {/* Fallback Rute Tidak Ditemukan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
