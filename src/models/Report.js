/**
 * src/models/Report.js
 * Citizen/worker reported bin issues.
 */

import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    binId: {
      type: String,
      required: true,
    },

    binDbId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    binName: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["overflow", "damaged", "missing", "blocked", "other"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    imageUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "resolved", "closed"],
      default: "pending",
    },

    assignedTo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);
export default Report;
