import { Akun, Admin, Kasir } from "../models/akun";
 
export type Peran = "admin" | "kasir";
 
export type Pengguna = {
  nama: string;
  email: string;
  password: string;
  peran: Peran;
};
 
export const penggunaAwal: Pengguna[] = [
  { nama: "Sari", email: "sari@kasirku.id", password: "password123", peran: "admin" },
  { nama: "Budi", email: "budi@kasirku.id", password: "password123", peran: "kasir" },
];
 
// Data biasa → objek class. Admin atau Kasir dipilih dari peran.
export function keAkun(p: Pengguna): Akun {
  return p.peran === "admin" ? new Admin(p.nama, p.email) : new Kasir(p.nama, p.email);
}