const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Don't return password in responses
      validate: {
        // Minimum eight characters, at least one letter, one number and one special character
        validator: function (pwd) {
          return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
            pwd
          );
        },
        message:
          "Password must contain minimum eight characters, at least one letter, one number and one special character",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpiration: {
      type: Date,
      select: false,
    },
    changedPasswordAt: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.changedPasswordAt = Date.now() - 1000;
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.changedPasswordAt) {
    return jwtTimestamp < parseInt(this.changedPasswordAt.getTime() / 1000, 10);
  }
  return false;
};

UserSchema.methods.createPasswordResetToken = function () {
  const passwordResetToken = crypto.randomBytes(32).toString("hex"); // Generate a random token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(passwordResetToken)
    .digest("hex");
  this.passwordResetTokenExpiration = Date.now() + 1800000; // 30 minuites expiration time
  return passwordResetToken;
};

module.exports = mongoose.model("User", UserSchema);
