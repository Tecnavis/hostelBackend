const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
    roomNumber: { type: String, required: true },
    roomType: {type: String, required: true},
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    charge: {type: String},
    payment: {type: String, required: true},
    currentOccupancy: { type: Number, default: 0 }, // how many people are currently in the room (e.g., shared rooms or dorms).
    features: [String], // e.g., ['AC', 'Attached Bathroom']
    isOccupied: { type: Boolean, default: false },
    photos: [String],
    gardianInfo: {
      name: {type: String},
      email: {type: String},
      phone: {type: String}
    },
    visitTimes : [String],
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

module.exports = mongoose.model("Room", roomSchema);
