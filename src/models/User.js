/**
 * src/models/User.js
 *
 * Central user model — shared across all roles (citizen, worker, admin).
 * Operational role-specific data lives in Worker.js / Admin.js.
 *
 * SECURITY: role is an enum — only "citizen", "worker", "admin" are valid.
 * The backend enforces this; the frontend cannot override it.
 */

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },

    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // Never returned in queries unless explicitly requested
    },

    role: {
      type: String,
      // ← ENUM enforced at DB level — cannot be arbitrary value
      enum: {
        values: ["citizen", "worker", "admin"],
        message: "Role must be citizen, worker, or admin",
      },
      default: "citizen",
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Prevent returning passwordHash unless explicitly selected
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
