import connectDB from "../../../src/lib/mongodb.js";
import User from "../../../src/models/User.js";
import Worker from "../../../src/models/Worker.js";

export const workerService = {
  // Returns all municipal workers for admin management
  async getAll({ page = 1, limit = 20 } = {}) {
    await connectDB();
    const workers = await Worker.find()
      .populate("userId", "-passwordHash")
      .populate("assignedVehicleId")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Worker.countDocuments();
    return { workers, total };
  },

  // Returns worker profile by user ID
  async getProfile(userId) {
    await connectDB();
    const worker = await Worker.findOne({ userId })
      .populate("userId", "-passwordHash")
      .populate("assignedRouteId")
      .lean();

    if (!worker) throw Object.assign(new Error("Worker profile not found"), { code: "NOT_FOUND" });
    return worker;
  },

  // Updates worker operational details
  async update(workerId, data) {
    await connectDB();
    const worker = await Worker.findByIdAndUpdate(workerId, { $set: data }, { new: true });
    if (!worker) throw Object.assign(new Error("Worker not found"), { code: "NOT_FOUND" });
    return worker;
  },

  // Deactivates worker account
  async deactivate(workerId) {
    await connectDB();
    const worker = await Worker.findById(workerId);
    if (!worker) throw Object.assign(new Error("Worker not found"), { code: "NOT_FOUND" });

    await User.findByIdAndUpdate(worker.userId, { isActive: false });
    await Worker.findByIdAndUpdate(workerId, { status: "inactive" });
    return { deactivated: true };
  },
};
