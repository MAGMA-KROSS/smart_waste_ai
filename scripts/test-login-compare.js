/**
 * scripts/test-login-compare.js
 * Debugs login process for worker1@smartwaste.local
 */

import connectDB from "../src/lib/mongodb.js";
import User from "../src/models/User.js";
import { authService } from "../auth-service/services/auth.service.js";
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

async function debugLogin() {
  try {
    const conn = await connectDB();
    console.log("DB connected:", !!conn);

    const email = "worker1@smartwaste.local";
    const pass = "Worker@SmartWaste2026";

    const user = await authService.login({ email, password: pass });
    console.log("✅ authService.login SUCCESS:", user);
  } catch (err) {
    console.error("❌ authService.login FAILED:", err.message, err.stack);
  } finally {
    process.exit(0);
  }
}

debugLogin();
