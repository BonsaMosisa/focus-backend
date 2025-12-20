import express from "express";
const router = express.Router();
import { loginAdmin, getProfile } from "../controllers/adminController.js";
import { adminAuth } from "../middleware/adminAuth.js";

router.post("/login", loginAdmin);
router.get("/me", adminAuth, getProfile);

export default router;
