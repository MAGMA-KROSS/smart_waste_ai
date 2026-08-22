import connectDB from "../../../src/lib/mongodb.js";
import Route from "../../../src/models/Route.js";
import Bin from "../../../src/models/Bin.js";
import { MOCK_BINS } from "../../../src/lib/mockBins.js";
import { calculateDistance } from "../../../src/lib/geoUtils.js";

export const routeService = {
  // Generates an optimized collection route using greedy nearest-neighbor algorithm
  async generate({ adminUserId, minFillLevel = 70 }) {
    await connectDB();

    let dbBins = await Bin.find({ isActive: true, fillLevel: { $gte: minFillLevel } }).lean();

    let binsToCollect = dbBins;
    if (binsToCollect.length === 0) {
      binsToCollect = MOCK_BINS.filter((b) => b.fillLevel >= minFillLevel).map((b) => ({
        binId: b.id,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        address: b.address,
        fillLevel: b.fillLevel,
      }));
    }

    if (binsToCollect.length === 0) {
      return { route: null, message: "No bins currently require collection" };
    }

    const ordered = greedyRoute(binsToCollect);
    const totalDist = calculateTotalDistance(ordered);

    const route = await Route.create({
      bins: ordered.map((b, i) => ({
        binId: b.binId || b.id,
        binDbId: b._id || null,
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        address: b.address,
        fillLevel: b.fillLevel,
        collected: false,
        order: i + 1,
      })),
      estimatedDistanceKm: parseFloat(totalDist.toFixed(2)),
      estimatedTimeMin: Math.round(totalDist * 6),
      status: "pending",
      generatedBy: adminUserId,
    });

    return { route };
  },

  // Returns all collection routes for admin
  async getAll({ page = 1, limit = 20 } = {}) {
    await connectDB();
    const routes = await Route.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("assignedWorker", "name email")
      .lean();
    const total = await Route.countDocuments();
    return { routes, total };
  },

  // Assigns a route to a worker
  async assign(routeId, workerId) {
    await connectDB();
    const route = await Route.findByIdAndUpdate(
      routeId,
      { $set: { assignedWorker: workerId, status: "active" } },
      { new: true }
    );
    if (!route) throw Object.assign(new Error("Route not found"), { code: "NOT_FOUND" });
    return route;
  },

  // Returns worker's assigned active collection route
  async getWorkerRoute(workerId) {
    await connectDB();
    return Route.findOne({
      assignedWorker: workerId,
      status: { $in: ["active", "pending"] },
    })
      .sort({ createdAt: -1 })
      .lean();
  },
};

// Calculates shortest path sequence using greedy nearest-neighbor algorithm
function greedyRoute(bins) {
  if (bins.length === 0) return [];
  const unvisited = [...bins];
  const route = [unvisited.splice(0, 1)[0]];

  while (unvisited.length > 0) {
    const last = route[route.length - 1];
    let nearestIdx = 0;
    let minDist = Infinity;

    unvisited.forEach((b, i) => {
      const d = calculateDistance(last.lat, last.lng, b.lat, b.lng);
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    });

    route.push(unvisited.splice(nearestIdx, 1)[0]);
  }

  return route;
}

// Calculates total distance of ordered route sequence
function calculateTotalDistance(bins) {
  let total = 0;
  for (let i = 0; i < bins.length - 1; i++) {
    total += calculateDistance(bins[i].lat, bins[i].lng, bins[i + 1].lat, bins[i + 1].lng);
  }
  return total;
}
