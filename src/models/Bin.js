/**
 * src/models/Bin.js
 *
 * Persisted bin data — mirrors the structure in mockBins.js
 * so that migrating from mock to DB is seamless.
 */

import mongoose from "mongoose";

const BinSchema = new mongoose.Schema(
  {
    binId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      trim: true,
      default: "Unknown Area",
    },

    category: {
      type: String,
      enum: ["general", "recyclable", "organic", "glass", "ewaste"],
      required: true,
    },

    wasteType: {
      type: String,
      required: true,
      trim: true,
      default: "Recyclable",
    },

    fillLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    capacityLiters: {
      type: Number,
      default: 200,
    },

    lastCollected: {
      type: String,
      default: "Unknown",
    },

    lastCollectedAt: {
      type: Date,
      default: null,
    },

    suitableItems: {
      type: [String],
      default: [],
    },

    sensorStatus: {
      type: String,
      enum: ["Online", "Offline", "Maintenance"],
      default: "Online",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Geo index for efficient nearby queries
BinSchema.index({ lat: 1, lng: 1 });

const Bin = mongoose.models.Bin || mongoose.model("Bin", BinSchema);
export default Bin;
