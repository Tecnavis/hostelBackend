const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: {
      street: { type: String, required: true },
      place: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    gst: { type: String },
    photos: [String],
    accommodationType: { type: String, required: true },
    description: { type: String, required: true },
    amenities: [
      {
        name: { type: String, required: true },
        icon: { type: String, required: true },
      },
    ],
    transportation: [
      {
        name: { type: String, required: true },
        icon: { type: String, required: true },
        far: { type: String, required: true },
      },
    ],
    restaurants: [
      {
        name: { type: String, required: true },
        icon: { type: String, required: true },
        far: { type: String, required: true },
      },
    ],
    nearbyPlaces: [
      {
        name: { type: String, required: true },
        icon: { type: String, required: true },
        far: { type: String, required: true },
      },
    ],

    // e.g., ['WiFi', 'Laundry', 'Parking']
    category: {
      type: String,
      required: true,
    },
    price: { type: String, required: true },
    superAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner" },
    roomsId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    isAvailable: { type: Boolean, default: true },
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
    visitorsAllow: {type: Boolean, default: false},
    fulltimeWarden: {type: Boolean, default: false},
    noticePeriod: {type: String, required: true},
    gateOpenTime: {type: String},
    gateCloseTime: {type: String},
    additionalFee: {type: String},
    registrationFee: {type: String},
    restrictions: [String],
        gardianInfo: {
      name: { type: String },
      phone: { type: String },
    },
    refund: {type: Boolean, default: false},
    isDelete: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    googleMap: {
      type:  String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hostel", hostelSchema);
