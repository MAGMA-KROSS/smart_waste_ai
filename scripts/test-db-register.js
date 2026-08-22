/**
 * scripts/test-db-register.js
 * Tests registration directly against MongoDB Atlas smart_waste_ai.
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

async function testRegister() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    const conn = await connectDB();
    if (!conn) {
      console.error("❌ MongoDB connection returned null");
      process.exit(1);
    }
    console.log("✅ Connected to MongoDB Atlas!");

    const testEmail = `raj_${Date.now()}@example.com`;
    console.log(`Registering user "Raj" with email: ${testEmail}...`);

    const user = await authService.register({
      name: "Raj",
      email: testEmail,
      password: "Password123",
    });

    console.log("✅ User registered:", user);

    // Verify user exists in MongoDB Atlas User collection
    const savedUser = await User.findOne({ email: testEmail });
    console.log("✅ Verified in MongoDB Atlas database:", savedUser);
  } catch (err) {
    console.error("❌ Test register error:", err);
  } finally {
    process.exit(0);
  }
}

testRegister();
