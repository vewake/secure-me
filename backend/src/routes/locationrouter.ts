import { Router } from "express";
import { getLocationHistory, location, nearbyUers, verifyToken } from "../controllers/locationControler";
const router = Router();
router.post("/pushlocation", verifyToken, location);
router.get("/getlocationhistory", verifyToken, getLocationHistory);
router.get("/nearbyuser", verifyToken, nearbyUers);

export { router as locationRouter };

