import fs from "fs";
import Teaching from "../Models/Teaching.js";
import cloudinary from "../config/cloudinary.js";

export const uploadTeaching = async (req, res) => {
  try {
    const { title, verses, description, teacher, otherNotes } = req.body;
    let mediaUrl = req.body.mediaUrl;
    let publicId = undefined;

    if (req.file && req.file.path) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "teachings",
      });
      mediaUrl = result.secure_url;
      publicId = result.public_id;

      // remove local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn("Failed to remove temp file:", err.message);
      });
    }
    if (!title) return res.status(400).json({ message: "Title is required" });
    const t = await Teaching.create({
      title,
      verses,
      description,
      teacher,
      otherNotes,
      mediaUrl,
      publicId,
    });
    res.status(201).json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeachings = async (req, res) => {
  try {
    const list = await Teaching.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTeaching = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    if (req.file && req.file.path) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "teachings",
      });
      update.mediaUrl = result.secure_url;
      update.publicId = result.public_id;

      // remove local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn("Failed to remove temp file:", err.message);
      });

      // remove previous cloudinary media if existed
      const existing = await Teaching.findById(id).select("publicId");
      if (existing && existing.publicId) {
        try {
          await cloudinary.uploader.destroy(existing.publicId);
        } catch (e) {
          console.warn("Failed to remove previous Cloudinary media:", e.message);
        }
      }
    }

    const t = await Teaching.findByIdAndUpdate(id, update, { new: true });
    if (!t) return res.status(404).json({ message: "Not found" });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTeaching = async (req, res) => {
  try {
    const { id } = req.params;
    const t = await Teaching.findByIdAndDelete(id);
    if (!t) return res.status(404).json({ message: "Not found" });

    if (t.publicId) {
      try {
        await cloudinary.uploader.destroy(t.publicId);
      } catch (e) {
        console.warn("Failed to remove Cloudinary media:", e.message);
      }
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
