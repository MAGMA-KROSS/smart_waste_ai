/**
 * auth-service/services/auth.service.js
 * Core authentication business logic.
 */

import bcrypt from "bcryptjs";
import connectDB from "../../src/lib/mongodb.js";
import User from "../../src/models/User.js";
import Worker from "../../src/models/Worker.js";
import Admin from "../../src/models/Admin.js";

const SALT_ROUNDS = 12;
const inMemoryUsers = new Map();

// Default accounts initialized for local fallback mode
const adminHash = bcrypt.hashSync("Admin@SmartWaste2026", SALT_ROUNDS);
inMemoryUsers.set("admin@smartwaste.local", {
  _id: "admin_local_id_123",
  name: "Municipal Admin",
  email: "admin@smartwaste.local",
  passwordHash: adminHash,
  role: "admin",
  isActive: true,
  createdAt: new Date(),
});

const workerHash = bcrypt.hashSync("Worker@SmartWaste2026", SALT_ROUNDS);
inMemoryUsers.set("worker1@smartwaste.local", {
  _id: "worker1_user_id_123",
  name: "Ramesh Kumar",
  email: "worker1@smartwaste.local",
  passwordHash: workerHash,
  role: "worker",
  isActive: true,
  createdAt: new Date(),
});

inMemoryUsers.set("worker2@smartwaste.local", {
  _id: "worker2_user_id_123",
  name: "Suresh Singh",
  email: "worker2@smartwaste.local",
  passwordHash: workerHash,
  role: "worker",
  isActive: true,
  createdAt: new Date(),
});

const praveenHash = bcrypt.hashSync("prachi", SALT_ROUNDS);
inMemoryUsers.set("praveen.iyu@gmail.com", {
  _id: "praveen_user_id_123",
  name: "Praveen",
  email: "praveen.iyu@gmail.com",
  passwordHash: praveenHash,
  role: "citizen",
  isActive: true,
  createdAt: new Date(),
});

export const authService = {
  // Registers a new citizen (always role="citizen")
  async register({ name, email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const conn = await connectDB();

    if (conn) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        throw Object.assign(new Error("Email already registered"), { code: "EMAIL_EXISTS" });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: "citizen",
        isActive: true,
        lastLoginAt: new Date(),
      });

      return sanitizeUser(user);
    }

    if (inMemoryUsers.has(cleanEmail)) {
      throw Object.assign(new Error("Email already registered"), { code: "EMAIL_EXISTS" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const mockUser = {
      _id: `user_mem_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: "citizen",
      isActive: true,
      createdAt: new Date(),
    };
    inMemoryUsers.set(cleanEmail, mockUser);
    return sanitizeUser(mockUser);
  },

  // Authenticates user with email and password
  async login({ email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const conn = await connectDB();

    if (conn) {
      const user = await User.findOne({ email: cleanEmail }).select("+passwordHash");
      if (user) {
        if (!user.isActive) {
          throw Object.assign(new Error("Account is deactivated"), { code: "ACCOUNT_INACTIVE" });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (isValid) {
          await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
          return sanitizeUser(user);
        }
      }
    }

    // Fallback to seeded in-memory store
    const memUser = inMemoryUsers.get(cleanEmail);
    if (!memUser) {
      throw Object.assign(new Error("Invalid email or password"), { code: "INVALID_CREDENTIALS" });
    }

    if (!memUser.isActive) {
      throw Object.assign(new Error("Account is deactivated"), { code: "ACCOUNT_INACTIVE" });
    }

    const isValid = await bcrypt.compare(password, memUser.passwordHash);
    if (!isValid) {
      throw Object.assign(new Error("Invalid email or password"), { code: "INVALID_CREDENTIALS" });
    }

    memUser.lastLoginAt = new Date();
    return sanitizeUser(memUser);
  },

  // Returns profile for authenticated user
  async getMe(userId) {
    const conn = await connectDB();

    if (conn) {
      const user = await User.findById(userId).select("-passwordHash");
      if (user) return user;
    }

    for (const u of inMemoryUsers.values()) {
      if (u._id === userId || u.id === userId) return sanitizeUser(u);
    }

    throw Object.assign(new Error("User not found"), { code: "NOT_FOUND" });
  },

  // Creates a worker account (admin only, role="worker")
  async createWorker({ name, email, employeeId, department, temporaryPassword }) {
    const cleanEmail = email.toLowerCase().trim();
    const conn = await connectDB();
    const password = temporaryPassword || generateTempPassword();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    if (conn) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        throw Object.assign(new Error("Email already registered"), { code: "EMAIL_EXISTS" });
      }

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: "worker",
        isActive: true,
      });

      const workerProfile = await Worker.create({
        userId: user._id,
        employeeId,
        department: department || "Waste Collection",
        status: "active",
      });

      return { user: sanitizeUser(user), workerProfile, temporaryPassword: password };
    }

    if (inMemoryUsers.has(cleanEmail)) {
      throw Object.assign(new Error("Email already registered"), { code: "EMAIL_EXISTS" });
    }

    const mockWorker = {
      _id: `worker_mem_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: "worker",
      isActive: true,
      createdAt: new Date(),
    };
    inMemoryUsers.set(cleanEmail, mockWorker);

    const mockProfile = {
      userId: mockWorker._id,
      employeeId,
      department: department || "Waste Collection",
      status: "active",
    };

    return { user: sanitizeUser(mockWorker), workerProfile: mockProfile, temporaryPassword: password };
  },
};

function sanitizeUser(user) {
  return {
    id: (user._id || user.id).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    phone: user.phone || null,
    profileImage: user.profileImage || null,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function generateTempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
  return Array.from({ length: 12 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}
