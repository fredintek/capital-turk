const catchAsync = require("../utils/catchAsync");
const Fun = require("../models/fun.models");
const AppError = require("../utils/AppError");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

exports.getAllFun = catchAsync(async (req, res, next) => {
  // fetch all fun data from the database
  const funData = await Fun.find({});

  res.status(200).json({
    status: "success",
    message:
      funData?.length > 0
        ? "fun data retrieved successfully"
        : "There are no fun data available",
    data: funData,
  });
});

exports.getOneFun = catchAsync(async (req, res, next) => {
  // get fun ID
  const funId = req.params.funId;

  // get fun data from the database
  const foundFunData = await Fun.findById(funId);

  if (!foundFunData) {
    return next(new AppError("Fun data not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fun data retrieved successfully",
    data: foundFunData,
  });
});

exports.updateFun = catchAsync(async (req, res, next) => {
  // get fun ID
  const funId = req.params.funId;

  // get fun data from the database
  const foundFunData = await Fun.findById(funId);

  if (!foundFunData) {
    return next(new AppError("Fun data not found", 404));
  }

  // update fun data
  let updateFunObj = {
    time: req.body.time || foundFunData.time,
    title: req.body.title || foundFunData.title,
    content: req.body.content || foundFunData.content,
  };

  if (req.file && req.file.buffer) {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "capital-turk/fun",
        },
        async (error, result) => {
          if (error) {
            return next(new AppError("Image upload failed", 500));
          }

          // delete previous fun image
          if (foundFunData.image.public_id) {
            await cloudinary.uploader.destroy(foundFunData.image.public_id);
          }

          // update fun data with new image
          updateFunObj.image = {
            public_id: result.public_id,
            url: result.secure_url,
          };

          const funData = await Fun.findByIdAndUpdate(
            funId,
            {
              ...updateFunObj,
              image: {
                public_id: result.public_id,
                url: result.secure_url,
              },
            },
            { new: true, runValidators: true }
          ).exec();

          res.status(200).json({
            status: "success",
            message: "Fun data created successfully",
            data: funData,
          });
        }
      );

      // Convert the buffer to a stream and pipe it to Cloudinary's upload stream
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  } else {
    const funData = await Fun.findByIdAndUpdate(funId, updateFunObj, {
      new: true,
      runValidators: true,
    }).exec();

    res.status(200).json({
      status: "success",
      message: "Fun data updated successfully",
      data: funData,
    });
  }
});

exports.createFun = catchAsync(async (req, res, next) => {
  // get request body data
  const { time, title, content } = req.body;

  if (!time || !title || !content) {
    return next(new AppError("Missing required fields", 400));
  }

  if (req.file && req.file.buffer) {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "capital-turk/fun",
        },
        async (error, result) => {
          if (error) {
            return next(new AppError("Image upload failed", 500));
          }

          await Fun.create({
            time,
            title,
            content,
            image: {
              public_id: result.public_id,
              url: result.secure_url,
            },
          });

          res.status(201).json({
            status: "success",
            message: "Fun data created successfully",
          });
        }
      );

      // Convert the buffer to a stream and pipe it to Cloudinary's upload stream
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  } else {
    return next(new AppError("No image provided", 400));
  }
});

exports.deleteFun = catchAsync(async (req, res, next) => {
  // get fun ID
  const funId = req.params.funId;

  // get fun data from the database
  const foundFunData = await Fun.findById(funId);

  if (!foundFunData) {
    return next(new AppError("Fun data not found", 404));
  }

  try {
    // delete fun data from the database
    await Fun.findByIdAndDelete(funId).exec();

    // delete fun image from Cloudinary
    await cloudinary.uploader.destroy(foundFunData.image.public_id);

    res.status(200).json({
      status: "success",
      message: "Fun data deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});
