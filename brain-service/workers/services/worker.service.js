import connectDB from "../../../src/lib/mongodb.js";
import User from "../../../src/models/User.js";
import Worker from "../../../src/models/Worker.js";

const MOCK_WORKERS = [
  {
    _id: "worker_mock_1",
    employeeId: "MUN-1001",
    department: "Waste Collection (North)",
    status: "active",
    userId: {
      _id: "worker1_user_id_123",
      name: "Ramesh Kumar",
      email: "worker1@smartwaste.local",
      role: "worker",
      isActive: true,
    },
  },
  {
    _id: "worker_mock_2",
    employeeId: "MUN-1002",
    department: "Waste Collection (South)",
    status: "active",
    userId: {
      _id: "worker2_user_id_123",
      name: "Suresh Singh",
      email: "worker2@smartwaste.local",
      role: "worker",
      isActive: true,
    },
  },
];

export const workerService = {
  // Returns all municipal workers for admin management
  async getAll({ page = 1, limit = 20 } = {}) {
    const conn = await connectDB();
    if (conn) {
      try {
        const workers = await Worker.find()
          .populate("userId", "-passwordHash")
          .populate("assignedVehicleId")
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        const total = await Worker.countDocuments();
        return { workers, total };
      } catch (err) {
        console.warn("MongoDB worker find notice:", err.message);
      }
    }

    return { workers: MOCK_WORKERS, total: MOCK_WORKERS.length };
  },

  // Returns worker profile by user ID
  async getProfile(userId) {
    const conn = await connectDB();
    if (conn) {
      try {
        const worker = await Worker.findOne({ userId })
          .populate("userId", "-passwordHash")
          .populate("assignedRouteId")
          .lean();

        if (worker) return worker;
      } catch (err) {
        console.warn("MongoDB worker profile notice:", err.message);
      }
    }

    const mock = MOCK_WORKERS.find(
      (w) => w.userId._id === userId || w._id === userId
    ) || MOCK_WORKERS[0];
    return mock;
  },

  // Updates worker operational details
  async update(workerId, data) {
    const conn = await connectDB();
    if (conn) {
      const worker = await Worker.findByIdAndUpdate(workerId, { $set: data }, { new: true });
      if (!worker) throw Object.assign(new Error("Worker not found"), { code: "NOT_FOUND" });
      return worker;
    }
    return { _id: workerId, ...data };
  },

  // Deactivates worker account
  async deactivate(workerId) {
    const conn = await connectDB();
    if (conn) {
      const worker = await Worker.findById(workerId);
      if (!worker) throw Object.assign(new Error("Worker not found"), { code: "NOT_FOUND" });

      await User.findByIdAndUpdate(worker.userId, { isActive: false });
      await Worker.findByIdAndUpdate(workerId, { status: "inactive" });
      return { deactivated: true };
    }
    return { deactivated: true };
  },
};

