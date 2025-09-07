const bookingModel = require("../models/booking");
const asyncHandler = require("express-async-handler");
const notficationModel = require("../models/notfication");
const hostelModel = require("../models/hostel");

//create booking
exports.create = asyncHandler(async (req, res) => {
  const { userId, roomId, hostelId, checkInDate } = req.body.data;

  if (!userId || !roomId || !checkInDate || !hostelId) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const booking = await bookingModel.create({
    userId,
    roomId,
    hostelId,
    checkInDate,
    // checkOutDate,
  });

  if (!booking) {
    return res.status(400).json({ message: "Booking not created" });
  }

  // Fetch hostel details
  const hostel = await hostelModel.findById(hostelId);

  if (hostel) {
    await notficationModel.create({
      adminId: hostel?.superAdminId,
      ownerId: hostel.ownerId,
      message: `New booking created at ${hostel.name}. Current status: ${booking?.status}.`,
    });
  }

  return res.status(201).json({ message: "Booking created", status: 201 });
});

// get all superadmin booking

exports.getAllSuperAdminBookings = asyncHandler(async (req, res) => {
  const superAdminId = req.params.id;

  const bookings = await bookingModel
    .find()
    .populate({
      path: "hostelId",
      match: { superAdminId: superAdminId },
      model: "Hostel",
    })
    .populate({
      path: "roomId",
      model: "Room",
    })
    .populate({
      path: "userId",
      model: "User",
    });

  // Filter only bookings where hostelId was successfully populated
  const filteredBookings = bookings.filter((booking) => booking.hostelId);

  res.status(200).json(filteredBookings);
});

// get all bookings
exports.getAllbooking = asyncHandler(async (req, res) => {
  const booking = await bookingModel.find().populate("roomId userId hostelId");
  res.status(200).json(booking);
});

// get all booking under owner
exports.getAll = asyncHandler(async (req, res) => {
  const ownerId = req.params.id;

  const bookings = await bookingModel
    .find()
    .populate({
      path: "hostelId",
      match: { ownerId: ownerId },
      model: "Hostel",
    })
    .populate({
      path: "roomId",
      model: "Room",
    })
    .populate({
      path: "userId",
      model: "User",
    });

  // Filter only bookings where hostelId was successfully populated
  const filteredBookings = bookings.filter((booking) => booking.hostelId);

  res.status(200).json(filteredBookings);
});


// get all booking under owner
exports.getAllUserBooking = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  const bookings = await bookingModel
    .find({userId: userId}).populate("hostelId");

    console.log(bookin);
    
  res.status(200).json(bookings);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const booking = await bookingModel
    .findById(req.params.id)
    .populate("userId roomId");
  res.status(200).json(booking);
});

//delete booking
exports.delete = asyncHandler(async (req, res) => {
   
  const booking =  await bookingModel.findByIdAndDelete(req.params.id);

    const hostel = await hostelModel.findById(booking?.hostelId);

     await notficationModel.create({
      adminId: hostel?.superAdminId,
      ownerId: hostel.ownerId,
      message: `User booking deleted.`,
    });

  res.status(200).json({ message: "booking deleted", status: 200 });
});

// Update booking (partial update)
exports.update = asyncHandler(async (req, res) => {
  const { checkInDate, status, paymentStatus } = req.body;

  const booking = await bookingModel.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "booking not found" });
  }

  if (checkInDate) booking.checkInDate = checkInDate;
  // if (checkOutDate) booking.checkOutDate = checkOutDate;
  if (status) booking.status = status;
  if (paymentStatus) booking.paymentStatus = paymentStatus;

  const updatedbooking = await booking.save();

  // Fetch hostel details
  const hostel = await hostelModel.findById(booking?.hostelId);

  if (status) {
    await notficationModel.create({
      adminId: hostel?.superAdminId,
      ownerId: hostel.ownerId,
      message: `${updatedbooking?.status} booking at ${hostel.name}.`,
    });
  }

  res.status(200).json({
    message: "booking updated successfully",
    booking: updatedbooking,
    status: 200,
  });
});
