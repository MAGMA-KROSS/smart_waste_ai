/**
 * scripts/list-all-accounts.js
 * Fetches all registered accounts across all roles from MongoDB Atlas.
 */

import connectDB from "../src/lib/mongodb.js";
import User from "../src/models/User.js";
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

async function listAccounts() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.error("❌ DB connection returned null");
      process.exit(1);
    }

    const users = await User.find().lean();
    console.log("JSON_ACCOUNTS_START");
    console.log(JSON.stringify(users, null, 2));
    console.log("JSON_ACCOUNTS_END");
  } catch (err) {
    console.error("Error listing accounts:", err);
  } finally {
    process.exit(0);
  }
}

listAccounts();
