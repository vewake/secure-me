import prisma from "./db";
import express from "express";
import { configDotenv } from "dotenv";
import { authRouter } from "./routes/auth.route";
import cors from "cors";
import { locationRouter } from "./routes/locationrouter";
import { alertRouter } from "./routes/alertroute";
import { userRouter } from "./routes/userRouter";

configDotenv();
const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use("/auth", authRouter);
app.use("/location", locationRouter);
app.use("/alert", alertRouter);
app.use("/user", userRouter);



const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
