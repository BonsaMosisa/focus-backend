import fs from "fs";
import Team from "../Models/Team.js";
import cloudinary from "../config/cloudinary.js";

const tryParse = (val) => {
  if (!val) return undefined;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  }
  return val;
};

const normalizePerson = (m) => {
  if (!m) return undefined;
  if (typeof m === "string") return { name: m };
  return {
    name: m.name || "",
    phone: m.phone || m.phone1 || "",
  };
};

export const createTeam = async (req, res) => {
  try {
    const raw = req.body || {};
    const name = raw.name;
    const meetingDay = raw.meetingDay;
    const meetingTime = raw.meetingTime;
    const notes = raw.notes;
    let teamImage = req.file ? req.file.path : raw.teamImage;

    if (!name)
      return res.status(400).json({ message: "Team name is required" });

    // teamLeader can arrive as object or legacy teamLeaderName + phone fields
    let teamLeader = tryParse(raw.teamLeader);
    if (!teamLeader && raw.teamLeaderName) {
      teamLeader = {
        name: raw.teamLeaderName,
        phone: raw.teamLeaderPhone1 || raw.teamLeaderPhone || "",
      };
    }
    // members are no longer stored; any member detail should be placed in `notes`

    let publicId = undefined;
    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "teams",
        });
        if (!result || !result.public_id || !result.secure_url) {
          throw new Error("Cloudinary returned an invalid response");
        }
        teamImage = result.secure_url;
        publicId = result.public_id;
      } catch (e) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.warn("Failed to remove temp file:", err.message);
        });
        return res.status(500).json({ message: "Image upload failed", error: e.message });
      }
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn("Failed to remove temp file:", err.message);
      });
    }

    const team = await Team.create({
      name,
      meetingDay,
      meetingTime,
      teamImage,
      publicId,
      teamLeader,
      notes,
    });
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const raw = req.body || {};
    const update = {};
    if (raw.name) update.name = raw.name;
    if (raw.meetingDay) update.meetingDay = raw.meetingDay;
    if (raw.meetingTime) update.meetingTime = raw.meetingTime;
    if (raw.notes) update.notes = raw.notes;
    if (req.file && req.file.path) {
      let result;
      try {
        result = await cloudinary.uploader.upload(req.file.path, {
          folder: "teams",
        });
        if (!result || !result.public_id || !result.secure_url) {
          throw new Error("Cloudinary returned an invalid response");
        }
        update.teamImage = result.secure_url;
        update.publicId = result.public_id;
      } catch (e) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.warn("Failed to remove temp file:", err.message);
        });
        return res.status(500).json({ message: "Image upload failed", error: e.message });
      }
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn("Failed to remove temp file:", err.message);
      });

      const existing = await Team.findById(id).select("publicId");
      if (existing && existing.publicId) {
        try {
          await cloudinary.uploader.destroy(existing.publicId);
        } catch (e) {
          console.warn("Failed to remove previous Cloudinary image:", e.message);
        }
      }
    }

    if (raw.teamLeader) {
      const parsedLeader = tryParse(raw.teamLeader);
      update.teamLeader = normalizePerson(parsedLeader);
    } else if (raw.teamLeaderName) {
      update.teamLeader = {
        name: raw.teamLeaderName,
        phone: raw.teamLeaderPhone1 || raw.teamLeaderPhone || "",
      };
    }

    const t = await Team.findByIdAndUpdate(id, update, { new: true });
    if (!t) return res.status(404).json({ message: "Team not found" });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const t = await Team.findByIdAndDelete(id);
    if (!t) return res.status(404).json({ message: "Team not found" });
    if (t.publicId) {
      try {
        await cloudinary.uploader.destroy(t.publicId);
      } catch (e) {
        console.warn("Failed to remove Cloudinary image:", e.message);
      }
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params; // team id
    let member = req.body.member || req.body;
    member = tryParse(member) || member;
    if (!member || (typeof member === "object" && !member.name)) {
      return res.status(400).json({ message: "Member name is required" });
    }
    const t = await Team.findById(id);
    if (!t) return res.status(404).json({ message: "Team not found" });
    // Members are stored in notes now. Append a line for the added member.
    const entry = `Member: ${member.name}${member.phone ? ` (${member.phone})` : ""}`;
    t.notes = t.notes && t.notes.length ? `${t.notes}\n${entry}` : entry;
    await t.save();
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
