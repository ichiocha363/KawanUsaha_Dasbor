// ============================================================================
// Konfigurasi Navigasi Menu Admin KawanUsaha
// File: frontend/src/config/menu.ts
// ============================================================================

import {
  LayoutDashboard,
  Receipt,
  Package,
  UtensilsCrossed,
  Users,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  label: string;
  path: string;
  ikon: LucideIcon;
}

export const menuAdmin: MenuItem[] = [
  { label: "Beranda", path: "/admin", ikon: LayoutDashboard },
  { label: "Transaksi", path: "/admin/transaksi", ikon: Receipt },
  { label: "Inventaris Dapur", path: "/admin/inventaris", ikon: Package },
  { label: "Produk & Menu", path: "/admin/produk", ikon: UtensilsCrossed },
  { label: "Kelola Pengguna", path: "/admin/pengguna", ikon: Users },
  { label: "Pengaturan", path: "/admin/pengaturan", ikon: Settings },
];
