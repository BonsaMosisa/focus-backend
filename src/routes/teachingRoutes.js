import express from "express";
const router = express.Router();
import {
  uploadTeaching,
  getTeachings,
  updateTeaching,
  deleteTeaching,
} from "../controllers/teachingController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

router.post("/", adminAuth, upload.single("media"), uploadTeaching);
router.get("/", getTeachings);
router.put("/:id", adminAuth, upload.single("media"), updateTeaching);
router.delete("/:id", adminAuth, deleteTeaching);

export default router;
