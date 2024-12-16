const catchAsync = require("../utils/catchAsync");
const Communication = require("../models/communication.models");
const AppError = require("../utils/AppError");

exports.getAllCommunication = catchAsync(async (req, res, next) => {
  // fetch all communication data from the database
  const communicationData = await Communication.find({});

  res.status(200).json({
    status: "success",
    message:
      communicationData?.length > 0
        ? "Broadcast flow data retrieved successfully"
        : "There are no broadcast flow data available",
    data: communicationData,
  });
});

exports.getOneCommunication = catchAsync(async (req, res, next) => {
  // get communication ID
  const communicationId = req.params.communicationId;

  // get communication data from the database
  const foundCommunicationData = await Communication.findById(communicationId);

  if (!foundCommunicationData) {
    return next(new AppError("Communication data not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "communication data retrieved successfully",
    data: foundCommunicationData,
  });
});

exports.updateCommunication = catchAsync(async (req, res, next) => {
  // get communication ID
  const communicationId = req.params.communicationId;

  // get communication data from the database
  const foundCommunicationData = await Communication.findById(communicationId);

  if (!foundCommunicationData) {
    return next(new AppError("Communication data not found", 404));
  }

  // update fun data
  let updateCommunicationObj = {
    title: req.body.title || foundCommunicationData.title,
    address: req.body.address || foundCommunicationData.address,
    phone: req.body.phone || foundCommunicationData.phone,
    advert: req.body.advert || foundCommunicationData.advert,
  };

  const communicationData = await Communication.findByIdAndUpdate(
    communicationId,
    updateCommunicationObj,
    {
      new: true,
      runValidators: true,
    }
  ).exec();

  res.status(200).json({
    status: "success",
    message: "Communication data updated successfully",
    data: communicationData,
  });
});

exports.createCommunication = catchAsync(async (req, res, next) => {
  // get request body data
  const { title, address, phone, advert } = req.body;

  if (!title || !address || !phone || !advert) {
    return next(new AppError("Missing required fields", 400));
  }

  try {
    await Communication.create({
      title,
      address,
      phone,
      advert,
    });
    res.status(201).json({
      status: "success",
      message: "communication data created successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.deleteCommunication = catchAsync(async (req, res, next) => {
  // get communication ID
  const communicationId = req.params.communicationId;

  // get communication data from the database
  const foundCommunicationData = await Communication.findById(communicationId);

  if (!foundCommunicationData) {
    return next(new AppError("Communication data not found", 404));
  }

  try {
    // delete communication data from the database
    await Communication.findByIdAndDelete(communicationId).exec();

    res.status(200).json({
      status: "success",
      message: "Communication data deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});
