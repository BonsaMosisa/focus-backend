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
  fields: (fieldsArray) => {
    const mw = multerUpload.fields(fieldsArray);
    return (req, res, next) => {
      mw(req, res, (err) => {
        if (err) return next(err);

        // normalize to req.file for downstream code (pick first provided file)
        if (!req.file && req.files && typeof req.files === "object") {
          for (const f of fieldsArray) {
            const name = f.name;
            if (req.files[name] && req.files[name].length) {
              req.file = req.files[name][0];
              req.file.path = req.file.path || path.join(req.file.destination || uploadDir, req.file.filename);
              break;
            }
          }
        }

        next();
      });
    };
  },
  any: () => {
    const mw = multerUpload.any();
    return (req, res, next) => {
      mw(req, res, (err) => {
        if (err) return next(err);

        // normalize first file to req.file for backward compatibility
        if (!req.file && req.files && Array.isArray(req.files) && req.files.length) {
          req.file = req.files[0];
          req.file.path = req.file.path || path.join(req.file.destination || uploadDir, req.file.filename);
        }

        next();
      });
    };
  },
};

export default upload;
