const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateAndSendRefreshToken,
} = require("../utils/tokenGeneration");
const User = require("../models/user.models");
const Email = require("../services/email");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // get all users
  const users = await User.find({});

  res.status(200).json({
    status: "success",
    message: "Users retrieved successfully",
    data: users,
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  // LOGIN WITH EMAIL AND PASSWORD
  const { email, password: userPassword } = req.body;

  // CHECK IF FIELDS ARE PROVIDED
  if (!email || !userPassword) {
    return next(new AppError("All fields are required", 401));
  }

  // GET USER WITH THESE CREDENTIALS
  const foundUser = await User.findOne({ email }).select("+password");

  // CHECK IF USER EXISTS OR IS ACTIVE
  if (!foundUser) {
    return next(new AppError("User not found"));
  }

  // CHECK IF PASSWORD MATCH
  const passwordMatch = await foundUser.comparePassword(userPassword);
  if (!passwordMatch) {
    return next(new AppError("Invalid password", 401));
  }

  // REMOVE SENSITIVE FIELDS FROM RESPONSE
  const { password, createdAt, updatedAt, __v, ...userWithoutSensitiveFields } =
    foundUser.toObject();

  // CREATE REFRESH AND ACCESS TOKEN
  const accessToken = generateAccessToken(foundUser);
  generateAndSendRefreshToken(foundUser, res);

  res.status(200).json({
    status: "success",
    message: "Logged in successfully",
    data: {
      token: accessToken,
      user: userWithoutSensitiveFields,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  // check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already exists", 400));
  }

  // create new user
  await new User({ email, password, role }).save();

  res.status(201).json({
    status: "success",
    message: "User created successfully",
  });
});

exports.refreshAccess = catchAsync(async (req, res, next) => {
  // GET REFRESH TOKEN FROM COOKIE
  const refreshToken = req.cookies.jwt;

  // CHECK IF REFRESH TOKEN IS VALID
  if (!refreshToken) {
    return next(new AppError("You are unauthorized", 401));
  }

  try {
    // VERIFY REFRESH TOKEN
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // CHECK IF USER EXISTS
    const foundUser = await User.findById(decoded.id);
    if (!foundUser) {
      return next(new AppError("User not found", 404));
    }

    // CHECK IF PASSWORD HAS CHANGED AFTER TOKEN ISSUED
    if (foundUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("Password changed. Please login again.", 401));
    }

    // GENERATE NEW ACCESS TOKEN
    const newAccessToken = generateAccessToken(foundUser);

    // SEND ACCESS TOKEN
    res.status(200).json({
      status: "success",
      message: "Access token refreshed successfully.",
      data: {
        token: newAccessToken,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: "Refresh token failed",
    });
    // return new AppError("Invalid or expired token. Please log in again.", 401);
  }
});

exports.logout = catchAsync(async (req, res, next) => {
  // If no JWT cookie exists, return a 204 No Content response
  if (!req.cookies.jwt) {
    return res.status(204).json({
      status: "success",
      message: "No active session to log out from",
    });
  }

  // Clear the JWT cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "None",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  // Delete the user's account
  const foundUser = await User.findById(userId);
  if (!foundUser) {
    return next(new AppError("User not found", 404));
  }

  // delete the user
  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: "success",
    message: "Profile deleted successfully",
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // GET USER BY EMAIL
  const { email } = req.body;
  if (!email)
    return next(new AppError("Please provide a valid email address", 400));

  const user = await User.findOne({ email });

  // CHECK IF USER EXISTS
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // GENERATE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // CREATE RESET URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/reset-password/${resetToken}`;

  // TODO: SEND RESET PASSWORD EMAIL
  try {
    await new Email(user, resetUrl).sendResetPassword();
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiration = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Reset password email sent successfully",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // GET USER BY RESET TOKEN
  const { resetToken } = req.params;
  const { password } = req.body;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiration: { $gt: Date.now() },
  });

  // IF TOKEN HAS NOT EXPIRED, AND THERE IS A USER, SET THE NEW PASSWORD
  if (!user) {
    return next(new AppError("Invalid token or token has expired", 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiration = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  // get user from database
  const foundUser = await User.findById(userId);
  if (!foundUser) {
    return next(new AppError("User not found", 404));
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "profilePicture"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return next(new AppError("Invalid data entry", 400));
  }

  let updateUserObj = {
    username: req.body.username || foundUser.username,
  };

  if (req.file && req.file.buffer) {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "capital-turk/user",
        },
        async (error, result) => {
          if (error) {
            return next(new AppError("Image upload failed", 500));
          }

          // delete previous user image
          if (foundUser.profilePicture.public_id) {
            await cloudinary.uploader.destroy(
              foundUser.profilePicture.public_id
            );
          }

          const updatedUserData = await User.findByIdAndUpdate(
            userId,
            {
              ...updateUserObj,
              profilePicture: {
                public_id: result.public_id,
                url: result.secure_url,
              },
            },
            { new: true, runValidators: true }
          ).exec();

          res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
            data: updatedUserData,
          });
        }
      );

      // Convert the buffer to a stream and pipe it to Cloudinary's upload stream
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  } else {
    const userData = await User.findByIdAndUpdate(userId, updateUserObj, {
      new: true,
      runValidators: true,
    }).exec();

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: userData,
    });
  }
});

exports.currentUser = catchAsync(async (req, res, next) => {
  // get the current user
  const user = await User.findById(req.user.id).select(
    "-password -createdAt -updatedAt -__v"
  );

  if (!user) {
    return next(new AppError("You need to login", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User data fetched successfully",
    data: user,
  });
});
