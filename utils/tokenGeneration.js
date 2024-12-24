require("dotenv").config({ path: "./../.env" });
const jwt = require("jsonwebtoken");

exports.generateAccessToken = (user) => {
  // Generate a JWT token with the user's id
  const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
  return token;
};

exports.generateAndSendRefreshToken = (user, res) => {
  // Generate a JWT token with the user's id
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    // secure: process.env.NODE_ENV === "production",
    // sameSite: "None",
    maxAge: process.env.REFRESH_TOKEN_COOKIE_EXPIRATION,
  });
};
