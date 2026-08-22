/**
 * scripts/seed-admin.js
 *
 * Secure admin seeding script for MongoDB Atlas.
 * Usage: node scripts/seed-admin.js
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Natively parse .env.local
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

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@smartwaste.local").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@SmartWaste2026";
const ADMIN_NAME = process.env.ADMIN_NAME || "Municipal Admin";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, enum: ["citizen", "worker", "admin"], default: "citizen" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

const AdminSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    department: { type: String, default: "Municipal Waste Management" },
    permissions: [String],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Successfully connected to MongoDB Atlas!");

    let existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user with email "${ADMIN_EMAIL}" already exists in Atlas.`);
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log(`Updated user role to "admin".`);
      }
    } else {
      console.log(`Creating admin user: ${ADMIN_EMAIL}...`);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

      existingAdmin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
        isActive: true,
      });

      console.log(`✅ Admin User created with ID: ${existingAdmin._id}`);
    }

    // Ensure Admin profile exists
    let adminProfile = await Admin.findOne({ userId: existingAdmin._id });
    if (!adminProfile) {
      adminProfile = await Admin.create({
        userId: existingAdmin._id,
        department: "Municipal Waste Management",
        permissions: [
          "manage_bins",
          "manage_workers",
          "manage_routes",
          "view_analytics",
          "manage_reports",
        ],
      });
      console.log(`✅ Admin Profile created in Atlas.`);
    }

    console.log("\n==========================================");
    console.log("🎉 MONGODB ATLAS ADMIN PROVISIONING COMPLETE");
    console.log(`Atlas DB: smart_waste_ai`);
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role: admin`);
    console.log("==========================================\n");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
