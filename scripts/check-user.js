/**
 * scripts/check-user.js
 * Checks user account in MongoDB Atlas for praveen.iyu@gmail.com.
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

async function checkUser() {
  try {
    const conn = await connectDB();
    if (!conn) {
      console.log("❌ DB connection returned null");
      process.exit(1);
    }

    const email = "praveen.iyu@gmail.com";
    console.log(`Searching for user: ${email}...`);

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      console.log(`❌ User with email "${email}" NOT FOUND in MongoDB Atlas database.`);
      
      console.log("Registering user now...");
      const passwordHash = await bcrypt.hash("prachi", 12);
      const newUser = await User.create({
        name: "Praveen",
        email,
        passwordHash,
        role: "citizen",
        isActive: true,
      });
      console.log("✅ User registered successfully in Atlas:", newUser);
    } else {
      console.log("✅ Found user in MongoDB Atlas:", user);
      const isPassValid = await bcrypt.compare("prachi", user.passwordHash);
      console.log(`Password "prachi" match result: ${isPassValid}`);
      if (!isPassValid) {
        console.log("Updating password hash to 'prachi'...");
        user.passwordHash = await bcrypt.hash("prachi", 12);
        await user.save();
        console.log("✅ Password updated to 'prachi'!");
      }
    }
  } catch (err) {
    console.error("Error checking user:", err);
  } finally {
    process.exit(0);
  }
}

checkUser();
