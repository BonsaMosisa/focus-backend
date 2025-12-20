import path from "path";
import fs from "fs";
import multer from "multer";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const fileName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, fileName);
  },
});

const multerUpload = multer({ storage });

// Provide a multer-like API: upload.single(fieldname)
const upload = {
  single: (fieldName) => {
    const mw = multerUpload.single(fieldName);
    return (req, res, next) => {
      mw(req, res, (err) => {
        if (err) return next(err);

        if (req.file) {
          // ensure path property exists (some multer versions include it already)
          req.file.path = req.file.path || path.join(req.file.destination || uploadDir, req.file.filename);
        }

        next();
      });
    };
  },
};

export default upload;
