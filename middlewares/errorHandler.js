const sendDevError = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    errorStackTrace: error.stack,
  });
};

const sendProdError = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(error.statusCode || 500).json({
      status: error.status || "error",
      message: error.message || "Something went wrong",
    });
  }
};

const globalErrorHandler = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };
    error.name = err.name;
    sendProdError(error, res);
  }

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  }
};

module.exports = globalErrorHandler;
