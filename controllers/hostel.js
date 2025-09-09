const hostelModel = require("../models/hostel");
const asyncHandler = require("express-async-handler");
const notficationModel = require("../models/notfication");
const adminModel = require("../models/admin");
const roomModel = require("../models/room");

//create hostel
exports.create = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    location,
    description,
    amenities,
    transportation,
    restaurants,
    nearbyPlaces,
    category,
    ownerId,
    accommodationType,
    price,
    superAdminId,
    googleMap,
    visitorsAllow,
    noticePeriod,
    gateOpenTime,
    gateCloseTime,
    restrictions,
    gardianInfo,
    additionalFee,
    fulltimeWarden,
    registrationFee,
    refund,
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
    !price ||
    !transportation ||
    !restaurants ||
    !nearbyPlaces ||
    !googleMap ||
    !visitorsAllow ||
    !noticePeriod ||
    !gateOpenTime ||
    !restrictions ||
    !gardianInfo ||
    !gateCloseTime ||
    !fulltimeWarden ||
    !registrationFee ||
    !refund
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
    transportation,
    restaurants,
    category,
    ownerId,
    accommodationType,
    price,
    superAdminId,
    nearbyPlaces,
    photos: images,
    googleMap,
    visitorsAllow,
    noticePeriod,
    gateOpenTime,
    restrictions,
    gardianInfo,
    additionalFee,
    gateCloseTime,
    fulltimeWarden,
    registrationFee,
    refund,
  });

  if (!hostel) {
    return res.status(400).json({ message: "Hostel not created" });
  }

  const admin = await adminModel.findOne({ role: "super-admin" });

  // Create notification (after successful creation)
  await notficationModel.create({
    adminId: admin?._id,
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

exports.getAllActive = asyncHandler(async (req, res) => {
  const hostel = await hostelModel.find({ isActive: true }).populate("ownerId");
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
  const hostel = await hostelModel.findByIdAndDelete(req.params.id);

  await roomModel.deleteMany({ hostelId: req.params.id });

  const admin = await adminModel.findOne({ role: "super-admin" });

  await notficationModel.create({
    adminId: admin?._id,
    ownerId: hostel.ownerId,
    message: `${hostel?.name} has been deleted.`,
  });
  res.status(200).json({ message: "hostel deleted", status: 200 });
});

// Update hostel (partial update)

// exports.update = asyncHandler(async (req, res) => {
//   const {
//     name,
//     phone,
//     price,
//     accommodationType,
//     location,
//     description,
//     amenities,
//     category,
//     ownerId,
//     existingPhotos,
//   } = req.body;

//   const newImages = req.cloudinaryImageUrl || [];

//   const hostel = await hostelModel.findById(req.params.id);
//   if (!hostel) {
//     return res.status(404).json({ message: "Hostel not found" });
//   }

//   // ✅ Update fields if provided
//   if (name) hostel.name = name;
//   if (phone) hostel.phone = phone;
//   if (price) hostel.price = price;
//   if (accommodationType) hostel.accommodationType = accommodationType;
//   if (description) hostel.description = description;
//   if (category) hostel.category = category;
//   if (ownerId) hostel.ownerId = ownerId;

//   if (location) {
//     if (location.street) hostel.location.street = location.street;
//     if (location.place) hostel.location.place = location.place;
//     if (location.pincode) hostel.location.pincode = location.pincode;
//   }

//   // ✅ ✅ ✅ Update amenities properly:
//   if (amenities) {
//     if (Array.isArray(amenities)) {
//       hostel.amenities = amenities;
//     } else {
//       // If client sends as string from FormData, split it
//       try {
//         const parsed = JSON.parse(amenities);
//         if (Array.isArray(parsed)) {
//           hostel.amenities = parsed;
//         } else {
//           hostel.amenities = [parsed];
//         }
//       } catch {
//         hostel.amenities = [amenities];
//       }
//     }
//   }

//   // ✅ Merge photos
//   let finalPhotos = [];
//   if (existingPhotos) {
//     finalPhotos = JSON.parse(existingPhotos);
//   }
//   if (newImages && newImages.length > 0) {
//     finalPhotos = finalPhotos.concat(newImages);
//   }
//   hostel.photos = finalPhotos;

//   const updatedHostel = await hostel.save();

//   const admin = await adminModel.findOne({ role: "super-admin" });
//   await notficationModel.create({
//     adminId: admin?._id,
//     ownerId: hostel.ownerId,
//     message: `${hostel.name} has been updated.`,
//   });

//   res.status(200).json({
//     message: "Hostel updated successfully",
//     hostel: updatedHostel,
//     status: 200,
//   });
// });

exports.update = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    price,
    accommodationType,
    location,
    description,
    amenities,
    transportation,
    restaurants,
    nearbyPlaces,
    category,
    ownerId,
    existingPhotos,
    googleMap,
    visitorsAllow,
    noticePeriod,
    gateOpenTime,
    restrictions,
    gardianInfo,
    additionalFee,
    gateCloseTime,
    fulltimeWarden,
    registrationFee,
    refund,
  } = req.body;

  const newImages = req.cloudinaryImageUrl || [];

  const hostel = await hostelModel.findById(req.params.id);
  if (!hostel) {
    return res.status(404).json({ message: "Hostel not found" });
  }

  // Basic fields
  if (name) hostel.name = name;
  if (phone) hostel.phone = phone;
  if (price) hostel.price = price;
  if (accommodationType) hostel.accommodationType = accommodationType;
  if (description) hostel.description = description;
  if (category) hostel.category = category;
  if (ownerId) hostel.ownerId = ownerId;
  if (googleMap) hostel.googleMap = googleMap;
  if (visitorsAllow) hostel.visitorsAllow = visitorsAllow;
  if (fulltimeWarden) hostel.fulltimeWarden = fulltimeWarden;
  if (noticePeriod) hostel.noticePeriod = noticePeriod;
  if (gateOpenTime) hostel.gateOpenTime = gateOpenTime;
  if (gateCloseTime) hostel.gateCloseTime = gateCloseTime;
  if (restrictions) hostel.restrictions = restrictions;
  if (additionalFee) hostel.additionalFee = additionalFee;
  if (registrationFee) hostel.registrationFee = registrationFee;
  if (refund) hostel.refund = refund;
  if (gardianInfo) {
    if (gardianInfo.name) hostel.gardianInfo.name = gardianInfo.name;
    if (gardianInfo.phone) hostel.gardianInfo.phone = gardianInfo.phone;
  }

  if (location) {
    if (location.street) hostel.location.street = location.street;
    if (location.place) hostel.location.place = location.place;
    if (location.pincode) hostel.location.pincode = location.pincode;
  }

  // Helper to parse FormData string/array
  const parseField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [field];
    }
  };

  // ✅ Update amenities, transportation, restaurants, nearbyPlaces
  hostel.amenities = parseField(amenities);
  hostel.transportation = parseField(transportation);
  hostel.restaurants = parseField(restaurants);
  hostel.nearbyPlaces = parseField(nearbyPlaces);

  // ✅ Merge photos
  let finalPhotos = [];
  if (existingPhotos) {
    finalPhotos = JSON.parse(existingPhotos);
  }
  if (newImages.length > 0) {
    finalPhotos = finalPhotos.concat(newImages);
  }
  hostel.photos = finalPhotos;

  const updatedHostel = await hostel.save();

  const admin = await adminModel.findOne({ role: "super-admin" });
  await notficationModel.create({
    adminId: admin?._id,
    ownerId: hostel.ownerId,
    message: `${hostel.name} has been updated.`,
  });

  res.status(200).json({
    message: "Hostel updated successfully",
    hostel: updatedHostel,
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

    const admin = await adminModel.findOne({ role: "super-admin" });

    await notficationModel.create({
      adminId: admin?._id,
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

    const { userId, ratingValue } = req.body.data;

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const hostel = await hostelModel.findById(id);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
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
    const total = hostel.rating.details.reduce((sum, r) => sum + r.value, 0);
    hostel.rating.average = parseFloat(
      (total / hostel.rating.details.length).toFixed(2)
    );

    await hostel.save();

    res.status(200).json({
      message: "Hostel rating updated successfully",
      rating: hostel.rating,
      status: 200,
    });
  } catch (error) {
    console.error("Rating error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
