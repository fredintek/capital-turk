const mongoose = require("mongoose");

const FunSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fun", FunSchema);
