const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    name: {
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
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "staff"],
      required: true,
    },
    superAdminId: {
       type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: function () {
        return this.role === "staff";
      },
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
