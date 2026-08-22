/**
 * src/models/Worker.js
 *
 * Worker-specific operational data. Links to User via userId.
 * A user with role="worker" always has a corresponding Worker document.
 */

import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    department: {
      type: String,
      default: "Waste Collection",
      trim: true,
    },

    assignedVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    assignedRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "on_leave", "suspended"],
        message: "Status must be active, inactive, on_leave, or suspended",
      },
      default: "active",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Worker = mongoose.models.Worker || mongoose.model("Worker", WorkerSchema);
export default Worker;
