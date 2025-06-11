const ownerModel = require("../models/owner");
const notficationModel = require("../models/notfication");
const adminModel = require("../models/admin");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//create owner
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, ownerId, superAdminId } =
    req.body;

  if (!name || !phone || !email || !password || !role) {
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
    name,
    phone,
    email,
    password: hashedPassword,
    role,
    superAdminId,
    ...(role === "staff" && { ownerId }),
  });

  res.status(201).json({ message: "Owner created", status: 201 });

  const admin = await adminModel.find({ role: "super-admin" });
  const notification = await notficationModel.create({
    adminId: admin?._id,
    message: `New owner created`,
  });

  notification.save();
});

exports.login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await ownerModel.findOne({
      email: email,
    });

    if (!owner) {
      return res
        .status(400)
        .json({ invalid: true, message: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, owner.password);

    if (isPasswordMatch) {
      const token = jwt.sign(
        { email: owner.email, id: owner._id },
        "myjwtsecretkey",
        { expiresIn: "1h" }
      );

      const ownerDetails = {
        name: owner.name,
        email: owner.email,
        _id: owner._id,
        phone: owner.phone,
        image: owner?.image,
        role: owner.role,
        ownerId: owner?.ownerId,
        superAdminId: owner?.superAdminId,
      };

      return res.status(200).json({ token, ownerDetails, status: 200 });
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

// get all superadmin owners

exports.getAllSuperAdminOwner = asyncHandler(async (req, res) => {
  const owner = await ownerModel.find({
    superAdminId: req.params.id,
    role: "owner",
  });
  res.status(200).json(owner);
});

// get all owners
exports.getAllOwner = asyncHandler(async (req, res) => {
  const owner = await ownerModel.find({
    role: "owner",
  });
  res.status(200).json(owner);
});

// get all owner under staff
exports.getAll = asyncHandler(async (req, res) => {
  const owner = await ownerModel.find({
    ownerId: req.params.id,
    role: "staff",
  });

  res.status(200).json(owner);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const owner = await ownerModel.findById(req.params.id).populate("ownerId");
  res.status(200).json(owner);
});

//delete owner
exports.delete = asyncHandler(async (req, res) => {
  const owner =  await ownerModel.findByIdAndDelete(req.params.id);

    const notification = await notficationModel.create({
    adminId: owner?.superAdminId,
    ownerId: owner?.ownerId,
    message: `${owner?.name} has been deleted.`,
  });

  notification.save();
  res.status(200).json({ message: "Owner deleted", status: 200 });
});

// Update owner (partial update)
exports.update = asyncHandler(async (req, res) => {
  const { name, email, phone, role } = req.body;

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
  if (name) owner.name = name;
  if (phone) owner.phone = hostelPhone;
  if (email) owner.email = email;
  if (role) owner.role = role;
  if (image) owner.image = image;
  // if(gst) owner.gst = gst;
  // if (location) {
  //   if (location.street) owner.location.street = location.street;
  //   if (location.place) owner.location.place = location.place;
  //   if (location.pincode) owner.location.pincode = location.pincode;
  // }

  const updatedowner = await owner.save();

  const notification = await notficationModel.create({
    adminId: owner?.superAdminId,
    ownerId: owner?.ownerId,
    message: `${owner?.name} updated their profile.`,
  });

  notification.save();

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
    res.json({ owner, status: 200 });

    const notification = await notficationModel.create({
      adminId: owner?.superAdminId,
      ownerId: owner?.ownerId,
      message: `${owner?.name} has been  ${
        owner.isActive !== true ? "blocked" : "unblocked"
      }.`,
    });

    notification.save();
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
