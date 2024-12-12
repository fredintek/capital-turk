const sharp = require("sharp");

exports.reduceImage = async (imageBuffer) => {
  // reduced image returns a buffer
  let reducedImage = await sharp(imageBuffer)
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
      withoutReduction: true,
    })
    .toFormat("jpeg")
    .jpeg({ quality: 80 })
    .toBuffer();

  // now we need to get the size in megabytes
  let fileSize = reducedImage.length / 1024 / 1024;

  // we have to make sure it is less than 1MB
  if (fileSize > 1) {
    let quality = 80;
    while (fileSize > 1 && quality > 10) {
      quality -= 10;
      reducedImage = await sharp(imageBuffer)
        .resize({
          width: 1200,
          height: 1200,
          fit: "inside",
          withoutEnlargement: true,
          withoutReduction: true,
        })
        .toFormat("jpeg")
        .jpeg({ quality })
        .toBuffer();
      fileSize = reducedImage.length / 1024 / 1024;
    }
  }

  return reducedImage;
};
