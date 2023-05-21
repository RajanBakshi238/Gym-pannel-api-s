require("dotenv").config({ path: "./config.env" });
require("express-async-errors");

const path = require("path");

const express = require("express");
const app = express();

const connectDB = require("./db/connect");

// routers
const authRouter = require("./routes/auth");

// error handler
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());

app.use("/api/v1/auth", authRouter);

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
