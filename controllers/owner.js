const ownerModel = require("../models/owner");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//create owner
exports.create = asyncHandler(async (req, res) => {
  const {
    ownerName,
    hostelName,
    email,
    password,
    ownerPhone,
    hostelPhone,
    role,
    location,
    ownerId,
  } = req.body;

  if (
    !ownerName ||
    !hostelName ||
    !ownerPhone ||
    !hostelPhone ||
    !email ||
    !password ||
    !role ||
    !location
  ) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  // Check  email or phone already exists
  const ownerExists = await ownerModel.findOne({
    $or: [{ email: email }],
  });

  if (ownerExists) {
    if (ownerExists.email === email) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const owner = await ownerModel.create({
    ownerName,
    hostelName,
    ownerPhone,
    hostelPhone,
    email,
    password: hashedPassword,
    role,
    location,
    ...(role === "staff" && { ownerId }),
  });

  if (owner) {
    return res.status(201).json({ message: "Owner created", status: 201 });
  } else {
    return res.status(400).json({ message: "Owner not created" });
  }
});

// get all
exports.getAll = asyncHandler(async (req, res) => {
  const owner = await ownerModel.find({
    ownerId: req.params.id,
    role: "owner",
  });
  res.status(200).json(owner);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const owner = await ownerModel
    .findById(req.params.id)
    .populate("ownerId");
  res.status(200).json(owner);
});

//delete owner
exports.delete = asyncHandler(async (req, res) => {
  await ownerModel.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Owner deleted" });
});

// Update owner (partial update)
exports.update = asyncHandler(async (req, res) => {
  const {
    ownerName,
    hostelName,
    email,
    ownerPhone,
    hostelPhone,
    role,
    location,
     gst
  } = req.body;

  // const image = req.file?.filename;
  const image = req.cloudinaryImageUrl;

  const owner = await ownerModel.findById(req.params.id);

  if (!owner) {
    return res.status(404).json({ message: "Owner not found" });
  }

  // If email is changing, check if new email already exists
  if (email && email !== owner.email) {
    const emailExists = await ownerModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  // Update only the fields provided
  if (ownerName) owner.ownerName = ownerName;
  if (hostelName) owner.hostelName = hostelName;
  if (ownerPhone) owner.ownerPhone = ownerPhone;
  if (hostelPhone) owner.hostelPhone = hostelPhone;
  if (email) owner.email = email;
  if (role) owner.role = role;
  if (image) owner.image = image;
  if(gst) owner.gst = gst;
  if (location) {
    if (location.street) owner.location.street = location.street;
    if (location.place) owner.location.place = location.place;
    if (location.pincode) owner.location.pincode = location.pincode;
  }

  const updatedowner = await owner.save();

  res.status(200).json({
    message: "Owner updated successfully",
    owner: updatedowner,
    status: 200,
  });
});

// block and unblock owner staff

exports.block = async (req, res) => {
  try {
    const owner = await ownerModel.findById(req.params.id);

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    owner.isActive = !owner.isActive;

    await owner.save();
    res.json(owner);
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};