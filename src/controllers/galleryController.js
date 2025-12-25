import fs from "fs";
import Gallery from "../Models/Gallery.js";
import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;
    let publicId = undefined;

    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "focusgallery",
        });
        if (!result || !result.public_id || !result.secure_url) {
          throw new Error("Cloudinary returned an invalid response");
        }
        imageUrl = result.secure_url;
        publicId = result.public_id;
      } catch (e) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.warn("Failed to remove temp file:", err.message);
        });
        return res.status(500).json({ message: "Image upload failed", error: e.message });
      }
      // remove local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn("Failed to remove temp file:", err.message);
      });
    }

    if (!imageUrl)
      return res.status(400).json({ message: "Image is required" });

    const item = await Gallery.create({ imageUrl, publicId, caption: req.body.caption });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGallery = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ uploadedAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Gallery.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: "Not found" });

    if (item.publicId) {
      try {
        await cloudinary.uploader.destroy(item.publicId);
      } catch (e) {
        console.warn("Failed to remove Cloudinary image:", e.message);
      }
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
