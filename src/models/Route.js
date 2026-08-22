/**
 * src/models/Route.js
 * Collection route assigned to a worker.
 */

import mongoose from "mongoose";

const RouteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    bins: [
      {
        binId: String,
        binDbId: { type: mongoose.Schema.Types.ObjectId, ref: "Bin" },
        name: String,
        lat: Number,
        lng: Number,
        address: String,
        fillLevel: Number,
        collected: { type: Boolean, default: false },
        collectedAt: { type: Date, default: null },
        order: Number,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    estimatedDistanceKm: {
      type: Number,
      default: 0,
    },

    estimatedTimeMin: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Route = mongoose.models.Route || mongoose.model("Route", RouteSchema);
export default Route;
