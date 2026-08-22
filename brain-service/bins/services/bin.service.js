import connectDB from "../../../src/lib/mongodb.js";
import Bin from "../../../src/models/Bin.js";
import { MOCK_BINS } from "../../../src/lib/mockBins.js";
import { calculateDistance } from "../../../src/lib/geoUtils.js";

export const binService = {
  // Returns bins near a location with mock data fallback
  async getNearby({ lat, lng, radiusKm = 5, category = "all" }) {
    let bins = [];
    try {
      const conn = await connectDB();
      if (conn) {
        bins = await Bin.find({ isActive: true }).lean();
      }
    } catch (err) {
      console.warn("MongoDB query failed, using mock bins fallback:", err.message);
    }

    if (!bins || bins.length === 0) {
      bins = MOCK_BINS.map((b) => ({
        ...b,
        binId: b.id,
        _isMock: true,
      }));
    }

    if (category && category !== "all") {
      bins = bins.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
    }

    return bins
      .map((bin) => ({
        ...bin,
        id: bin.binId || bin.id,
        distanceKm: calculateDistance(lat, lng, bin.lat, bin.lng),
      }))
      .filter((b) => b.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  },

  // Returns a single bin by binId or ObjectId
  async getById(id) {
    let bin = null;
    try {
      const conn = await connectDB();
      if (conn) {
        bin = await Bin.findOne({ binId: id }).lean();
        if (!bin) bin = await Bin.findById(id).lean();
      }
    } catch (err) {
      console.warn("MongoDB query error for getById:", err.message);
    }

    if (!bin) {
      const mock = MOCK_BINS.find((b) => b.id === id);
      if (mock) return { ...mock, binId: mock.id, _isMock: true };
    }

    return bin;
  },

  // Returns all bins for admin management
  async getAll({ page = 1, limit = 50, category } = {}) {
    let bins = [];
    let total = 0;

    try {
      const conn = await connectDB();
      if (conn) {
        const query = { isActive: true };
        if (category && category !== "all") query.category = category;

        bins = await Bin.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        total = await Bin.countDocuments(query);
      }
    } catch (err) {
      console.warn("MongoDB query error for getAll:", err.message);
    }

    if (!bins || bins.length === 0) {
      return {
        bins: MOCK_BINS.map((b) => ({ ...b, binId: b.id, _isMock: true })),
        total: MOCK_BINS.length,
        isMockData: true,
      };
    }

    return { bins, total, isMockData: false };
  },

  // Creates a new bin record
  async create(data, adminUserId) {
    await connectDB();
    const binId = data.binId || `BIN-${Date.now().toString(36).toUpperCase()}`;
    return Bin.create({ ...data, binId, addedBy: adminUserId });
  },

  // Updates an existing bin record
  async update(id, data) {
    await connectDB();
    const bin = await Bin.findOneAndUpdate(
      { $or: [{ binId: id }, { _id: id }] },
      { $set: data },
      { new: true }
    );
    if (!bin) throw Object.assign(new Error("Bin not found"), { code: "NOT_FOUND" });
    return bin;
  },

  // Soft deletes a bin record
  async remove(id) {
    await connectDB();
    const bin = await Bin.findOneAndUpdate(
      { $or: [{ binId: id }, { _id: id }] },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!bin) throw Object.assign(new Error("Bin not found"), { code: "NOT_FOUND" });
    return { deleted: true };
  },

  // Marks a bin as collected by a worker
  async markCollected(binId, workerId) {
    await connectDB();
    const bin = await Bin.findOneAndUpdate(
      { $or: [{ binId }, { _id: binId }] },
      {
        $set: {
          fillLevel: 0,
          lastCollected: "Just now",
          lastCollectedAt: new Date(),
        },
      },
      { new: true }
    );
    if (!bin) throw Object.assign(new Error("Bin not found"), { code: "NOT_FOUND" });
    return bin;
  },
};
