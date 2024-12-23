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
const UserRoutes = require("./routes/user.routes");
const ShowcaseRoutes = require("./routes/showcase.routes");
const TodayRoutes = require("./routes/today.routes");
const BroadcastFlowRoutes = require("./routes/broadcastFlow.routes");
const CommunicationRoutes = require("./routes/communication.routes");

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

// Define allowed origin
const corsOptions = {
  origin: "http://localhost:3001", // frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));

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
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/showcase", ShowcaseRoutes);
app.use("/api/v1/today", TodayRoutes);
app.use("/api/v1/broadcast-flow", BroadcastFlowRoutes);
app.use("/api/v1/communication", CommunicationRoutes);

// INVALID ROUTE HANDLING
app.all("*", (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError(`Something went wrong`, 500));
  } else {
    return next(
      new AppError(`Cannot find ${req.originalUrl} on this server`, 404)
    );
  }
});

// GLOBAL ERROR HANDLING
app.use(globalErrorHandler);

app.listen(process.env.PORT || 2000, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
