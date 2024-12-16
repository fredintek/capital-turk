const express = require("express");
const { restrictRole } = require("../middlewares/restrictedRoles");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  getAllCommunication,
  getOneCommunication,
  createCommunication,
  updateCommunication,
  deleteCommunication,
} = require("../controllers/communication.controller");

const router = express.Router();

// get all communication data
router.get("/", getAllCommunication);

// get one communication data
router.get("/:communicationId", getOneCommunication);

router.use(isAuthenticated, restrictRole("admin"));
// create a new communication data
router.post("/", createCommunication);

// update a new communication data
router.patch("/:communicationId", updateCommunication);

// delete a communication data
router.delete("/:communicationId", deleteCommunication);

module.exports = router;
