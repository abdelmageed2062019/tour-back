const express = require("express");
const Tour = require("../models/Tour");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/multer");
const Review = require("../models/Review");
const router = express.Router();

// Create Tour
router.post("/", auth, admin, upload.array("media", 10), async (req, res) => {
  try {
    // Validate request body fields
    const {
      title,
      description,
      duration,
      pickUpAndDropOff,
      details,
      viewPrice,
      note,
      fullDay,
      type,
      availability,
      languages,
      prices,
      city,
    } = req.body;

    if (!title || !description || !city || !prices) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Validate and parse prices
    let parsedPrices;
    try {
      parsedPrices = JSON.parse(prices);
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid prices format" });
    }

    // Validate uploaded media
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No media files uploaded" });
    }

    const media = req.files.map((file) => {
      // Additional validation for file type (optional)
      if (
        !file.mimetype.startsWith("image") &&
        !file.mimetype.startsWith("video")
      ) {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      return {
        url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        type: file.mimetype.startsWith("image") ? "image" : "video",
      };
    });

    // Create and save the tour
    const tour = new Tour({
      title,
      description,
      media,
      duration,
      type,
      availability,
      pickUpAndDropOff,
      details,
      viewPrice,
      note,
      fullDay,
      languages,
      prices: parsedPrices,
      city,
      createdBy: req.user._id,
    });
    await tour.save();

    res.status(201).json({ message: "Tour created successfully", tour });
  } catch (error) {
    // Handle Multer errors explicitly
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Too many files uploaded" });
    }
    // Handle validation or unexpected errors
    res.status(500).json({ error: error.message });
  }
});

// Get all Tours
router.get("/", async (req, res) => {
  try {
    const tours = await Tour.find().populate("createdBy", "username");
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific Tour by ID
router.get("/:id", async (req, res) => {
  console.log("Requested Tour ID:", req.params.id); // Log the requested ID
  try {
    const tour = await Tour.findById(req.params.id);
    console.log(tour);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get a Tour by City
router.get("/city/:city", async (req, res) => {
  try {
    const tours = await Tour.find({ city: req.params.city }).populate(
      "createdBy",
      "username"
    );
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Additional CRUD routes (update, delete) can be added here
router.put("/:id", auth, admin, upload.array("media", 10), async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      pickUpAndDropOff,
      details,
      viewPrice,
      note,
      fullDay,
      type,
      availability,
      languages,
      prices,
      city,
      deleteMedia,
    } = req.body;

    // Find the tour to update
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    // Remove specified media
    if (deleteMedia && Array.isArray(JSON.parse(deleteMedia))) {
      const deleteMediaArray = JSON.parse(deleteMedia);
      tour.media = tour.media.filter(
        (mediaItem) => !deleteMediaArray.includes(mediaItem.url)
      );
    }

    // Handle new media uploads
    let newMedia = [];
    if (req.files && req.files.length > 0) {
      newMedia = req.files.map((file) => ({
        url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        type: file.mimetype.startsWith("image") ? "image" : "video",
      }));
    }

    // Update the media array with new uploads
    tour.media = [...tour.media, ...newMedia];

    // Update other fields if provided
    if (title) tour.title = title;
    if (description) tour.description = description;
    if (duration) tour.duration = duration;
    if (type) tour.type = type;
    if (availability) tour.availability = availability;
    if (pickUpAndDropOff) tour.pickUpAndDropOff = pickUpAndDropOff;
    if (details) tour.details = details;
    if (viewPrice) tour.viewPrice = viewPrice;
    if (note) tour.note = note;
    if (fullDay) tour.fullDay = fullDay;
    if (languages) {
      try {
        tour.languages = JSON.parse(languages);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid languages format" });
      }
    }
    if (prices) {
      try {
        tour.prices = JSON.parse(prices);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid prices format" });
      }
    }
    if (city) tour.city = city;

    // Save the updated tour
    await tour.save();

    res.json({ message: "Tour updated successfully", tour });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    // Delete all reviews associated with the tour
    await Review.deleteMany({ tourId: tour._id });

    // Now delete the tour
    await Tour.findByIdAndDelete(req.params.id);

    res.json({ message: "Tour and associated reviews deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
