const mongoose = require("mongoose");

const TodaySchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Today", TodaySchema);
