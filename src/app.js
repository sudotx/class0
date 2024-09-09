const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const middlewares = require("./middleware/middlewares");
const api = require("./routes");

require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
// app.use(express.static("public"));
app.use(cookieParser());

// app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

// app.use("/api/v1", api);
app.use("/api/v1", middlewares.requireAuth, api);

app.use("*", middlewares.checkUser, middlewares.notFound);

app.use(middlewares.errorHandler);

module.exports = app;
