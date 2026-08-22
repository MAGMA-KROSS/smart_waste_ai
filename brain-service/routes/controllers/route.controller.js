import { NextResponse } from "next/server.js";
import { routeService } from "../services/route.service.js";

export const routeController = {
  // Handles HTTP POST request to generate collection route
  async generate(request, adminUserId) {
    try {
      const body = await request.json().catch(() => ({}));
      const result = await routeService.generate({
        adminUserId,
        minFillLevel: body.minFillLevel || 70,
      });
      if (!result.route) {
        return NextResponse.json({ message: result.message }, { status: 200 });
      }
      return NextResponse.json({ route: result.route }, { status: 201 });
    } catch (err) {
      console.error("[Routes] generate error:", err);
      return NextResponse.json({ error: "Failed to generate route" }, { status: 500 });
    }
  },

  // Handles HTTP GET request for all collection routes (admin)
  async getAll(request) {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const result = await routeService.getAll({ page, limit });
      return NextResponse.json(result, { status: 200 });
    } catch (err) {
      console.error("[Routes] getAll error:", err);
      return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
    }
  },

  // Handles HTTP POST request to assign route to worker (admin)
  async assign(routeId, request) {
    try {
      const body = await request.json().catch(() => ({}));
      if (!body.workerId) {
        return NextResponse.json({ error: "workerId is required" }, { status: 400 });
      }
      const route = await routeService.assign(routeId, body.workerId);
      return NextResponse.json({ route, message: "Route assigned" }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Route not found" }, { status: 404 });
      console.error("[Routes] assign error:", err);
      return NextResponse.json({ error: "Failed to assign route" }, { status: 500 });
    }
  },

  // Handles HTTP GET request for worker's assigned route
  async getWorkerRoute(workerId) {
    try {
      const route = await routeService.getWorkerRoute(workerId);
      return NextResponse.json({ route }, { status: 200 });
    } catch (err) {
      console.error("[Routes] getWorkerRoute error:", err);
      return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 });
    }
  },
};
