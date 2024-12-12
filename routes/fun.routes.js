const express = require("express");
const {
  getAllFun,
  createFun,
  updateFun,
  deleteFun,
  getOneFun,
} = require("../controllers/fun.controller");
const { funFileUpload } = require("../middlewares/funMiddleware");
const { resizeImage } = require("../middlewares/resizeImageMiddleware");
const { restrictRole } = require("../middlewares/restrictedRoles");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

// get all fun data
router.get("/", getAllFun);

// get one fun data
router.get("/:funId", getOneFun);

router.use(isAuthenticated, restrictRole("admin"));
// create a new fun data
router.post("/", funFileUpload.single("image"), resizeImage, createFun);

// update a new fun data
router.patch("/:funId", funFileUpload.single("image"), resizeImage, updateFun);

// delete a fun data
router.delete("/:funId", deleteFun);

module.exports = router;
