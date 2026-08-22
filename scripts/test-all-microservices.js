/**
 * scripts/test-all-microservices.js
 * Comprehensive end-to-end integration test suite.
 * Validates:
 *  1. MongoDB Atlas Cloud Database Connectivity & Data Integrity
 *  2. Auth Microservice (auth-service/) -> User login, bcrypt hashing, JWT signing
 *  3. AI/LLM Microservice (ai-llm-service/) -> Waste scanning & recycling rules
 *  4. Brain Core Service (brain-service/) -> Bins, Reports, AI Route Optimization, Analytics
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

import { authService } from "../auth-service/services/auth.service.js";
import { signToken, verifyToken } from "../auth-service/utils/jwt.utils.js";
import { classifyWaste, getRecyclingRecommendations } from "../ai-llm-service/services/waste.service.js";
import { binService } from "../brain-service/bins/services/bin.service.js";
import { reportService } from "../brain-service/reports/services/report.service.js";
import { routeService } from "../brain-service/routes/services/route.service.js";
import { analyticsService } from "../brain-service/analytics/services/analytics.service.js";

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

async function runFullMicroserviceTest() {
  console.log("\n=======================================================");
  console.log("🧪 SMARTWASTE AI — COMPLETE MICROSERVICE & DB TEST SUITE");
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

  // 1. DATABASE CONNECTIVITY TEST
  console.log("--- 1. MONGODB ATLAS CLOUD DATABASE CONNECTIVITY ---");
  try {
    const conn = await connectDB();
    assert(conn !== null, "Successfully connected to MongoDB Atlas Cloud Database");

    const userCount = await User.countDocuments();
    const binCount = await Bin.countDocuments();
    const workerCount = await Worker.countDocuments();

    assert(userCount >= 5, `MongoDB Atlas contains ${userCount} users (Expected >= 5)`);
    assert(binCount >= 10, `MongoDB Atlas contains ${binCount} smart bins (Expected >= 10)`);
    assert(workerCount >= 2, `MongoDB Atlas contains ${workerCount} municipal workers (Expected >= 2)`);
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
  }

  // 2. AUTH MICROSERVICE TEST
  console.log("\n--- 2. AUTH MICROSERVICE (auth-service/) ---");
  try {
    // Admin login
    const adminUser = await authService.login({
      email: "admin@smartwaste.local",
      password: "Admin@SmartWaste2026",
    });
    assert(adminUser.role === "admin", "Admin login successful with correct role 'admin'");

    // Citizen login
    const citizenUser = await authService.login({
      email: "ry7437901@gmail.com",
      password: "rajyadav123",
    });
    assert(citizenUser.role === "citizen", "Citizen login successful for ry7437901@gmail.com");

    // JWT sign & verify
    const token = await signToken({ userId: citizenUser.id, role: citizenUser.role });
    const payload = await verifyToken(token);
    assert(payload.role === "citizen" && payload.userId === citizenUser.id, "JWT signed & verified correctly with jose");
  } catch (err) {
    assert(false, `Auth microservice test failed: ${err.message}`);
  }

  // 3. AI/LLM MICROSERVICE TEST
  console.log("\n--- 3. AI/LLM MICROSERVICE (ai-llm-service/) ---");
  try {
    const scanResult = await classifyWaste({ imageBase64: "test_image", material: "plastic" });
    assert(scanResult && scanResult.material === "plastic", `Waste scan service returned material: '${scanResult?.material}'`);

    const plasticRules = await getRecyclingRecommendations("plastic");
    assert(plasticRules && plasticRules.category === "recyclable", "Recycling recommendations fetched for material 'plastic'");
  } catch (err) {
    assert(false, `AI/LLM microservice test failed: ${err.message}`);
  }

  // 4. BRAIN CORE SERVICE TEST
  console.log("\n--- 4. BRAIN CORE SERVICE (brain-service/) ---");
  try {
    // Bins
    const { bins, total } = await binService.getAll();
    assert(Array.isArray(bins) && total > 0, `Bin domain returned ${total} active smart bins`);

    // Nearby Bins Query
    const nearby = await binService.getNearby({ lat: 28.6139, lng: 77.209 });
    assert(Array.isArray(nearby), "Geospatial nearby bin query executed successfully");

    // Reports
    const reportData = await reportService.create({
      binId: bins[0]._id ? bins[0]._id.toString() : "bin_123",
      type: "overflowing",
      description: "Bin is overflowing test report",
      reportedBy: "ry7437901@gmail.com",
    });
    assert(reportData && reportData.type === "overflowing", "Report issue domain successfully persisted report");

    // AI Route Generation
    const routeRes = await routeService.generate({ minFillLevel: 50 });
    assert(routeRes && routeRes.route && Array.isArray(routeRes.route.bins), "AI Collection Route optimization algorithm generated valid route sequence");

    // Analytics
    const analytics = await analyticsService.getDashboard();
    assert(analytics && typeof analytics.totalBins === "number", "Analytics dashboard service calculated city metrics");
  } catch (err) {
    assert(false, `Brain core service test failed: ${err.message}`);
  }

  console.log("\n=======================================================");
  console.log(`SUMMARY: ${passes} Passed, ${fails} Failed`);
  console.log("=======================================================\n");

  process.exit(fails > 0 ? 1 : 0);
}

runFullMicroserviceTest();
