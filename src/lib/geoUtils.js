/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Formats distance into meters if < 1km, otherwise kilometers with 1 decimal place.
 */
export function formatDistance(distKm) {
  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return `${meters} m`;
  }
  return `${distKm.toFixed(1)} km`;
}

/**
 * Estimates walking time in minutes based on average walking speed of 4.8 km/h (80 m/min).
 */
export function calculateWalkingTime(distKm) {
  const mins = Math.max(1, Math.round((distKm / 4.8) * 60));
  return `${mins} min`;
}

/**
 * Finds the nearest suitable bin from a user location, optionally filtered by category.
 */
export function findNearestBin(userLat, userLng, bins, category = 'all') {
  if (!bins || bins.length === 0) return null;

  let candidates = bins;
  if (category && category !== 'all') {
    candidates = bins.filter(
      (b) => b.category.toLowerCase() === category.toLowerCase() || b.wasteType.toLowerCase() === category.toLowerCase()
    );
  }

  if (candidates.length === 0) candidates = bins; // Fallback to any bin if category has no match

  let nearest = null;
  let minDistance = Infinity;

  candidates.forEach((bin) => {
    const dist = calculateDistance(userLat, userLng, bin.lat, bin.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...bin, distanceKm: dist };
    }
  });

  return nearest;
}

/**
 * Dynamically generates realistic nearby smart bins around any user GPS location
 * so that no matter where the user is physically located, dustbins appear within 100m - 500m.
 */
export function generateBinsAroundLocation(userLat, userLng, locationName = "Your Area") {
  const offsets = [
    { dLat: 0.0012, dLng: 0.0015, name: `${locationName} Main Gate Bin`, cat: "recyclable", fill: 42, type: "Plastic & Beverage Cans", items: ["PET Bottles", "Aluminium Cans", "Soda Cans"] },
    { dLat: -0.0015, dLng: -0.0010, name: `${locationName} Market Organic Hub`, cat: "organic", fill: 68, type: "Organic & Food Waste", items: ["Food Scraps", "Fruit Peels", "Tea Leaves"] },
    { dLat: 0.0020, dLng: -0.0018, name: `${locationName} Public Transit Bin`, cat: "general", fill: 89, type: "General Litter", items: ["Mixed Trash", "Wrappers", "Napkins"] },
    { dLat: -0.0008, dLng: 0.0022, name: `${locationName} Tech Park E-Waste Drop`, cat: "ewaste", fill: 25, type: "Electronic Waste", items: ["Cables", "Batteries", "Accessories"] },
    { dLat: 0.0025, dLng: 0.0008, name: `${locationName} Promenade Glass Collection`, cat: "glass", fill: 74, type: "Glass & Jars", items: ["Glass Bottles", "Jar Containers"] },
    { dLat: -0.0022, dLng: 0.0012, name: `${locationName} Sector Green Recycler`, cat: "recyclable", fill: 35, type: "Paper & Plastics", items: ["Paper", "Cardboard", "Plastics"] },
  ];

  return offsets.map((off, idx) => ({
    id: `BIN-LIVE-${100 + idx}`,
    name: off.name,
    lat: userLat + off.dLat,
    lng: userLng + off.dLng,
    address: `Near ${locationName}`,
    area: locationName,
    category: off.cat,
    wasteType: off.type,
    fillLevel: off.fill,
    capacityLiters: 180,
    lastCollected: `${idx + 1} hours ago`,
    suitableItems: off.items,
    sensorStatus: "Online",
  }));
}

/**
 * Reverse Geocode coordinates to human-readable street/area name using OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      const mainName = addr.road || addr.suburb || addr.neighbourhood || addr.amenity || addr.building || addr.city_district || "Current Location";
      const city = addr.city || addr.town || addr.county || "Noida";
      return `${mainName}, ${city}`;
    }
  } catch (err) {
    console.error("Reverse geocoding error:", err);
  }
  return `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

/**
 * Gets fill level status metadata (color, label, badge style)
 */
export function getFillStatus(fillLevel) {
  if (fillLevel >= 80) {
    return {
      status: 'Nearly Full',
      color: 'red',
      bgColor: 'bg-rose-500',
      textColor: 'text-rose-700',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
      iconColor: '#EF4444',
      hex: '#EF4444',
    };
  }
  if (fillLevel >= 60) {
    return {
      status: 'Partially Full',
      color: 'yellow',
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
      iconColor: '#F59E0B',
      hex: '#F59E0B',
    };
  }
  return {
    status: 'Available',
    color: 'green',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    iconColor: '#10B981',
    hex: '#10B981',
  };
}

/**
 * Calls our walking route service to get the shortest practical pedestrian path
 */
export async function fetchWalkingRoute(originLat, originLng, destLat, destLng) {
  try {
    const url = `/api/route/walking?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Route calculation failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("fetchWalkingRoute error:", err);
    throw err;
  }
}

/**
 * Builds external navigation links (Google Maps walking mode)
 */
export function getNavigationUrl(originLat, originLng, destLat, destLng, label = "Dustbin") {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=walking`;
}

