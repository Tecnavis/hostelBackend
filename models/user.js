const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    proof: {
        frond: {type: String},
        back: {type: String}
    },
    phone: {
         type: String,
         unique: true 
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);