import { NextResponse } from "next/server.js";
import { reportService } from "../services/report.service.js";

export const reportController = {
  // Handles HTTP POST request to submit a report
  async create(request, userId) {
    try {
      const body = await request.json().catch(() => ({}));
      if (!body.binId || !body.type) {
        return NextResponse.json({ error: "binId and type are required" }, { status: 400 });
      }
      const validTypes = ["overflow", "damaged", "missing", "blocked", "other"];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json({ error: `type must be one of: ${validTypes.join(", ")}` }, { status: 400 });
      }
      const report = await reportService.create({ ...body, reportedBy: userId });
      return NextResponse.json({ report, message: "Report submitted successfully" }, { status: 201 });
    } catch (err) {
      console.error("[Reports] create error:", err);
      return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
    }
  },

  // Handles HTTP GET request for user's own reports
  async getMyReports(userId) {
    try {
      const reports = await reportService.getMyReports(userId);
      return NextResponse.json({ reports, count: reports.length }, { status: 200 });
    } catch (err) {
      console.error("[Reports] getMyReports error:", err);
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
  },

  // Handles HTTP GET request for all reports (admin)
  async getAll(request) {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const status = searchParams.get("status") || null;
      const result = await reportService.getAll({ page, limit, status });
      return NextResponse.json(result, { status: 200 });
    } catch (err) {
      console.error("[Reports] getAll error:", err);
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
  },

  // Handles HTTP PATCH request to update report status (admin)
  async update(reportId, request) {
    try {
      const body = await request.json().catch(() => ({}));
      const report = await reportService.update(reportId, body);
      return NextResponse.json({ report }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Report not found" }, { status: 404 });
      console.error("[Reports] update error:", err);
      return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
    }
  },
};
