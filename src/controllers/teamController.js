import Team from "../Models/Team.js";

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

const normalizeMember = (m) => {
  if (!m) return undefined;
  if (typeof m === "string") return { name: m };
  return {
    name: m.name || "",
    phone1: m.phone1 || m.phone || "",
    phone2: m.phone2 || "",
    phone3: m.phone3 || "",
  };
};

export const createTeam = async (req, res) => {
  try {
    const raw = req.body || {};
    const name = raw.name;
    const meetingDay = raw.meetingDay;
    const meetingTime = raw.meetingTime;
    const notes = raw.notes;
    const teamImage = req.file ? req.file.path : raw.teamImage;

    if (!name)
      return res.status(400).json({ message: "Team name is required" });

    // teamLeader can arrive as object or legacy teamLeaderName + phone fields
    let teamLeader = tryParse(raw.teamLeader);
    if (!teamLeader && raw.teamLeaderName) {
      teamLeader = {
        name: raw.teamLeaderName,
        phone1: raw.teamLeaderPhone1 || "",
        phone2: raw.teamLeaderPhone2 || "",
        phone3: raw.teamLeaderPhone3 || "",
      };
    }

    // members can be an array of objects, array of names, or JSON string
    let members = tryParse(raw.members) || [];
    if (!Array.isArray(members) && typeof members === "string" && members.length) {
      // attempt comma split fallback
      members = members.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(members)) members = [];
    members = members.map(normalizeMember).filter(Boolean);

    const team = await Team.create({
      name,
      meetingDay,
      meetingTime,
      teamImage,
      teamLeader,
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
    const raw = req.body || {};
    const update = {};
    if (raw.name) update.name = raw.name;
    if (raw.meetingDay) update.meetingDay = raw.meetingDay;
    if (raw.meetingTime) update.meetingTime = raw.meetingTime;
    if (raw.notes) update.notes = raw.notes;
    if (req.file) update.teamImage = req.file.path;

    if (raw.teamLeader) {
      const parsedLeader = tryParse(raw.teamLeader);
      update.teamLeader = normalizeMember(parsedLeader);
    } else if (raw.teamLeaderName) {
      update.teamLeader = {
        name: raw.teamLeaderName,
        phone1: raw.teamLeaderPhone1 || "",
        phone2: raw.teamLeaderPhone2 || "",
        phone3: raw.teamLeaderPhone3 || "",
      };
    }

    if (raw.members) {
      let members = tryParse(raw.members);
      if (!Array.isArray(members) && typeof members === "string") {
        members = members.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (Array.isArray(members)) {
        update.members = members.map(normalizeMember);
      }
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
    t.members.push(normalizeMember(member));
    await t.save();
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
