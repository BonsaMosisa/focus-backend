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
	forgotPassword,
	resetPassword,
	getAdminById,
	updateAdmin,
} from "../controllers/adminController.js";
import { adminAuth } from "../middleware/adminAuth.js";

router.post("/login", loginAdmin);
router.get("/me", adminAuth, getProfile);

// Registration (create admin)
router.post("/register", createAdmin);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Admin CRUD (protected)
router.get("/", adminAuth, listAdmins);
router.get("/:id", adminAuth, getAdminById);
router.put("/:id", adminAuth, updateAdmin);
router.delete("/:id", adminAuth, deleteAdmin);
router.put("/:id/disable", adminAuth, disableAdmin);
router.put("/:id/enable", adminAuth, enableAdmin);

export default router;
