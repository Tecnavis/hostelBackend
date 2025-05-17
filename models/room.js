const mongoose = require("mongoose");


const roomSchema = new mongoose.Schema({
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  roomNumber: {String},
  capacity: {Number},
  price: {Number},
  currentOccupancy: { type: Number, default: 0 }, // how many people are currently in the room (e.g., shared rooms or dorms).
  features: [String], // e.g., ['AC', 'Attached Bathroom']
  isOccupied: { type: Boolean, default: false },
   isDelete: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
}, {timestamps: true});

module.exports = mongoose.model('Room', roomSchema);
