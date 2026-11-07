import { Router } from "express";
import { getNearbyHospitals } from "../controllers/hospitalController.js";

const router = Router();

router.get("/", getNearbyHospitals);

export default router;