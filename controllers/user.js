const UserModel = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpStorage = new Map();
const twilio = require("twilio");
require("dotenv").config();


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN );





//create user
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password,  phone } = req.body.data;

  if (!name || !email || !password ||!phone) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  // Check  email or phone already exists
  const userExists = await UserModel.findOne({
    $or: [{ email: email }],
  });

  if (userExists) {
    if (userExists.email === email) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  if (user) {
    return res.status(201).json({ message: "User created", status: 201 });
  } else {
    return res.status(400).json({ message: "User not created" });
  }
});



exports.login = asyncHandler(async (req, res) => {
  let { phone } = req.body.data;

    
  // Check if customer exists
  const user = await UserModel.findOne({ phone });
  
  
  if (!user) {
    return res.status(400).json({ message: "Phone number not registered" });
  }
  // Ensure +91 prefix with space
  if (!phone.startsWith("+91")) {
    phone = "+91 " + phone.replace(/^\+91\s*/, "").trim();
  }
  

  // Generate OTP (6-digit random number)
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage.set(phone, otp); // Store OTP temporarily

  // Send OTP via Twilio
  try {
    await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: process.env.TWLIO_NUMBER,
      to: phone,
    });

  
    res.status(200).json({ message: "OTP sent successfully" , status: 200});
  } catch (error) {
    console.error("Twilio Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


exports.verifyOtp = asyncHandler(async (req, res) => {
  try {
    const { phone, otp } = req.body.data;    

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // Ensure +91 prefix
    const formattedPhone = phone.startsWith("+91")
      ? phone
      : "+91 " + phone.replace(/^\+91\s*/, "").trim();

    // Validate OTP
    const storedOtp = otpStorage.get(formattedPhone);
    if (!storedOtp || storedOtp != otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Remove OTP from storage
    otpStorage.delete(formattedPhone);

    // Find customer
    const user = await UserModel.findOne({ phone: phone });
    if (!user) {
      return res.status(400).json({ message: "Customer not found" });
    }
  
          const token = jwt.sign(
        { email: user.email, id: user._id },
        "myjwtsecretkey",
        { expiresIn: "1h" }
      );


      const userDetails = {
        name: user.name,
        email: user.email,
        _id: user._id,
        phone: user.phone,
        image: user?.image,
      };

      return res.status(200).json({  message: "OTP verified successfully", token, userDetails, status: 200 });


  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "Server error, please try again" });
  }
});


// get all
exports.getAll = asyncHandler(async (req, res) => {
  const user = await UserModel.find();
  res.status(200).json(user);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  res.status(200).json(user);
});

//delete admin
exports.delete = asyncHandler(async (req, res) => {
  await UserModel.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "User deleted" });
});

// Update user (partial update)
exports.update = asyncHandler(async (req, res) => {
  

  const { name, email,  proof, phone,   existingPhotos  } = req.body;
  

  // const image = req.file?.filename;
  const image = req.cloudinaryImageUrl

  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If email is changing, check if new email already exists
  if (email && email !== user.email) {
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  // Update only the fields provided
  if (name) user.name = name;
  if (email) user.email = email;
  if (proof) {
    if (proof.frond) user.proof.frond = image;
    if (proof.back) user.proof.back = image;
  }
  if (image) user.image = image;
  if(phone) user.phone = phone;
if (existingPhotos && existingPhotos !== "{}") {
  // remove wrapping quotes if present
  const cleanPhoto = existingPhotos.replace(/^"(.*)"$/, "$1");
  
  user.image = cleanPhoto;
}

  const updatedUser = await user.save();

  res
    .status(200)
    .json({
      message: "User updated successfully",
      user: updatedUser,
      status: 200,
    });
});
