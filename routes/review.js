const express = require("express");
const Review = require("../models/Review");
const Tour = require("../models/Tour");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/multer");
const router = express.Router();

// Create a new review
router.post("/:tourId", auth, upload.array("media", 10), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { tourId } = req.params;
    const userId = req.user?.userId; // Get user ID from the authenticated user

    // Map uploaded media files to objects containing URL and type
    const media = req.files.map((file) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      type: file.mimetype.startsWith("image") ? "image" : "video",
    }));

    // Find the tour by ID to ensure it exists
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User is not authenticated" });
    }

    // Create and save the review in the Review collection
    const review = await Review.create({
      user: userId, // Use the authenticated user's ID
      tour: tourId,
      rating,
      comment,
      media,
    });

    // Add the review's ObjectId to the tour's reviews array
    tour.reviews.push(review._id);
    await tour.save();

    res.status(201).json({ message: "Review created successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all reviews (Admin only)
router.get("/", auth, admin, async (req, res) => {
  try {
    const reviews = await Review.find().populate("user").populate("tour");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update review visibility (Admin only)
router.patch("/:id/visibility", auth, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).send("Review not found");
    }

    // Toggle visibility
    review.visible = !review.visible;
    await review.save();

    res.status(200).send({ message: "Review visibility updated", review });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Fetch all reviews for a specific tour
router.get("/:tourId", async (req, res) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour: tourId }).populate("user");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all reviews made by a specific user
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ user: userId }).populate("tour");

    // Ensure that the user can only fetch their own reviews
    if (req.user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to view these reviews" });
    }

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific review by ID (Admin only)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
