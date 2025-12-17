import Gallery from "../Models/Gallery.js";

export const uploadImage = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    if (!imageUrl)
      return res.status(400).json({ message: "Image is required" });
    const item = await Gallery.create({ imageUrl, caption: req.body.caption });
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
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
