/**
 * scripts/seed-bins.js
 * Seeds mock bins into MongoDB Atlas smart_waste_ai database.
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MOCK_BINS } from "../src/lib/mockBins.js";

import dns from "dns";

try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore
}

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

const MONGODB_URI = process.env.MONGODB_URI;

const BinSchema = new mongoose.Schema({
  binId: { type: String, required: true, unique: true },
  name: String,
  lat: Number,
  lng: Number,
  address: String,
  area: String,
  category: String,
  wasteType: String,
  fillLevel: Number,
  capacityLiters: Number,
  lastCollected: String,
  suitableItems: [String],
  sensorStatus: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Bin = mongoose.models.Bin || mongoose.model("Bin", BinSchema);

async function seedBins() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas.");

    let count = 0;
    for (const b of MOCK_BINS) {
      await Bin.updateOne(
        { binId: b.id },
        {
          $set: {
            binId: b.id,
            name: b.name,
            lat: b.lat,
            lng: b.lng,
            address: b.address,
            area: b.area,
            category: b.category,
            wasteType: b.wasteType,
            fillLevel: b.fillLevel,
            capacityLiters: b.capacityLiters,
            lastCollected: b.lastCollected,
            suitableItems: b.suitableItems,
            sensorStatus: b.sensorStatus,
            isActive: true,
          },
        },
        { upsert: true }
      );
      count++;
    }

    console.log(`✅ ${count} Smart Bins seeded into MongoDB Atlas database!`);
  } catch (err) {
    console.error("❌ Seed bins error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedBins();
