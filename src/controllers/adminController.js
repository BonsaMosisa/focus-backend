import jwt from "jsonwebtoken";
import Admin from "../Models/Admin.js";

const signToken = (admin) => {
  return jwt.sign(
    { id: admin._id, email: admin.email },
    process.env.JWT_SECRET || "changeme",
    {
      expiresIn: "7d",
    }
  );
};

// Admin creation is restricted to Super Admin via the interface; no public setup endpoint.

export const createAdmin = async (req, res) => {
  try {
    // Only super admin should call this (route protected)
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password required" });
    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Admin already exists" });
    const admin = await Admin.create({
      name,
      email,
      password,
      role: "admin",
      isSuper: false,
    });
    res
      .status(201)
      .json({ admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const disableAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await Admin.findById(id);
    if (!target) return res.status(404).json({ message: "Admin not found" });
    if (target.isSuper)
      return res.status(403).json({ message: "Cannot disable super admin" });
    target.disabled = true;
    await target.save();
    res.json({ message: "Admin disabled" });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const enableAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await Admin.findById(id);
    if (!target) return res.status(404).json({ message: "Admin not found" });
    target.disabled = false;
    await target.save();
    res.json({ message: "Admin enabled" });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await Admin.findById(id);
    if (!target) return res.status(404).json({ message: "Admin not found" });
    if (target.isSuper)
      return res.status(403).json({ message: "Cannot delete super admin" });
    await Admin.findByIdAndDelete(id);
    res.json({ message: "Admin deleted" });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(admin);
    res.json({
      admin: { id: admin._id, name: admin.name, email: admin.email },
      token,
    });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({ admin: req.admin });
};
