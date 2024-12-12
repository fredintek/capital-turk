const express = require("express");
const { restrictRole } = require("../middlewares/restrictedRoles");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  getAllToday,
  getOneToday,
  createToday,
  updateToday,
  deleteToday,
} = require("../controllers/today.controller");

const router = express.Router();

// get all today data
router.get("/", getAllToday);

// get one today data
router.get("/:todayId", getOneToday);

router.use(isAuthenticated, restrictRole("admin"));
// create a new today data
router.post("/", createToday);

// update a new today data
router.patch("/:todayId", updateToday);

// delete a today data
router.delete("/:todayId", deleteToday);

module.exports = router;
