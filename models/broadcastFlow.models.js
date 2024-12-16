const mongoose = require("mongoose");

const BroadcastFlowSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    content: {
      type: [
        {
          time: {
            type: Date,
            required: [true, "Time field is required"],
          },
          text: {
            type: String,
            required: [true, "Text field is required"],
            trim: true,
          },
        },
      ],
      validate: {
        validator: function (val) {
          return Array.isArray(val);
        },
        message: "Invalid content data format",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BroadcastFlow", BroadcastFlowSchema);
