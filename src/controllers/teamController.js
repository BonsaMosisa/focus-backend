import Team from "../Models/Team.js";

export const createTeam = async (req, res) => {
  try {
    const { name, meetingDay, meetingTime, teamLeaderName, members, notes } =
      req.body;
    const teamImage = req.file ? req.file.path : req.body.teamImage;
    if (!name)
      return res.status(400).json({ message: "Team name is required" });
    const team = await Team.create({
      name,
      meetingDay,
      meetingTime,
      teamImage,
      teamLeaderName,
      members,
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
    const update = { ...req.body };
    if (req.file) update.teamImage = req.file.path;
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
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params; // team id
    const { member } = req.body;
    if (!member) return res.status(400).json({ message: "Member is required" });
    const t = await Team.findById(id);
    if (!t) return res.status(404).json({ message: "Team not found" });
    t.members.push(member);
    await t.save();
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
