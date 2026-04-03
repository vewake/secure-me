import { Router } from "express";
import { verifyToken } from "../controllers/locationControler";
import { chagePassword, updateUserInfo, userInfo } from "../controllers/userController";
const userRouter = Router();
userRouter.get("/info", verifyToken, userInfo)
userRouter.put("/update", verifyToken, updateUserInfo)
userRouter.post("/changepass", verifyToken, chagePassword)



export { userRouter as userRouter };
