const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Try each map server in turn until one answers
async function queryMapServers(query) {
  let lastError;

  for (const url of OVERPASS_URLS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "HealthSymptomChecker/0.1",
        },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Map server error ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      lastError = err;
      console.error(`Map server failed (${url}): ${err.message}`);
    }
  }

  throw lastError;
}

export async function findNearbyFacilities(lat, lng, radiusMeters = 10000) {
  const query = `[out:json][timeout:12];
nwr["amenity"~"hospital|clinic"](around:${radiusMeters},${lat},${lng});
out center 40;`;

  const data = await queryMapServers(query);

  return data.elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (elLat === undefined || elLng === undefined) return null;
      const tags = el.tags || {};
      return {
        name: tags.name || null,
        type: tags.amenity,
        phone: tags.phone || tags["contact:phone"] || null,
        lat: elLat,
        lng: elLng,
        distance_km: Math.round(distanceKm(lat, lng, elLat, elLng) * 10) / 10,
      };
    })
    .filter((f) => f && f.name)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 10);
}