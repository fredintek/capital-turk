const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { reduceImage } = require("../utils/reduceImage");

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // resize the image
  if (req.file.mimetype.startsWith("image/")) {
    const resizedBuffer = await reduceImage(req.file.buffer);

    // replace the original file buffer with the resized one
    req.file.buffer = resizedBuffer;
  } else {
    return next(new AppError("file must be image", 400));
  }

  next();
});
