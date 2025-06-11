const adminModel = require("../models/admin");
const notficationModel = require("../models/notfication");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
  adminModel;

  if (admin) {
    return res.status(201).json({ message: "Admin created", status: 201 });
  } else {
    return res.status(400).json({ message: "Admin not created" });
  }
});

exports.login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({
      email: email,
    });

    if (!admin) {
      return res
        .status(400)
        .json({ invalid: true, message: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (isPasswordMatch) {
      const token = jwt.sign(
        { email: admin.email, id: admin._id },
        "myjwtsecretkey",
        { expiresIn: "1h" }
      );

      const adminDetails = {
        name: admin.name,
        email: admin.email,
        _id: admin._id,
        phone: admin.phone,
        image: admin?.image,
        role: admin.role,
        superAdminId: admin?.superAdminId,
      };

      return res.status(200).json({ token, adminDetails, status: 200 });
    } else {
      return res
        .status(400)
        .json({ invalid: true, message: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error, please try again" });
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
 const admin =  await adminModel.findByIdAndDelete(req.params.id);

    const notification = await  notficationModel.create({
         adminId: admin?._id,
        message: `Super Admin ${admin?.name} deleted`
     })

     notification.save();

  res.status(200).json({ message: "Admin deleted", status: 200 });
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

// block and unblock super admin  admins

exports.block = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.isActive = !admin.isActive;

    await admin.save();
    res.json({ admin, status: 200 });
     
    const notification = await  notficationModel.create({
         adminId: admin?._id,
        message: `Super Admin ${admin?.name} ${admin.isActive  !== true ? "blocked" : "unblocked"}`
     })

     notification.save();

  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
