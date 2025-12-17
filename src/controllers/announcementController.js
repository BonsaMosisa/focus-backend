import Announcement from "../Models/Announcement.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const announcement = await Announcement.create({
      title,
      description,
      image,
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
    if (req.file) update.image = req.file.path;
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
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
