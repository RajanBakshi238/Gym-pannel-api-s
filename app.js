require("dotenv").config({ path: "./config.env" });
require("express-async-errors");

const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const option = require("./docs/swaggerOptions");

const express = require("express");
const app = express();

// const swaggerDocument = require('./docs/apidoc')
const connectDB = require("./db/connect");

// routers
const authRouter = require("./routes/auth");

// error handler
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(cors());

app.use(express.json());

app.use("/api/v1/auth", authRouter);

app.use(errorHandlerMiddleware);

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const specs = swaggerJsDoc(option);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

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
