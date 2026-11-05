import { Router } from "express";
import { runCheck } from "../controllers/checkController.js";

const router = Router();

router.post("/", runCheck);

export default router; 