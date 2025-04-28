import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";
import morgan from "morgan";

import dotenv from "dotenv";
import { errorHandler } from "./middleware/middlewares.js";
import api from "./routes/index.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(morgan("dev"));
app.use(helmet());
app.use(json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    status: "server currently running",
    time: new Date().toISOString(),
  });
});

app.use("/api", api);

app.use("*", (req, res) => {
  res.status(404).json({
    message: "Resource not found",
  });
});

app.use(errorHandler);

export default app;
