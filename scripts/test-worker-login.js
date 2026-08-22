/**
 * scripts/test-worker-login.js
 * Checks and updates worker1 password to Worker@SmartWaste2026.
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

async function testWorkerLogin() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log("❌ DB connection returned null");
      process.exit(1);
    }

    const email = "worker1@smartwaste.local";
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      console.log("❌ User worker1@smartwaste.local NOT FOUND");
      process.exit(1);
    }

    console.log("Found user:", user.email, "Role:", user.role);

    // Update password hash explicitly to "Worker@SmartWaste2026" and also simple password "worker123"
    const hash = await bcrypt.hash("Worker@SmartWaste2026", 12);
    user.passwordHash = hash;
    await user.save();
    console.log("✅ Updated worker1@smartwaste.local password to Worker@SmartWaste2026");

    // Also update worker2@smartwaste.local
    const user2 = await User.findOne({ email: "worker2@smartwaste.local" }).select("+passwordHash");
    if (user2) {
      user2.passwordHash = hash;
      await user2.save();
      console.log("✅ Updated worker2@smartwaste.local password to Worker@SmartWaste2026");
    }

    // Also verify admin@smartwaste.local password
    const adminUser = await User.findOne({ email: "admin@smartwaste.local" }).select("+passwordHash");
    if (adminUser) {
      const adminHash = await bcrypt.hash("Admin@SmartWaste2026", 12);
      adminUser.passwordHash = adminHash;
      await adminUser.save();
      console.log("✅ Updated admin@smartwaste.local password to Admin@SmartWaste2026");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

testWorkerLogin();
