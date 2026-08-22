/**
 * scripts/seed-workers.js
 * Seeds Municipal Worker accounts into MongoDB Atlas.
 */

import connectDB from "../src/lib/mongodb.js";
import User from "../src/models/User.js";
import Worker from "../src/models/Worker.js";
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

const WORKERS = [
  {
    name: "Ramesh Kumar",
    email: "worker1@smartwaste.local",
    password: "Worker@SmartWaste2026",
    employeeId: "MUN-1001",
    department: "North Zone Waste Collection",
  },
  {
    name: "Suresh Singh",
    email: "worker2@smartwaste.local",
    password: "Worker@SmartWaste2026",
    employeeId: "MUN-1002",
    department: "South Zone Smart Fleet",
  },
];

async function seedWorkers() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error("❌ DB connection returned null");
      process.exit(1);
    }

    console.log("Seeding Municipal Workers into MongoDB Atlas...");

    for (const w of WORKERS) {
      let user = await User.findOne({ email: w.email });
      if (!user) {
        const passwordHash = await bcrypt.hash(w.password, 12);
        user = await User.create({
          name: w.name,
          email: w.email,
          passwordHash,
          role: "worker",
          isActive: true,
        });
        console.log(`✅ Created User record for ${w.name} (${w.email})`);
      }

      let workerProfile = await Worker.findOne({ userId: user._id });
      if (!workerProfile) {
        workerProfile = await Worker.create({
          userId: user._id,
          employeeId: w.employeeId,
          department: w.department,
          status: "active",
        });
        console.log(`✅ Created Worker profile record for ${w.name} (${w.employeeId})`);
      }
    }

    console.log("🎉 MUNICIPAL WORKERS SEEDED SUCCESSFULLY INTO MONGODB ATLAS!");
  } catch (err) {
    console.error("Worker seeding error:", err);
  } finally {
    process.exit(0);
  }
}

seedWorkers();
