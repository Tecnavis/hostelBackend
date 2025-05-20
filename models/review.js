const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    chat: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);