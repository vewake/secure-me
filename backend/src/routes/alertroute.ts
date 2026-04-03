import { Router } from "express";
import { verifyToken } from "../controllers/locationControler";
import { allAlertInfo, createNewAlert, sendAudio, sendImage, sendLocation } from "../controllers/alertControlers";

const router = Router();
// new alert 
router.get("/new", verifyToken, createNewAlert)
router.post("/sendimage", verifyToken, sendImage)
router.post("/sendaudio", verifyToken, sendAudio)
router.get('/:accessCode', allAlertInfo);
router.post("/sendlocation", verifyToken, sendLocation)
export { router as alertRouter };
