const roomModel = require("../models/room");
const hostelModel = require("../models/hostel");
const asyncHandler = require("express-async-handler");

//create room
exports.create = asyncHandler(async (req, res) => {
  const { roomNumber, capacity, price, currentOccupancy, features, hostelId } =
    req.body;

  if (
    !roomNumber ||
    !capacity ||
    !price ||
    !currentOccupancy ||
    !features ||
    !hostelId
  ) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  Number(capacity, price);
  const images = req.cloudinaryImageUrl;

  if (!images.length) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  var hostel = await hostelModel.findById(hostelId);

  const room = await roomModel.create({
    roomNumber,
    capacity,
    price,
    currentOccupancy,
    features,
    hostelId,
    photos: images,
  });

  if (room) {
    hostel.roomsId.push(room._id);
    await hostel.save();
    return res.status(201).json({ message: "room created", status: 201 });
  } else {
    return res.status(400).json({ message: "room not created" });
  }
});

// get all rooms
exports.getAllroom = asyncHandler(async (req, res) => {
  const room = await roomModel.find().populate("hostelId");
  res.status(200).json(room);
});

// // get all room under owner
// exports.getAll = asyncHandler(async (req, res) => {
//   const room = await roomModel.find({ ownerId: req.params.id });
//   res.status(200).json(room);
// });

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const room = await roomModel.findById(req.params.id).populate("hostelId");
  res.status(200).json(room);
});

//delete room
exports.delete = asyncHandler(async (req, res) => {
  const { id, hostelId } = req.params;

  const hostel = await hostelModel.findById(hostelId);
  if (!hostel) {
    return res.status(404).json({ message: "Hostel not found" });
  }  

  // Remove the room ID from hostel.roomsId
  hostel.roomsId.pull(id);
  await hostel.save();

  await roomModel.findByIdAndDelete(id);
  res.status(200).json({ message: "room deleted", status: 200 });
});

// Update room (partial update)
exports.update = asyncHandler(async (req, res) => {
  const {
    roomNumber,
    capacity,
    price,
    currentOccupancy,
    features,
    hostelId,
    isOccupied,
    index,
  } = req.body;

  // const image = req.file?.filename;
  const image = req.cloudinaryImageUrl;

  const room = await roomModel.findById(req.params.id);

  if (!room) {
    return res.status(404).json({ message: "room not found" });
  }

  const imageIndex = parseInt(index);
  if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= room.photos.length) {
    return res.status(400).json({ message: "Invalid image index" });
  }

  // Update only the fields provided
  if (roomNumber) room.roomNumber = roomNumber;
  if (capacity) room.capacity = capacity;
  if (price) room.price = price;
  if (currentOccupancy) room.currentOccupancy = currentOccupancy;
  if (features) room.features = features;
  if (hostelId) room.hostelId = hostelId;
  if (isOccupied) room.isOccupied = isOccupied;
  if (image) room.photos[imageIndex] = image;

  const updatedroom = await room.save();

  res.status(200).json({
    message: "room updated successfully",
    room: updatedroom,
    status: 200,
  });
});

// block and unblock room

exports.block = async (req, res) => {
  try {
    const room = await roomModel.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }

    room.isActive = !room.isActive;

    await room.save();
    res.json({ room, status: 200 });
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
