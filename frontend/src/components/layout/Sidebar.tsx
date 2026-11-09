// ============================================================================
// Komponen Sidebar Navigasi KawanUsaha (MatDash Layout)
// File: frontend/src/components/layout/Sidebar.tsx
// ============================================================================

import { NavLink, useNavigate } from "react-router";
import { LogOut, Store } from "lucide-react";
import { menuAdmin } from "../../config/menu";
import { logout } from "../../api/pengguna";

interface Props {
  terbuka: boolean;
  onTutup: () => void;
  onKeluar?: () => void;
}

export default function Sidebar({ terbuka, onTutup, onKeluar }: Props) {
  const navigate = useNavigate();

  function handleKeluar() {
    logout();
    if (onKeluar) onKeluar();
    navigate("/login");
  }

  return (
    <>
      <aside className={`sidebar ${terbuka ? "terbuka" : ""}`}>
        {/* Header Branding KawanUsaha */}
        <div className="sidebar-brand-container">
          <div className="sidebar-logo-icon">
            <Store size={22} />
          </div>
          <div className="sidebar-brand-info">
            <span className="sidebar-brand-title">KawanUsaha</span>
            <span className="sidebar-brand-subtitle">Asisten Kuliner UMKM</span>
          </div>
        </div>

        {/* Menu Navigasi Dinamis */}
        <nav className="sidebar-menu">
          {menuAdmin.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              end={menu.path === "/admin"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={onTutup}
            >
              <menu.ikon size={18} />
              <span>{menu.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bagian Bawah Sidebar */}
        <div className="sidebar-footer">
          <div className="sidebar-tenancy-badge">
            🔒 Sistem Multi-Tenancy<br />Terisolasi Akun
          </div>
          <button
            type="button"
            className="sidebar-keluar"
            onClick={handleKeluar}
            title="Keluar dari sesi akun"
          >
            <LogOut size={16} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Latar Belakang Overlay untuk Mobile Drawer */}
      {terbuka && <div className="sidebar-latar" onClick={onTutup} />}
    </>
  );
}
