import connectDB from "@/lib/mongodb.js";
import Report from "@/models/Report.js";

const inMemoryReports = [];

export const reportService = {
  // Creates a citizen or worker bin report
  async create({ reportedBy, binId, binName, type, description }) {
    try {
      const conn = await connectDB();
      if (conn) {
        return await Report.create({
          reportedBy,
          binId,
          binName: binName || "",
          type,
          description: description || "",
          status: "pending",
        });
      }
    } catch (err) {
      console.warn("MongoDB report creation warning:", err.message);
    }

    const mockReport = {
      _id: `report_mem_${Date.now()}`,
      reportedBy,
      binId,
      binName: binName || "",
      type,
      description: description || "",
      status: "pending",
      createdAt: new Date(),
    };
    inMemoryReports.unshift(mockReport);
    return mockReport;
  },

  // Returns reports submitted by current authenticated user
  async getMyReports(userId) {
    try {
      const conn = await connectDB();
      if (conn) {
        const reports = await Report.find({ reportedBy: userId })
          .sort({ createdAt: -1 })
          .lean();
        if (reports && reports.length > 0) return reports;
      }
    } catch (err) {
      console.warn("MongoDB getMyReports warning:", err.message);
    }

    return inMemoryReports.filter(
      (r) => r.reportedBy === userId || r.reportedBy?.toString() === userId?.toString()
    );
  },

  // Returns all reports for admin review
  async getAll({ page = 1, limit = 20, status } = {}) {
    try {
      const conn = await connectDB();
      if (conn) {
        const query = {};
        if (status) query.status = status;

        const reports = await Report.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        const total = await Report.countDocuments(query);
        return { reports, total };
      }
    } catch (err) {
      console.warn("MongoDB getAll reports warning:", err.message);
    }

    return { reports: inMemoryReports, total: inMemoryReports.length };
  },

  // Updates report status or notes
  async update(reportId, { status, assignedTo, adminNotes }) {
    try {
      const conn = await connectDB();
      if (conn) {
        const updateObj = {};
        if (status) updateObj.status = status;
        if (assignedTo) updateObj.assignedTo = assignedTo;
        if (adminNotes !== undefined) updateObj.adminNotes = adminNotes;
        if (status === "resolved") updateObj.resolvedAt = new Date();

        const report = await Report.findByIdAndUpdate(reportId, { $set: updateObj }, { new: true });
        if (report) return report;
      }
    } catch (err) {
      console.warn("MongoDB update report warning:", err.message);
    }

    const memReport = inMemoryReports.find((r) => r._id === reportId);
    if (memReport) {
      if (status) memReport.status = status;
      if (adminNotes) memReport.adminNotes = adminNotes;
      return memReport;
    }

    throw Object.assign(new Error("Report not found"), { code: "NOT_FOUND" });
  },
};
