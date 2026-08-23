import mongoose from "mongoose";
import dns from "dns";
import fs from "fs";
import path from "path";

// Fix DNS resolution order & SRV lookup for Atlas in Node on Windows/macOS
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if not supported
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

function getMongoUri() {
  let uri = process.env.MONGODB_URI;
  if (!uri && typeof process !== "undefined") {
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf8");
        content.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const idx = trimmed.indexOf("=");
            if (idx > 0) {
              const k = trimmed.substring(0, idx).trim();
              const v = trimmed.substring(idx + 1).trim();
              if (k === "MONGODB_URI") uri = v;
            }
          }
        });
      }
    } catch {
      // Ignore fallback read errors
    }
  }
  return uri;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = getMongoUri();

  if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
    console.warn("⚠️ MONGODB_URI is unconfigured or contains placeholders. Operating in local fallback mode.");
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        family: 4,
      })
      .then((m) => {
        console.log("✅ Connected to MongoDB Atlas database!");
        return m;
      })
      .catch((err) => {
        console.warn("⚠️ MongoDB connection failed:", err.message, "Operating in local fallback mode.");
        cached.promise = null;
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;