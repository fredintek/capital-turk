const AppError = require("../utils/AppError");

exports.restrictRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to access this route", 401)
      );
    }
    next();
  };
};
