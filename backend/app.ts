import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { initializePassport } from "./module/passport";
import { setupCors } from "./config/corsConfig";
import { setupExpress } from "./config/expressConfig";
import { setupSession } from "./config/sessionConfig";
import http from "http";
import "./cron/imageRetry";
const PORT = 9988;
const app = express();

setupExpress(app); // express 설정 & rate limit
setupCors(app); // cors & Helmet 설정
setupSession(app); // cookie & session 설정
initializePassport(app); // passport 초기화

// router
import authRouter from "./router/auth";
import contentRouter from "./router/content";
import adminRouter from "./router/admin";

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/content", contentRouter);

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// 서버 실행
http.createServer(app).listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
