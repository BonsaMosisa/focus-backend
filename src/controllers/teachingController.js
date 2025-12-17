import Teaching from "../Models/Teaching.js";

export const uploadTeaching = async (req, res) => {
  try {
    const { title, verses, description, teacher, otherNotes } = req.body;
    const mediaUrl = req.file ? req.file.path : req.body.mediaUrl;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const t = await Teaching.create({
      title,
      verses,
      description,
      teacher,
      otherNotes,
      mediaUrl,
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
    if (req.file) update.mediaUrl = req.file.path;
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
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
