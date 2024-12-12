const express = require("express");
const { restrictRole } = require("../middlewares/restrictedRoles");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  getAllShowcase,
  getOneShowcase,
  createShowcase,
  updateShowcase,
  deleteShowcase,
} = require("../controllers/showcase.controller");

const router = express.Router();

// get all showcase data
router.get("/", getAllShowcase);

// get one showcase data
router.get("/:showcaseId", getOneShowcase);

router.use(isAuthenticated, restrictRole("admin"));
// create a new showcase data
router.post("/", createShowcase);

// update a new showcase data
router.patch("/:showcaseId", updateShowcase);

// delete a showcase data
router.delete("/:showcaseId", deleteShowcase);

module.exports = router;
