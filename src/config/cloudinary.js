import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Try to load environment variables. Prefer existing process.env, but
// fall back to parsing the .env file in the project root if needed.
try {
  dotenv.config();
} catch (e) {
  // ignore
}

// If keys are still missing, attempt to read .env explicitly
const needed = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
const missing = needed.filter((k) => !process.env[k]);
if (missing.length > 0) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath));
      for (const k of missing) {
        if (parsed[k]) process.env[k] = parsed[k];
      }
    }
  } catch (e) {
    // ignore
  }
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Log presence (but never print secrets)
console.log("Cloudinary config - cloud name:", cloudName ? "OK" : "MISSING", ", api_key:", apiKey ? "OK" : "MISSING");

if (!apiKey || !apiSecret || !cloudName) {
  console.warn("Cloudinary credentials are not fully configured. Image uploads will fail.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;
