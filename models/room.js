const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
    roomNumber: { type: String, required: true },
    roomType: { type: String, required: true },
    capacity: { type: Number },
    // price: { type: Number, required: true },
    // charge: { type: String },
    // payment: { type: String, required: true },
    currentOccupancy: { type: Number, default: 0 }, // how many people are currently in the room (e.g., shared rooms or dorms).
    isOccupied: { type: Boolean, default: false },
    photos: [String],
     amenities: [
      {
        name: { type: String,},
        icon: { type: String,},
      },
    ],
    withFood: { type: String,  },
    withoutFood: { type: String, },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      details: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          value: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
        },
      ],
    },
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
