const express = require("express");
const { restrictRole } = require("../middlewares/restrictedRoles");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  getAllBroadcastFlow,
  getOneBroadcastFlow,
  createBroadcastFlow,
  updateBroadcastFlow,
  deleteBroadcastFlow,
  removeBroadcastFlowContent,
} = require("../controllers/broadcastFlow.controller");

const router = express.Router();

// get all broadcastFlow data
router.get("/", getAllBroadcastFlow);

// get one broadcastFlow data
router.get("/:broadcastFlowId", getOneBroadcastFlow);

router.use(isAuthenticated, restrictRole("admin"));
// create a new broadcastFlow data
router.post("/", createBroadcastFlow);

// update a new broadcastFlow data
router.patch("/:broadcastFlowId", updateBroadcastFlow);

// remove broadcastFlow content data
router.patch("/:broadcastFlowId/:contentId", removeBroadcastFlowContent);

// delete a broadcastFlow data
router.delete("/:broadcastFlowId", deleteBroadcastFlow);

module.exports = router;
