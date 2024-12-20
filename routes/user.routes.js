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
  updateUserProfile,
} = require("../controllers/user.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { restrictRole } = require("../middlewares/restrictedRoles");
const { userFileUpload } = require("../middlewares/userMiddleware");
const { resizeImage } = require("../middlewares/resizeImageMiddleware");

const router = express.Router();

// login user
router.post("/login", loginUser);

// refresh access token
router.get("/refresh-access-token", refreshAccess);

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.patch("/reset-password/:resetToken", resetPassword);

router.use(isAuthenticated);

// logout user
router.post("/logout", logout);

router.use(restrictRole("admin"));
// create user
router.post("/create", createUser);

// get all users
router.get("/", getAllUsers);

// delete user
router.delete("/:userId", deleteUser);

// update user profile
router.patch(
  "/profile/:userId",
  userFileUpload.single("profilePicture"),
  resizeImage,
  updateUserProfile
);

module.exports = router;
