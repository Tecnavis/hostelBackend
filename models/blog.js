const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  heading: String,
  apartment: String,
  house: String,
  winner: String,
});

const blogSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
    },
    title: {
      type: String,
      required: true,
    },
    photos: [String],
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
    },
    sections: [sectionSchema],
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
