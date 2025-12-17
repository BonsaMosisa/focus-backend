import express from "express";
const router = express.Router();
import {
  loginAdmin,
  getProfile,
  createAdmin,
  listAdmins,
  disableAdmin,
  enableAdmin,
  deleteAdmin,
} from "../controllers/adminController.js";
import { adminAuth, requireSuperAdmin } from "../middleware/adminAuth.js";

router.post("/login", loginAdmin);
router.get("/me", adminAuth, getProfile);

// Super-admin-only admin management
router.post("/create", adminAuth, requireSuperAdmin, createAdmin);
router.get("/", adminAuth, requireSuperAdmin, listAdmins);
router.put("/:id/disable", adminAuth, requireSuperAdmin, disableAdmin);
router.put("/:id/enable", adminAuth, requireSuperAdmin, enableAdmin);
router.delete("/:id", adminAuth, requireSuperAdmin, deleteAdmin);

export default router;
