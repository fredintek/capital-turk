const express = require("express");
const {
  loginUser,
  createUser,
  refreshAccess,
  logout,
  deleteUser,
  getAllUsers,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controller");

const router = express.Router();

// create user
router.post("/create", createUser);

// get all users
router.get("/", getAllUsers);

// login user
router.post("/login", loginUser);

// logout user
router.post("/logout", logout);

// delete user
router.delete("/:userId", deleteUser);

// refresh access token
router.get("/refresh-access-token", refreshAccess);

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.patch("/reset-password/:resetToken", resetPassword);

module.exports = router;
