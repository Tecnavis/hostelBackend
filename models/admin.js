const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    image: {
        type: String, 
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
         type: String,
         unique: true 
    },
    role: {
        enum: ["main-admin", "admin"]
    }

}, { timestamps: true });

module.exports = mongoose.model("admin", adminSchema);