const hostelModel = require("../models/hostel");
const asyncHandler = require("express-async-handler");

//create hostel
exports.create = asyncHandler(async (req, res) => {
  const { name, phone, location, description, amenities, category, ownerId } =
    req.body;

  if ( !name || !phone || !location || !description || !amenities || !category || !ownerId ) {
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
     photos: images
  });

  if (hostel) {
    return res.status(201).json({ message: "hostel created", status: 201 });
  } else {
    return res.status(400).json({ message: "hostel not created" });
  }
});

// get all hostels
exports.getAllhostel = asyncHandler(async (req, res) => {
  const hostel = await hostelModel.find();
  res.status(200).json(hostel);
});

// get all hostel under owner
exports.getAll = asyncHandler(async (req, res) => {
  const hostel = await hostelModel.find({ ownerId: req.params.id });
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
  await hostelModel.findByIdAndDelete(req.params.id);
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
    index
  } = req.body;

  // const image = req.file?.filename;
  const image = req.cloudinaryImageUrl;

  const hostel = await hostelModel.findById(req.params.id);

  if (!hostel) {
    return res.status(404).json({ message: "hostel not found" });
  }


   const imageIndex = parseInt(index);
  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= hostel.photos.length) {
    return res.status(400).json({ message: 'Invalid image index' });
  }

  // Update only the fields provided
  if (name) hostel.name = name;
  if (phone) hostel.phone = phone;
  if (gst) hostel.gst = gst;
  if (description) hostel.description = description;
  if (image) hostel.image = image;
  if (category) hostel.category = category;
  if (ownerId) hostel.ownerId = ownerId;
  if (location) {
    if (location.street) hostel.location.street = location.street;
    if (location.place) hostel.location.place = location.place;
    if (location.pincode) hostel.location.pincode = location.pincode;
  }
  if(image) hostel.photos[imageIndex] = image;


  const updatedhostel = await hostel.save();

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
    res.json({ hostel, status: 200 });
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
