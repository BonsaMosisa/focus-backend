import "dotenv/config";
import mongoose from "mongoose";
import Admin from "./src/Models/Admin.js";

const argv = process.argv.slice(2);
const get = (keys) => {
  for (const k of keys) {
    const i = argv.indexOf(k);
    if (i !== -1 && argv[i + 1]) return argv[i + 1];
  }
  return null;
};

const name = get(["--name", "-n"]);
const email = get(["--email", "-e"]);
const password = get(["--password", "-p"]);

if (!name || !email || !password) {
  console.error(
    "Usage: node createAdmin.js --name 'Name' --email 'admin@example.com' --password 'pass'"
  );
  process.exit(1);
}

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in environment or .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await Admin.findOne({ email });
  if (exists) {
    console.error("Admin with that email already exists");
    process.exit(1);
  }
  const admin = await Admin.create({ name, email, password });
  console.log("Admin created:", { id: admin._id, name: admin.name, email: admin.email });
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
