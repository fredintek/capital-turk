const mongoose = require("mongoose");
const validator = require("validator");

const CommunicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.every((num) => /^\d+$/.test(num)); // Ensure all entries are digits
        },
        message: "All phone numbers must be valid strings of digits",
      },
    },
    advert: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isEmail, "Please enter a valid email address"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Communication", CommunicationSchema);
