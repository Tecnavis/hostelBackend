const adminModel = require("../models/admin");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

//create admin
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, superAdminId } = req.body;

  if (!name || !email || !password || !phone || !role) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  // Check  email or phone already exists
  const adminExists = await adminModel.findOne({
    $or: [{ email: email }],
  });

  if (adminExists) {
    if (adminExists.email === email) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await adminModel.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone,
    ...(role === "admin" && { superAdminId }),
  });

  if (admin) {
    return res.status(201).json({ message: "Admin created", status: 201 });
  } else {
    return res.status(400).json({ message: "Admin not created" });
  }
});

// get all
exports.getAll = asyncHandler(async (req, res) => {
  const admin = await adminModel.find({
    superAdminId: req.params.id,
    role: "admin",
  });
  res.status(200).json(admin);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const admin = await adminModel
    .findById(req.params.id)
    .populate("superAdminId");
  res.status(200).json(admin);
});

//delete admin
exports.delete = asyncHandler(async (req, res) => {
  await adminModel.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Admin deleted" });
});

// Update admin (partial update)
exports.update = asyncHandler(async (req, res) => {
  const { name, email, phone, role } = req.body;

  // const image = req.file?.filename;
  const image = req.cloudinaryImageUrl;

  const admin = await adminModel.findById(req.params.id);

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  // If email is changing, check if new email already exists
  if (email && email !== admin.email) {
    const emailExists = await adminModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  // Update only the fields provided
  if (name) admin.name = name;
  if (email) admin.email = email;
  if (phone) admin.phone = phone;
  if (role) admin.role = role;
  if (image) admin.image = image;

  const updatedadmin = await admin.save();

  res.status(200).json({
    message: "Admin updated successfully",
    admin: updatedadmin,
    status: 200,
  });
});

exports.block = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.isActive = !admin.isActive;

    await admin.save();
    res.json(admin);
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
