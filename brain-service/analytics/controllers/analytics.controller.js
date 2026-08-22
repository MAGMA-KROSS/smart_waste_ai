import { NextResponse } from "next/server.js";
import { analyticsService } from "../services/analytics.service.js";

export const analyticsController = {
  // Handles HTTP GET request for admin dashboard metrics
  async getDashboard() {
    try {
      const data = await analyticsService.getDashboard();
      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      console.error("[Analytics] dashboard error:", err);
      return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
  },

  // Handles HTTP GET request for detailed analytics
  async getAnalytics() {
    try {
      const data = await analyticsService.getAnalytics();
      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      console.error("[Analytics] analytics error:", err);
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
  },
};
