const catchAsync = require("../utils/catchAsync");
const Today = require("../models/today.models");
const AppError = require("../utils/AppError");

exports.getAllToday = catchAsync(async (req, res, next) => {
  // fetch all today data from the database
  const todayData = await Today.find({});

  res.status(200).json({
    status: "success",
    message:
      todayData?.length > 0
        ? "today data retrieved successfully"
        : "There are no today data available",
    data: todayData,
  });
});

exports.getOneToday = catchAsync(async (req, res, next) => {
  // get today ID
  const todayId = req.params.todayId;

  // get today data from the database
  const foundTodayData = await Today.findById(todayId);

  if (!foundTodayData) {
    return next(new AppError("Today data not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "today data retrieved successfully",
    data: foundTodayData,
  });
});

exports.updateToday = catchAsync(async (req, res, next) => {
  // get today ID
  const todayId = req.params.todayId;

  // get today data from the database
  const foundTodayData = await Today.findById(todayId);

  if (!foundTodayData) {
    return next(new AppError("Today data not found", 404));
  }

  // update fun data
  let updateTodayObj = {
    title: req.body.title || foundTodayData.title,
    time: req.body.time || foundTodayData.time,
  };

  const todayData = await Today.findByIdAndUpdate(todayId, updateTodayObj, {
    new: true,
    runValidators: true,
  }).exec();

  res.status(200).json({
    status: "success",
    message: "Today data updated successfully",
    data: todayData,
  });
});

exports.createToday = catchAsync(async (req, res, next) => {
  // get request body data
  const { title, time } = req.body;

  if (!title || !time) {
    return next(new AppError("Missing required fields", 400));
  }

  try {
    await Today.create({
      title,
      time,
    });
    res.status(201).json({
      status: "success",
      message: "today data created successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.deleteToday = catchAsync(async (req, res, next) => {
  // get today ID
  const todayId = req.params.todayId;

  // get today data from the database
  const foundTodayData = await Today.findById(todayId);

  if (!foundTodayData) {
    return next(new AppError("Today data not found", 404));
  }

  try {
    // delete today data from the database
    await Today.findByIdAndDelete(todayId).exec();

    res.status(200).json({
      status: "success",
      message: "Today data deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});
