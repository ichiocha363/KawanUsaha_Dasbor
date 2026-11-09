# design.md — Desain Antarmuka Dasbor KawanUsaha

Dokumen acuan desain ini menyelaraskan prinsip tata letak modern template **MatDash** (sidebar collapsible, clean cards, table action buttons, top bar utilities) dengan identitas brand **KawanUsaha** (Warm Cream, Deep Teal, dan Accent Orange).

---

## 1. Design Tokens & Theme Variables

Didefinisikan dalam variabel global CSS (`styles/admin.css` atau Tailwind extend):

```css
:root {
  /* Brand Foundation */
  --warna-utama: #1F7A6D;        /* Deep Teal (Brand Header, Active Menu, Primary Button) */
  --warna-utama-hover: #175E54;  /* Deep Teal Darker */
  --warna-utama-tint: #EBF5F3;   /* Soft Teal Tint (Active Item Background) */

  --warna-aksen: #F29A4B;        /* Warm Orange (CTA, Premium Badges) */
  --warna-aksen-hover: #DD8638;  /* Orange Darker */

  /* Neutral & Canvas */
  --warna-latar: #FAF7EE;        /* Cream Canvas Background */
  --warna-permukaan: #FFFFFF;    /* Pure White Surface (Cards, Nav, Modal) */
  --warna-kartu-soft: #FFFDF9;   /* Off-White Card Soft */
  --warna-garis: #E8E2D5;        /* Soft Divider & Border */

  /* Typography Colors */
  --warna-teks: #1E293B;         /* Slate Dark (Main Heading, Important Data) */
  --warna-teks-sekunder: #64748B;/* Slate Gray (Subtitles, Field Labels) */

  /* Status Tokens */
  --status-aman-bg: #ECFDF5;
  --status-aman-border: #A7F3D0;
  --status-aman-text: #047857;

  --status-menipis-bg: #FFFBEB;
  --status-menipis-border: #FDE68A;
  --status-menipis-text: #B45309;

  --status-kritis-bg: #FEF2F2;
  --status-kritis-border: #FECACA;
  --status-kritis-text: #B91C1C;

  /* Sizing & Geometry */
  --font-judul: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-isi: 'Inter', system-ui, sans-serif;
  --jarak: 16px;
  --sudut-kartu: 14px;
  --sudut-tombol: 8px;
  --bayangan-kartu: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
}
```

---

## 2. Karakteristik Layout (Adopsi MatDash UI)

### 2.1 Navigasi Kiri (Sidebar)
- Lebar standar desktop: `260px` dengan border kanan halus `1px solid var(--warna-garis)`.
- Header: Logo icon kanopi / inisial [K] Teal + teks **KawanUsaha** (SemiBold 18px) + subjudul *"Asisten Kuliner UMKM"*.
- Menu Navigasi:
  - **Beranda** (`LayoutDashboard`)
  - **Inventaris Dapur** (`Package`)
  - **Produk & Menu** (`UtensilsCrossed`)
  - **Transaksi Kasir** (`Receipt`)
  - **Manajemen Pengguna** (`Users`)
- Active State: Background `var(--warna-utama-tint)` dengan teks tebal `var(--warna-utama)` dan strip penanda vertikal 3px di sisi kiri.
- Footer Sidebar: Label status `"Prototype Pelatihan • Data Simulasi"` dan tombol outline merah `"Keluar (Logout)"`.

### 2.2 Global Top Bar
- Tinggi: `64px` dengan background putih bersih.
- Komponen:
  - Tombol toggle sidebar (hamburger icon) untuk layar mobile & tablet.
  - Search bar global placeholder: *"Cari menu, transaksi, bahan..."*.
  - Indikator lonceng notifikasi (memiliki dot merah jika ada bahan berstatus Kritis).
  - Profil User kanan: Avatar inisial ("WM"), Nama Usaha ("Warung Mitra"), badge oranye pill ("Mitra Premium - Bekasi").

### 2.3 Main Content Workspace
- Background: `var(--warna-latar)` (`#FAF7EE`).
- Padding konten: `24px` di desktop, `16px` di perangkat bergerak.
- Grid Responsif:
  - 3 Kolom Metrik Utama di desktop $\rightarrow$ 1 kolom tumpuk di layar HP.
  - 2 Kolom Komparasi (Grafik/Menu Terlaris di kiri, Status Dapur di kanan) dengan rasio 60:40.

---

## 3. Komponen Form & Data Table

### 3.1 Input & Form Controls
- Tinggi kontrol: `42px` (desktop) / `44px` (touchscreen mobile).
- Border: `1px solid var(--warna-garis)`, dengan focus state `outline: none; border-color: var(--warna-utama); box-shadow: 0 0 0 3px rgba(31, 122, 109, 0.15)`.

### 3.2 Data Tables
- Header tabel: Abu-abu muda dengan huruf kapital kecil (`text-xs uppercase tracking-wider`).
- Baris tabel: Hover effect `background-color: #FAF9F5`.
- Badge Status: Pill rounded penuh (`px-2.5 py-1 text-xs font-semibold`) dengan warna kontras standar WCAG AA (misal: Kritis teks `#B91C1C` di atas latar `#FEF2F2`).