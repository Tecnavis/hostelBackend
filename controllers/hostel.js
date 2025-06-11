const hostelModel = require("../models/hostel");
const asyncHandler = require("express-async-handler");
const notficationModel = require("../models/notfication");

//create hostel
exports.create = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    location,
    description,
    amenities,
    category,
    ownerId,
    accommodationType,
    price,
    superAdminId,
  } = req.body;

  if (
    !name ||
    !phone ||
    !location ||
    !description ||
    !amenities ||
    !category ||
    !ownerId ||
    !accommodationType ||
    !price
  ) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const images = req.cloudinaryImageUrl;

  if (!images.length) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  const hostel = await hostelModel.create({
    name,
    phone,
    location,
    description,
    amenities,
    category,
    ownerId,
    accommodationType,
    price,
    superAdminId,
    photos: images,
  });


      if (!hostel) {
        return res.status(400).json({ message: "Hostel not created" });
      }
      
      // Create notification (after successful creation)
      await notficationModel.create({
        adminId: hostel?.superAdminId,
        ownerId: hostel.ownerId,
        message: `New hostel created: ${hostel?.name}.`,
      });
      
      return res.status(201).json({ message: "hostel created", status: 201 });

  
});

// get all superadmin hostel

exports.getAllSuperAdminOwner = asyncHandler(async (req, res) => {
  const owner = await hostelModel
    .find({
      superAdminId: req.params.id,
    })
    .populate("ownerId");
  res.status(200).json(owner);
});

// get all hostels
exports.getAllhostel = asyncHandler(async (req, res) => {
  const hostel = await hostelModel.find().populate("ownerId");
  res.status(200).json(hostel);
});

// get all hostel under owner
exports.getAll = asyncHandler(async (req, res) => {
  const hostel = await hostelModel
    .find({ ownerId: req.params.id })
    .populate("ownerId");
  res.status(200).json(hostel);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const hostel = await hostelModel
    .findById(req.params.id)
    .populate("ownerId roomsId");
  res.status(200).json(hostel);
});

//delete hostel
exports.delete = asyncHandler(async (req, res) => {
 const hostel =  await hostelModel.findByIdAndDelete(req.params.id);

      await notficationModel.create({
      adminId: hostel?.superAdminId,
      ownerId: hostel.ownerId,
      message: `${hostel?.name} has been deleted.`,
    });
  res.status(200).json({ message: "hostel deleted", status: 200 });
});

// Update hostel (partial update)
exports.update = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    location,
    description,
    amenities,
    category,
    ownerId,
    gst,
    index,
  } = req.body;

  // const image = req.file?.filename;
  const image = req.cloudinaryImageUrl;

  const hostel = await hostelModel.findById(req.params.id);

  if (!hostel) {
    return res.status(404).json({ message: "hostel not found" });
  }

  const imageIndex = parseInt(index);
  if (
    isNaN(imageIndex) ||
    imageIndex < 0 ||
    imageIndex >= hostel.photos.length
  ) {
    return res.status(400).json({ message: "Invalid image index" });
  }

  // Update only the fields provided
  if (name) hostel.name = name;
  if (phone) hostel.phone = phone;
  if (gst) hostel.gst = gst;
  if (description) hostel.description = description;
  if (category) hostel.category = category;
  if (ownerId) hostel.ownerId = ownerId;
  if (location) {
    if (location.street) hostel.location.street = location.street;
    if (location.place) hostel.location.place = location.place;
    if (location.pincode) hostel.location.pincode = location.pincode;
  }
  if (image) hostel.photos[imageIndex] = image;

  const updatedhostel = await hostel.save();

  await notficationModel.create({
    adminId: hostel?.superAdminId,
    ownerId: hostel.ownerId,
    message: `${hostel.name} has been updated.`,
  });

  res.status(200).json({
    message: "hostel updated successfully",
    hostel: updatedhostel,
    status: 200,
  });
});

// block and unblock hostel

exports.block = async (req, res) => {
  try {
    const hostel = await hostelModel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ message: "hostel not found" });
    }

    hostel.isActive = !hostel.isActive;

    await hostel.save();

    await notficationModel.create({
      adminId: hostel?.superAdminId,
      ownerId: hostel.ownerId,
      message: `${hostel?.name} ${
        hostel.isActive !== true ? "blocked" : "unblocked"
      }`,
    });

    res.json({ hostel, status: 200 });
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update rating

exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ratingValue } = req.body;

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const hostel = await hostelModel.findById(id);
    if (!hostel) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if user already rated
    const existingRating = hostel.rating.details.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingRating) {
      // Update rating
      existingRating.value = ratingValue;
    } else {
      // Add new rating
      hostel.rating.details.push({ userId, value: ratingValue });
      hostel.rating.count += 1;
    }

    // Recalculate average
    const total = room.rating.details.reduce((sum, r) => sum + r.value, 0);
    hostel.rating.average = parseFloat(
      (total / hostel.rating.details.length).toFixed(2)
    );

    await hostel.save();

    res.status(200).json({
      message: "Room rating updated successfully",
      rating: hostel.rating,
    });
  } catch (error) {
    console.error("Rating error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
