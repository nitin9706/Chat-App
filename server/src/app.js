import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import { initializeSocket } from "./sockets/socket.js";
import cors from "cors";
const app = express();

const httpServer = http.createServer(app);

initializeSocket(httpServer);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

import userRouter from "./routes/user.route.js";
import chatRouter from "./routes/chat.route.js";
import messgaeRouter from "./routes/message.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messgaeRouter);

export { app, httpServer };
