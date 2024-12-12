const jwt = require("jsonwebtoken");
const User = require("./../models/user.models");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const isAuthenticated = catchAsync(async (req, res, next) => {
  // CHECK IF THERE IS COOKIES
  if (!req.cookies.jwt) {
    return next(new AppError("You are unauthorized", 401));
  }

  // GET THE REQUEST HEADERS
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader.startsWith("Bearer ")) {
    return next(new AppError("You are unauthorized", 401));
  }

  // EXTRACT ACCESS TOKEN
  const accessToken = authHeader.split(" ")[1];

  try {
    // VERIFY ACCESS TOKEN
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // FIND USER AND VERIFY EXISTENCE
    const foundUser = await User.findById(decoded.id);

    if (!foundUser) {
      return next(
        new AppError(
          "The user belonging to this token no longer exists or is inactive.",
          400
        )
      );
    }

    // CHECK IF PASSWORD HAS CHANGED AFTER TOKEN ISSUED
    if (foundUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "Your password has been changed. Please log in again.",
          400
        )
      );
    }

    // GRANT ACCESS
    req.user = foundUser;
    next();
  } catch (err) {
    return next(
      new AppError("Invalid or expired token. Please log in again.", 403)
    );
  }
});

module.exports = isAuthenticated;
