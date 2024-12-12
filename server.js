require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./middlewares/errorHandler");
const connectDB = require("./config/db/connectDB");

// IMPORT ROUTES
const FunRoutes = require("./routes/fun.routes");

// INITIALIZE APP INSTANCE
const app = express();

// CONNECT TO DB
connectDB();

// IMPORT CLOUDINARY CONFIGURATIONS
require("./services/cloudinary"); // This will load cloudinary configuration

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// DEVELOPMENT LOGGER
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ROUTES INITIALIZATION
app.get("/api/v1", (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to capital turk API...",
  });
});

app.use("/api/v1/fun", FunRoutes);

// INVALID ROUTE HANDLING
app.all("*", (req, res, next) => {
  return next(
    new AppError(`Cannot find ${req.originalUrl} on this server`, 404)
  );
});

// GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

app.listen(process.env.PORT || 2000, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
