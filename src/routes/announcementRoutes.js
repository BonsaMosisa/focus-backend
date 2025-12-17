import express from "express";
const router = express.Router();
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

router.post("/", adminAuth, upload.single("image"), createAnnouncement);
router.get("/", getAnnouncements);
router.put("/:id", adminAuth, upload.single("image"), updateAnnouncement);
router.delete("/:id", adminAuth, deleteAnnouncement);

export default router;
