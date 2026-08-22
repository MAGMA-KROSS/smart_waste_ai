/**
 * scripts/test-ry-login.js
 * Provisions & verifies ry7437901@gmail.com in MongoDB Atlas.
 */

import connectDB from "../src/lib/mongodb.js";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

async function testRyLogin() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log("❌ DB connection returned null");
      process.exit(1);
    }

    const email = "ry7437901@gmail.com";
    let user = await User.findOne({ email }).select("+passwordHash");

    const hash = await bcrypt.hash("rajyadav123", 12);

    if (!user) {
      user = await User.create({
        name: "raj yadav ji",
        email,
        passwordHash: hash,
        role: "citizen",
        isActive: true,
      });
      console.log("✅ Created user ry7437901@gmail.com in MongoDB Atlas!");
    } else {
      user.passwordHash = hash;
      await user.save();
      console.log("✅ Updated password for ry7437901@gmail.com to 'rajyadav123' in MongoDB Atlas!");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

testRyLogin();
