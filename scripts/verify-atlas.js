/**
 * scripts/verify-atlas.js
 * Verifies all documents in MongoDB Atlas Cloud Database.
 */

import connectDB from "../src/lib/mongodb.js";
import User from "../src/models/User.js";
import Bin from "../src/models/Bin.js";
import Worker from "../src/models/Worker.js";
import Report from "../src/models/Report.js";
import Route from "../src/models/Route.js";
import Admin from "../src/models/Admin.js";
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

async function verifyAtlas() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error("❌ Failed to connect to MongoDB Atlas");
      process.exit(1);
    }

    console.log("=======================================================");
    console.log("☁️ MONGODB ATLAS CLOUD DATABASE VERIFICATION REPORT");
    console.log("=======================================================");
    console.log(`Cluster Host: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    console.log("-------------------------------------------------------");

    const users = await User.find().lean();
    console.log(`👥 USERS COLLECTION (${users.length} documents):`);
    users.forEach((u) => console.log(`   - [${u.role.toUpperCase()}] ${u.name} (${u.email}) -> ID: ${u._id}`));

    console.log("-------------------------------------------------------");

    const workers = await Worker.find().populate("userId", "name email").lean();
    console.log(`👷 WORKERS COLLECTION (${workers.length} documents):`);
    workers.forEach((w) =>
      console.log(`   - Employee ID: ${w.employeeId} | Name: ${w.userId?.name || "Worker"} | Dept: ${w.department}`)
    );

    console.log("-------------------------------------------------------");

    const bins = await Bin.find().lean();
    console.log(`🗑️ BINS COLLECTION (${bins.length} documents):`);
    console.log(`   - Total Smart Bins stored in Atlas: ${bins.length}`);

    console.log("=======================================================");
  } catch (err) {
    console.error("Error verifying Atlas:", err);
  } finally {
    process.exit(0);
  }
}

verifyAtlas();
