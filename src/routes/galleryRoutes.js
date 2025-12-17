import express from "express";
const router = express.Router();
import {
  uploadImage,
  getGallery,
  deleteImage,
} from "../controllers/galleryController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

router.post("/", adminAuth, upload.single("image"), uploadImage);
router.get("/", getGallery);
router.delete("/:id", adminAuth, deleteImage);

export default router;
