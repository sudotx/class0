import express, { json } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import {
  requireAuth,
  checkUser,
  notFound,
  errorHandler,
} from "./middleware/middlewares.js";
import api from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(json());
// app.use(express.static("public"));
app.use(cookieParser());

// app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

// app.use("/api/v1", api);
app.use("/api/v1", requireAuth, api);

app.use("*", checkUser, notFound);

app.use(errorHandler);

export default app;
