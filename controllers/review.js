const Review = require("../models/review");
const asyncHandler = require("express-async-handler");

// Create a new review
exports.createreview = asyncHandler(async (req, res) => {
  const { chat, userId, roomId } = req.body.data;
  

  if ( !chat || !userId || !roomId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const newreview = new Review({
    chat,
    userId,
    roomId
  });

  const savedreview = await newreview.save();
  res.status(201).json({savedreview, status: 201 });
});

// Get all reviews 
exports.getreviews = asyncHandler(async (req, res) => {

  const reviews = await Review.find()
    .populate("userId", "name image") 

  res.status(200).json(reviews);
});

// get spcific document id
exports.geRoomReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    const discussions = await Review.find({ roomId: id})
      .populate("userId", "name image")
      .populate("roomId");
    res.status(200).json(discussions);
  });


// Get single review by ID
exports.getreviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await review.findById({roomId: id})
    .populate("userId", "name email")

  if (!review) {
    return res.status(404).json({ error: "review not found" });
  }

  res.status(200).json(review);
});

// edit a review

exports.updatereview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { chat, userId } = req.body;

  if (!chat || !userId ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { chat, userId },
    { new: true, runValidators: true }
  );

  if (!updatedReview) {
    return res.status(404).json({ error: "Review not found" });
  }

  res.status(200).json({ updatedReview, status: 200 });
});


// Delete a review by ID
exports.deletereview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await review.findByIdAndDelete(id);

  if (!review) {
    return res.status(404).json({ error: "review not found" });
  }

  res.status(200).json({ message: "review deleted successfully" });
});
