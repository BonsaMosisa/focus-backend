import fs from "fs";
import Announcement from "../Models/Announcement.js";
import cloudinary from "../config/cloudinary.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    let image = req.body.image;
    let publicId = undefined;

    if (req.file && req.file.path) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "announcements",
      });
      image = result.secure_url;
      publicId = result.public_id;

      // remove local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn("Failed to remove temp file:", err.message);
      });
    }

    const announcement = await Announcement.create({
      title,
      description,
      image,
      publicId,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const list = await Announcement.find().sort({ publishedAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    // handle new uploaded file
    if (req.file && req.file.path) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "announcements",
      });
      update.image = result.secure_url;
      update.publicId = result.public_id;

      // remove local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn("Failed to remove temp file:", err.message);
      });

      // remove previous cloudinary image if existed
      const existing = await Announcement.findById(id).select("publicId");
      if (existing && existing.publicId) {
        try {
          await cloudinary.uploader.destroy(existing.publicId);
        } catch (e) {
          console.warn("Failed to remove previous Cloudinary image:", e.message);
        }
      }
    }

    const a = await Announcement.findByIdAndUpdate(id, update, { new: true });
    if (!a) return res.status(404).json({ message: "Announcement not found" });
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const a = await Announcement.findByIdAndDelete(id);
    if (!a) return res.status(404).json({ message: "Announcement not found" });

    if (a.publicId) {
      try {
        await cloudinary.uploader.destroy(a.publicId);
      } catch (e) {
        console.warn("Failed to remove Cloudinary image:", e.message);
      }
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
