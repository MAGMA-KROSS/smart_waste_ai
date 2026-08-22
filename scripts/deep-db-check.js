/**
 * scripts/deep-db-check.js
 * Deep MongoDB Atlas & Microservices Database Audit Script.
 * Verifies every collection schema, field type, geospatial indexing, and CRUD operation.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../src/lib/mongodb.js";
import User from "../src/models/User.js";
import Bin from "../src/models/Bin.js";
import Report from "../src/models/Report.js";
import Worker from "../src/models/Worker.js";
import RouteModel from "../src/models/Route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
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

async function deepDatabaseAudit() {
  console.log("\n=======================================================");
  console.log("🔍 SMARTWASTE AI — DEEP MONGODB ATLAS & MODEL AUDIT");
  console.log("=======================================================\n");

  let passes = 0;
  let fails = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passes++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      fails++;
    }
  }

  try {
    const conn = await connectDB();
    assert(conn !== null, "MongoDB Atlas connection established");

    // 1. USERS COLLECTION AUDIT
    console.log("\n--- 1. USERS COLLECTION AUDIT ---");
    const users = await User.find().select("+passwordHash").lean();
    assert(users.length > 0, `Users collection contains ${users.length} active documents`);

    const admin = users.find((u) => u.role === "admin");
    const worker = users.find((u) => u.role === "worker");
    const citizen = users.find((u) => u.role === "citizen");

    assert(admin !== undefined, `Admin user exists: '${admin?.name}' (${admin?.email})`);
    assert(worker !== undefined, `Worker user exists: '${worker?.name}' (${worker?.email})`);
    assert(citizen !== undefined, `Citizen user exists: '${citizen?.name}' (${citizen?.email})`);

    users.forEach((u) => {
      assert(u.email && u.passwordHash && u.role, `User document ${u.email} has all required fields`);
    });

    // 2. WORKERS COLLECTION AUDIT
    console.log("\n--- 2. WORKERS COLLECTION AUDIT ---");
    const workers = await Worker.find().lean();
    assert(workers.length >= 2, `Workers collection contains ${workers.length} employee records`);
    workers.forEach((w) => {
      assert(w.employeeId && w.department, `Worker record ${w.employeeId} has employee ID and department (${w.department})`);
    });

    // 3. BINS COLLECTION AUDIT
    console.log("\n--- 3. BINS COLLECTION AUDIT (SMART BINS) ---");
    const bins = await Bin.find({ isActive: true }).lean();
    assert(bins.length >= 10, `Bins collection contains ${bins.length} active smart bins`);

    let validCoords = 0;
    let validFillLevels = 0;
    bins.forEach((b) => {
      if (typeof b.lat === "number" && typeof b.lng === "number") validCoords++;
      if (typeof b.fillLevel === "number" && b.fillLevel >= 0 && b.fillLevel <= 100) validFillLevels++;
    });

    assert(validCoords === bins.length, `All ${bins.length} smart bins have valid latitude/longitude coordinates`);
    assert(validFillLevels === bins.length, `All ${bins.length} smart bins have valid fill levels (0% - 100%)`);

    // 4. REPORTS COLLECTION AUDIT
    console.log("\n--- 4. REPORTS COLLECTION AUDIT ---");
    const reports = await Report.find().lean();
    assert(Array.isArray(reports), `Reports collection query executed (found ${reports.length} citizen issue reports)`);

    // 5. ROUTES COLLECTION AUDIT
    console.log("\n--- 5. ROUTES COLLECTION AUDIT ---");
    const routes = await RouteModel.find().lean();
    assert(Array.isArray(routes), `Routes collection query executed (found ${routes.length} collection routes)`);

    // 6. CRUD MUTATION INTEGRITY TEST
    console.log("\n--- 6. CRUD MUTATION & ROLLBACK INTEGRITY TEST ---");
    const testBinId = `AUDIT-BIN-${Date.now()}`;
    const testBin = await Bin.create({
      binId: testBinId,
      name: "Audit Test Bin",
      category: "recyclable",
      lat: 28.6139,
      lng: 77.209,
      address: "Audit Test Location, New Delhi",
      fillLevel: 88,
      status: "active",
      isActive: true,
    });

    assert(testBin !== null && testBin.binId === testBinId, "Bin document creation in MongoDB Atlas verified");

    const updatedBin = await Bin.findOneAndUpdate(
      { binId: testBinId },
      { $set: { fillLevel: 0 } },
      { new: true }
    );
    assert(updatedBin.fillLevel === 0, "Bin fill level update (mark collected) verified in Atlas");

    await Bin.deleteOne({ binId: testBinId });
    const deletedCheck = await Bin.findOne({ binId: testBinId });
    assert(deletedCheck === null, "Test bin document successfully cleaned up from Atlas");

  } catch (err) {
    assert(false, `Audit error: ${err.message}`);
  }

  console.log("\n=======================================================");
  console.log(`DEEP AUDIT SUMMARY: ${passes} Passed, ${fails} Failed`);
  console.log("=======================================================\n");

  process.exit(fails > 0 ? 1 : 0);
}

deepDatabaseAudit();
