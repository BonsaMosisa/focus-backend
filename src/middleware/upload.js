import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Provide a multer-like API: upload.single(fieldname)
const upload = {
  single: (fieldName) => {
    return async (req, res, next) => {
      try {
        if (!req.files || !req.files[fieldName]) return next();

        const file = req.files[fieldName];
        const ext = path.extname(file.name || file.originalname || "");
        const fileName = `${Date.now()}-${fieldName}${ext}`;
        const destPath = path.join(uploadDir, fileName);

        // express-fileupload provides mv
        if (typeof file.mv === "function") {
          await file.mv(destPath);
        } else if (file.data) {
          await fs.promises.writeFile(destPath, file.data);
        } else {
          return res.status(400).json({ message: "Invalid file upload" });
        }

        // Provide multer-like file info
        req.file = {
          path: destPath,
          filename: fileName,
          originalname: file.name || file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        };

        next();
      } catch (err) {
        next(err);
      }
    };
  },
};

export default upload;
