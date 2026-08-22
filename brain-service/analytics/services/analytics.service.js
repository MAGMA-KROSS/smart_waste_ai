import connectDB from "../../../src/lib/mongodb.js";
import Bin from "../../../src/models/Bin.js";
import Report from "../../../src/models/Report.js";
import Worker from "../../../src/models/Worker.js";
import User from "../../../src/models/User.js";
import Route from "../../../src/models/Route.js";
import { MOCK_BINS } from "../../../src/lib/mockBins.js";

export const analyticsService = {
  // Returns summary metrics for municipal command dashboard
  async getDashboard() {
    let totalBins = 0;
    let totalReports = 0;
    let totalWorkers = 0;
    let totalRoutes = 0;
    let criticalBins = 0;
    let pendingReports = 0;
    let activeRoutes = 0;

    try {
      const conn = await connectDB();
      if (conn) {
        [totalBins, totalReports, totalWorkers, totalRoutes] = await Promise.all([
          Bin.countDocuments({ isActive: true }),
          Report.countDocuments(),
          User.countDocuments({ role: "worker", isActive: true }),
          Route.countDocuments(),
        ]);

        criticalBins = await Bin.countDocuments({ fillLevel: { $gte: 80 }, isActive: true });
        pendingReports = await Report.countDocuments({ status: "pending" });
        activeRoutes = await Route.countDocuments({ status: "active" });
      }
    } catch (err) {
      console.warn("Analytics DB query warning:", err.message);
    }

    const binsCount = totalBins || MOCK_BINS.length;
    const criticalCount = criticalBins || MOCK_BINS.filter((b) => b.fillLevel >= 80).length;
    const avgFillLevel = Math.round(
      MOCK_BINS.reduce((a, b) => a + b.fillLevel, 0) / MOCK_BINS.length
    );

    return {
      totalBins: binsCount,
      criticalBins: criticalCount,
      availableBins: binsCount - criticalCount,
      averageFillLevel: avgFillLevel,
      totalReports: totalReports || 0,
      pendingReports: pendingReports || 0,
      totalWorkers: totalWorkers || 0,
      activeRoutes: activeRoutes || 0,
      totalRoutes: totalRoutes || 0,
    };
  },

  // Returns detailed breakdown metrics by category and status
  async getAnalytics() {
    let reportsByStatus = [];
    let reportsByType = [];
    let binsByCategory = [];

    try {
      const conn = await connectDB();
      if (conn) {
        reportsByStatus = await Report.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        reportsByType = await Report.aggregate([
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]);
        binsByCategory = await Bin.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: "$category", count: { $sum: 1 }, avgFill: { $avg: "$fillLevel" } } },
        ]);
      }
    } catch (err) {
      console.warn("Analytics detailed query warning:", err.message);
    }

    return {
      reportsByStatus,
      reportsByType,
      binsByCategory:
        binsByCategory.length > 0
          ? binsByCategory
          : Object.entries(
              MOCK_BINS.reduce((acc, b) => {
                acc[b.category] = (acc[b.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([_id, count]) => ({ _id, count })),
      completedRoutes: 0,
      totalBinsCollected: 0,
    };
  },
};
