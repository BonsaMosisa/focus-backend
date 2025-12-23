import express from "express";
const router = express.Router();
import {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
  addMember,
} from "../controllers/teamController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

router.post("/", adminAuth, upload.any(), createTeam);
router.get("/", getTeams);
router.put("/:id", adminAuth, upload.any(), updateTeam);
router.delete("/:id", adminAuth, deleteTeam);
router.post("/:id/members", adminAuth, addMember);

export default router;
