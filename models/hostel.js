const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true  },
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
    description: { String },
    amenities: [String], // e.g., ['WiFi', 'Laundry', 'Parking']
    category: {
      type: String,
      enum: ["boys", "girls", "co-ed", "family"],
      required: true,
    },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner" },
    roomsId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    isAvailable: { type: Boolean, default: true },
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

module.exports = mongoose.model("Hostel", hostelSchema);

// const bookingSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
//   room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
//   checkInDate: Date,
//   checkOutDate: Date,
//   status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
//   paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' }
// }, { timestamps: true });

// export default mongoose.model('Booking', bookingSchema);
