import { NextResponse } from "next/server.js";
import { workerService } from "../services/worker.service.js";

export const workerController = {
  // Handles HTTP GET request for worker's own profile
  async getProfile(userId) {
    try {
      const profile = await workerService.getProfile(userId);
      return NextResponse.json({ profile }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Worker profile not found" }, { status: 404 });
      console.error("[Worker] getProfile error:", err);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
  },

  // Handles HTTP GET request for all workers (admin)
  async getAll(request) {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const result = await workerService.getAll({ page, limit });
      return NextResponse.json(result, { status: 200 });
    } catch (err) {
      console.error("[Worker] getAll error:", err);
      return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 });
    }
  },

  // Handles HTTP PATCH request to update worker (admin)
  async update(workerId, request) {
    try {
      const body = await request.json().catch(() => ({}));
      const worker = await workerService.update(workerId, body);
      return NextResponse.json({ worker }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Worker not found" }, { status: 404 });
      console.error("[Worker] update error:", err);
      return NextResponse.json({ error: "Failed to update worker" }, { status: 500 });
    }
  },

  // Handles HTTP DELETE request to deactivate worker (admin)
  async deactivate(workerId) {
    try {
      await workerService.deactivate(workerId);
      return NextResponse.json({ message: "Worker deactivated" }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Worker not found" }, { status: 404 });
      console.error("[Worker] deactivate error:", err);
      return NextResponse.json({ error: "Failed to deactivate worker" }, { status: 500 });
    }
  },
};
