import { NextResponse } from "next/server";

// Helper to format OSRM step maneuver into human-friendly walking instructions
function formatStepInstruction(step, index, totalSteps) {
  const maneuver = step.maneuver || {};
  const type = maneuver.type || "";
  const modifier = maneuver.modifier || "";
  const streetName = step.name ? step.name.trim() : "";
  const distanceMeters = Math.round(step.distance || 0);

  if (index === 0 || type === "depart") {
    return {
      type: "depart",
      instruction: streetName
        ? `Start walking along ${streetName}`
        : "Start walking towards the dustbin location",
      distance: distanceMeters > 0 ? `${distanceMeters} m` : "Start",
      distanceMeters,
      durationSeconds: Math.round(step.duration || 0),
    };
  }

  if (index === totalSteps - 1 || type === "arrive") {
    return {
      type: "arrive",
      instruction: "Arrive at the destination dustbin",
      distance: `${distanceMeters} m`,
      distanceMeters,
      durationSeconds: Math.round(step.duration || 0),
    };
  }

  let actionText = "Continue";
  if (type === "turn" || type === "end of road") {
    if (modifier === "left" || modifier === "sharp left" || modifier === "slight left") {
      actionText = `Turn ${modifier}`;
    } else if (modifier === "right" || modifier === "sharp right" || modifier === "slight right") {
      actionText = `Turn ${modifier}`;
    } else if (modifier === "uturn") {
      actionText = "Make a U-turn";
    } else if (modifier === "straight") {
      actionText = "Go straight";
    } else {
      actionText = "Turn";
    }
  } else if (type === "continue" || type === "new name") {
    actionText = modifier ? `Continue ${modifier}` : "Continue straight";
  } else if (type === "fork") {
    actionText = modifier ? `Take the ${modifier} fork` : "Keep on walkway";
  } else if (type === "roundabout" || type === "rotary") {
    actionText = "Take roundabout";
  }

  const target = streetName ? ` onto ${streetName}` : "";

  return {
    type: modifier || type || "continue",
    instruction: `${actionText}${target}`,
    distance: `${distanceMeters} m`,
    distanceMeters,
    durationSeconds: Math.round(step.duration || 0),
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const originLat = parseFloat(searchParams.get("originLat"));
    const originLng = parseFloat(searchParams.get("originLng"));
    const destLat = parseFloat(searchParams.get("destLat"));
    const destLng = parseFloat(searchParams.get("destLng"));

    if (
      isNaN(originLat) ||
      isNaN(originLng) ||
      isNaN(destLat) ||
      isNaN(destLng)
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates provided. originLat, originLng, destLat, destLng are required numbers." },
        { status: 400 }
      );
    }

    // Call OSRM public walking routing service
    const osrmUrl = `https://router.project-osrm.org/route/v1/walking/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let osrmData = null;
    try {
      const response = await fetch(osrmUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "SmartWasteAI-PedestrianRouter/1.0",
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        osrmData = await response.json();
      }
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      console.warn("OSRM fetch error or timeout, falling back:", fetchErr.message);
    }

    if (osrmData && osrmData.code === "Ok" && osrmData.routes && osrmData.routes.length > 0) {
      // Pick best walking route (lowest duration / distance)
      const route = osrmData.routes.reduce((best, current) => {
        return current.distance < best.distance ? current : best;
      }, osrmData.routes[0]);

      // OSRM GeoJSON coordinates are [lng, lat] -> convert to Leaflet [lat, lng]
      const coordinates = (route.geometry?.coordinates || []).map(([lng, lat]) => [
        lat,
        lng,
      ]);

      const distanceMeters = Math.round(route.distance);
      // Standard human walking pace (~4.5 - 4.8 km/h, approx. 75-80 meters/min)
      const durationMinutes = Math.max(1, Math.round(distanceMeters / 75));
      const durationSeconds = durationMinutes * 60;

      const rawSteps = route.legs?.[0]?.steps || [];
      const steps = rawSteps.map((step, idx) =>
        formatStepInstruction(step, idx, rawSteps.length)
      );

      return NextResponse.json({
        success: true,
        source: "osrm_walking",
        distanceMeters,
        distanceText: distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters} m`,
        durationSeconds,
        durationMinutes,
        durationText: `${durationMinutes} min`,
        coordinates,
        steps,
      });
    }

    // Fallback if OSRM is down, unreachable, or returns no route
    // Calculate practical walkable path with realistic road curve points
    const dLat = destLat - originLat;
    const dLng = destLng - originLng;
    const fallbackCoords = [
      [originLat, originLng],
      [originLat + dLat * 0.35, originLng + dLng * 0.05],
      [originLat + dLat * 0.7, originLng + dLng * 0.65],
      [destLat, destLng],
    ];

    // Haversine fallback
    const R = 6371;
    const dLatRad = (dLat * Math.PI) / 180;
    const dLngRad = (dLng * Math.PI) / 180;
    const a =
      Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
      Math.cos((originLat * Math.PI) / 180) *
        Math.cos((destLat * Math.PI) / 180) *
        Math.sin(dLngRad / 2) *
        Math.sin(dLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistKm = R * c;
    const walkingDistMeters = Math.round(straightDistKm * 1.25 * 1000); // 25% curve factor for pedestrian paths
    const walkingDurationMin = Math.max(1, Math.round((walkingDistMeters / 80))); // ~80 m/min

    return NextResponse.json({
      success: true,
      source: "pedestrian_approximation",
      distanceMeters: walkingDistMeters,
      distanceText: walkingDistMeters >= 1000 ? `${(walkingDistMeters / 1000).toFixed(1)} km` : `${walkingDistMeters} m`,
      durationSeconds: walkingDurationMin * 60,
      durationMinutes: walkingDurationMin,
      durationText: `${walkingDurationMin} min`,
      coordinates: fallbackCoords,
      steps: [
        {
          type: "depart",
          instruction: "Start walking along the sidewalk pathway",
          distance: `${Math.round(walkingDistMeters * 0.2)} m`,
        },
        {
          type: "continue",
          instruction: "Follow pedestrian walkway towards the dustbin area",
          distance: `${Math.round(walkingDistMeters * 0.6)} m`,
        },
        {
          type: "arrive",
          instruction: "Arrive at destination dustbin",
          distance: `${Math.round(walkingDistMeters * 0.2)} m`,
        },
      ],
    });
  } catch (error) {
    console.error("Walking route API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate walking route", details: error.message },
      { status: 500 }
    );
  }
}
