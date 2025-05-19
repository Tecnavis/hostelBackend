const UserModel = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//create user
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password,  phone } = req.body;

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
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      email: email,
    });

    if (!user) {
      return res
        .status(400)
        .json({ invalid: true, message: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
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

      return res.status(200).json({ token, userDetails, status: 200 });
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
  const { name, email,  proof, phone  } = req.body;

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

  const updatedUser = await user.save();

  res
    .status(200)
    .json({
      message: "User updated successfully",
      user: updatedUser,
      status: 200,
    });
});
