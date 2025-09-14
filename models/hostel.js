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
    accommodationType: { type: String,  },
    description: { type: String, },
    amenities: [
      {
        name: { type: String, },
        icon: { type: String, },
      },
    ],
    transportation: [
      {
        name: { type: String,},
        icon: { type: String,},
        far: { type: String, },
      },
    ],
    restaurants: [
      {
        name: { type: String,},
        icon: { type: String,},
        far: { type: String, },
      },
    ],
    nearbyPlaces: [
      {
        name: { type: String,},
        icon: { type: String,},
        far: { type: String, },
      },
    ],

    // e.g., ['WiFi', 'Laundry', 'Parking']
    category: {
      type: String,
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
    noticePeriod: {type: String, },
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
    },
    bookingCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hostel", hostelSchema);
