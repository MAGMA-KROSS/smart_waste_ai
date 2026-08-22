/**
 * src/models/Admin.js
 * Admin-specific profile data. Links to User via userId.
 */

import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    department: {
      type: String,
      default: "Municipal Waste Management",
      trim: true,
    },

    permissions: {
      type: [String],
      default: [
        "manage_bins",
        "manage_workers",
        "manage_routes",
        "view_analytics",
        "manage_reports",
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
export default Admin;
