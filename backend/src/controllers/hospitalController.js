import { findNearbyFacilities } from "../services/hospitalService.js";

export async function getNearbyHospitals(req, res) {
  if (req.query.lat === undefined || req.query.lng === undefined) {
    return res.status(400).json({ error: "Valid lat and lng are required." });
  }

  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < -90 || lat > 90 || lng < -180 || lng > 180
  ) {
    return res.status(400).json({ error: "Valid lat and lng are required." });
  }

  try {
    const facilities = await findNearbyFacilities(lat, lng);
    res.json({ facilities });
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ error: "Could not load nearby hospitals right now." });
  }
}