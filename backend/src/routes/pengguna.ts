// ============================================================================
// Router Pengguna & Autentikasi (KawanUsaha)
// File: backend/src/routes/pengguna.ts
// ============================================================================

import { Router } from "express";
import * as pengguna from "../controller/pengguna.js";
import { authMiddleware } from "../middleware/auth.js";

export const penggunaRouter = Router();

// Rute Publik (Autentikasi)
penggunaRouter.post("/register", pengguna.register);
penggunaRouter.post("/daftar", pengguna.register); // alias pendaftaran
penggunaRouter.post("/login", pengguna.login);

// Rute Terproteksi JWT
penggunaRouter.get("/profil", authMiddleware, pengguna.getProfile);
penggunaRouter.put("/profil", authMiddleware, pengguna.perbaruiProfil);
penggunaRouter.post("/reset-simulasi", authMiddleware, pengguna.resetSimulasi);
penggunaRouter.get("/", authMiddleware, pengguna.listPengguna);
penggunaRouter.delete("/:id", authMiddleware, pengguna.hapusPengguna);

// Router Alias untuk kompatibilitas rute lama (/api/auth/...)
export const authRouter = Router();
authRouter.post("/login", pengguna.login);
authRouter.post("/daftar", pengguna.register);
authRouter.post("/register", pengguna.register);

export default penggunaRouter;
