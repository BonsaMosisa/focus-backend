import jwt from "jsonwebtoken";
import Admin from "../Models/Admin.js";

export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    if (admin.disabled)
      return res.status(403).json({ message: "Account disabled" });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default adminAuth;

export const requireSuperAdmin = (req, res, next) => {
  const admin = req.admin;
  if (!admin) return res.status(401).json({ message: "Unauthorized" });
  if (!admin.isSuper)
    return res.status(403).json({ message: "Super admin required" });
  next();
};
