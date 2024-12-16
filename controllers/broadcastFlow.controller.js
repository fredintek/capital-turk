const catchAsync = require("../utils/catchAsync");
const BroadcastFlow = require("../models/broadcastFlow.models");
const AppError = require("../utils/AppError");

exports.getAllBroadcastFlow = catchAsync(async (req, res, next) => {
  // fetch all broadcastFlow data from the database
  const broadcastFlowData = await BroadcastFlow.find({});

  res.status(200).json({
    status: "success",
    message:
      broadcastFlowData?.length > 0
        ? "Broadcast flow data retrieved successfully"
        : "There are no broadcast flow data available",
    data: broadcastFlowData,
  });
});

exports.getOneBroadcastFlow = catchAsync(async (req, res, next) => {
  // get broadcastFlow ID
  const broadcastFlowId = req.params.broadcastFlowId;

  // get broadcastFlow data from the database
  const foundBroadcastFlowData = await BroadcastFlow.findById(broadcastFlowId);

  if (!foundBroadcastFlowData) {
    return next(new AppError("BroadcastFlow data not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "broadcastFlow data retrieved successfully",
    data: foundBroadcastFlowData,
  });
});

exports.updateBroadcastFlow = catchAsync(async (req, res, next) => {
  // get broadcastFlow ID
  const broadcastFlowId = req.params.broadcastFlowId;

  // get broadcastFlow data from the database
  const foundBroadcastFlowData = await BroadcastFlow.findById(broadcastFlowId);

  if (!foundBroadcastFlowData) {
    return next(new AppError("BroadcastFlow data not found", 404));
  }

  // update fun data
  let updateBroadcastFlowObj = {
    time: req.body.time || foundBroadcastFlowData.title,
    content: req.body.content || foundBroadcastFlowData.content,
  };

  const broadcastFlowData = await BroadcastFlow.findByIdAndUpdate(
    broadcastFlowId,
    updateBroadcastFlowObj,
    {
      new: true,
      runValidators: true,
    }
  ).exec();

  res.status(200).json({
    status: "success",
    message: "BroadcastFlow data updated successfully",
    data: broadcastFlowData,
  });
});

exports.createBroadcastFlow = catchAsync(async (req, res, next) => {
  // get request body data
  const { day, content } = req.body;

  if (!day || !content) {
    return next(new AppError("Missing required fields", 400));
  }

  try {
    await BroadcastFlow.create({
      day,
      content,
    });
    res.status(201).json({
      status: "success",
      message: "broadcastFlow data created successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.deleteBroadcastFlow = catchAsync(async (req, res, next) => {
  // get broadcastFlow ID
  const broadcastFlowId = req.params.broadcastFlowId;

  // get broadcastFlow data from the database
  const foundBroadcastFlowData = await BroadcastFlow.findById(broadcastFlowId);

  if (!foundBroadcastFlowData) {
    return next(new AppError("BroadcastFlow data not found", 404));
  }

  try {
    // delete broadcastFlow data from the database
    await BroadcastFlow.findByIdAndDelete(broadcastFlowId).exec();

    res.status(200).json({
      status: "success",
      message: "BroadcastFlow data deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});
