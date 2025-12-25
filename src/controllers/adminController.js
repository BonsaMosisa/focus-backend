import jwt from "jsonwebtoken";
import crypto from "crypto";
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
    await Admin.findByIdAndDelete(id);
    res.json({ message: "Admin deleted" });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const token = crypto.randomBytes(20).toString("hex");
    admin.resetPasswordToken = token;
    admin.resetPasswordExpires = Date.now() + 3600 * 1000; // 1 hour
    await admin.save();

    // In production, you'd email the token. For now return token in response for dev/testing.
    res.json({ message: "Password reset token generated", token });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ message: "Token and new password required" });

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!admin) return res.status(400).json({ message: "Invalid or expired token" });

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({ message: "Password has been reset" });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ message: err.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (typeof req.body.disabled !== 'undefined') admin.disabled = !!req.body.disabled;
    if (password) admin.password = password; // will be hashed by pre-save

    await admin.save();
    const out = await Admin.findById(id).select("-password");
    res.json(out);
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
    if (!admin) {
      const total = await Admin.countDocuments();
      if (total === 0) {
        return res.status(400).json({ message: "No admin registered" });
      }
      return res.status(400).json({ message: "Invalid credentials" });
    }

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
``