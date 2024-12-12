const catchAsync = require("../utils/catchAsync");
const Showcase = require("../models/showcase.models");
const AppError = require("../utils/AppError");

exports.getAllShowcase = catchAsync(async (req, res, next) => {
  // fetch all showcase data from the database
  const showcaseData = await Showcase.find({});

  res.status(200).json({
    status: "success",
    message:
      showcaseData?.length > 0
        ? "showcase data retrieved successfully"
        : "There are no showcase data available",
    data: showcaseData,
  });
});

exports.getOneShowcase = catchAsync(async (req, res, next) => {
  // get showcase ID
  const showcaseId = req.params.showcaseId;

  // get showcase data from the database
  const foundShowcaseData = await Showcase.findById(showcaseId);

  if (!foundShowcaseData) {
    return next(new AppError("Showcase data not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "showcase data retrieved successfully",
    data: foundShowcaseData,
  });
});

exports.updateShowcase = catchAsync(async (req, res, next) => {
  // get showcase ID
  const showcaseId = req.params.showcaseId;

  // get showcase data from the database
  const foundShowcaseData = await Showcase.findById(showcaseId);

  if (!foundShowcaseData) {
    return next(new AppError("Showcase data not found", 404));
  }

  // update fun data
  let updateShowcaseObj = {
    title: req.body.title || foundShowcaseData.title,
    content: req.body.content || foundShowcaseData.content,
  };

  const showcaseData = await Showcase.findByIdAndUpdate(
    showcaseId,
    updateShowcaseObj,
    {
      new: true,
      runValidators: true,
    }
  ).exec();

  res.status(200).json({
    status: "success",
    message: "Showcase data updated successfully",
    data: showcaseData,
  });
});

exports.createShowcase = catchAsync(async (req, res, next) => {
  // get request body data
  const { title, content, videoLink } = req.body;

  if (!title || !content || !videoLink) {
    return next(new AppError("Missing required fields", 400));
  }

  try {
    await Showcase.create({
      title,
      content,
      videoLink,
    });
    res.status(201).json({
      status: "success",
      message: "showcase data created successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.deleteShowcase = catchAsync(async (req, res, next) => {
  // get showcase ID
  const showcaseId = req.params.showcaseId;

  // get showcase data from the database
  const foundShowcaseData = await Showcase.findById(showcaseId);

  if (!foundShowcaseData) {
    return next(new AppError("Showcase data not found", 404));
  }

  try {
    // delete showcase data from the database
    await Showcase.findByIdAndDelete(showcaseId).exec();

    res.status(200).json({
      status: "success",
      message: "Showcase data deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});
