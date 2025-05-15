const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    ownerName: {
      type: String,
      required: true,
    },
    hostelName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    ownerPhone: {
      type: String,
      unique: true,
      required: true,
    },
    hostelPhone: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "staff"],
      required: true,
    },
    location: {
      street: { type: String, required: true },
      place: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: function () {
        return this.role === "staff";
      },
    },
    gst: {
      type: String,
    },
    hostelIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel",
      },
    ],
    isDelete: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Owner", ownerSchema);
