import { NextResponse } from "next/server.js";
import { binService } from "../services/bin.service.js";

export const binController = {
  // Handles HTTP GET request for nearby bins
  async getNearby(request) {
    try {
      const { searchParams } = new URL(request.url);
      const lat = parseFloat(searchParams.get("lat"));
      const lng = parseFloat(searchParams.get("lng"));
      const radiusKm = parseFloat(searchParams.get("radius") || "5");
      const category = searchParams.get("category") || "all";

      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ error: "lat and lng query parameters are required" }, { status: 400 });
      }

      const bins = await binService.getNearby({ lat, lng, radiusKm, category });
      return NextResponse.json({ bins, count: bins.length }, { status: 200 });
    } catch (err) {
      console.error("[Bins] getNearby error:", err);
      return NextResponse.json({ error: "Failed to fetch nearby bins" }, { status: 500 });
    }
  },

  // Handles HTTP GET request for single bin by ID
  async getById(id) {
    try {
      const bin = await binService.getById(id);
      if (!bin) return NextResponse.json({ error: "Bin not found" }, { status: 404 });
      return NextResponse.json({ bin }, { status: 200 });
    } catch (err) {
      console.error("[Bins] getById error:", err);
      return NextResponse.json({ error: "Failed to fetch bin" }, { status: 500 });
    }
  },

  // Handles HTTP GET request for all bins
  async getAll(request) {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const category = searchParams.get("category") || null;
      const result = await binService.getAll({ page, limit, category });
      return NextResponse.json(result, { status: 200 });
    } catch (err) {
      console.error("[Bins] getAll error:", err);
      return NextResponse.json({ error: "Failed to fetch bins" }, { status: 500 });
    }
  },

  // Handles HTTP POST request to create a bin
  async create(request, adminUserId) {
    try {
      const body = await request.json().catch(() => ({}));
      if (!body.name || !body.lat || !body.lng || !body.category) {
        return NextResponse.json({ error: "name, lat, lng, and category are required" }, { status: 400 });
      }
      const bin = await binService.create(body, adminUserId);
      return NextResponse.json({ bin }, { status: 201 });
    } catch (err) {
      console.error("[Bins] create error:", err);
      return NextResponse.json({ error: "Failed to create bin" }, { status: 500 });
    }
  },

  // Handles HTTP PATCH request to update a bin
  async update(id, request) {
    try {
      const body = await request.json().catch(() => ({}));
      const bin = await binService.update(id, body);
      return NextResponse.json({ bin }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Bin not found" }, { status: 404 });
      console.error("[Bins] update error:", err);
      return NextResponse.json({ error: "Failed to update bin" }, { status: 500 });
    }
  },

  // Handles HTTP DELETE request to remove a bin
  async remove(id) {
    try {
      await binService.remove(id);
      return NextResponse.json({ message: "Bin removed successfully" }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Bin not found" }, { status: 404 });
      console.error("[Bins] remove error:", err);
      return NextResponse.json({ error: "Failed to remove bin" }, { status: 500 });
    }
  },

  // Handles HTTP PATCH request to mark bin collected
  async markCollected(binId, workerId) {
    try {
      const bin = await binService.markCollected(binId, workerId);
      return NextResponse.json({ bin, message: "Bin marked as collected" }, { status: 200 });
    } catch (err) {
      if (err.code === "NOT_FOUND") return NextResponse.json({ error: "Bin not found" }, { status: 404 });
      console.error("[Bins] markCollected error:", err);
      return NextResponse.json({ error: "Failed to update collection status" }, { status: 500 });
    }
  },
};
