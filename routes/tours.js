const express = require("express");
const Tour = require("../models/Tour");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/multer");
const Review = require("../models/Review");
const router = express.Router();

// Create Tour
router.post("/", auth, admin, upload.single("media"), async (req, res) => {
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
    } = req.body;

    if (!title || !description || !city || !prices) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    let parsedPrices;
    try {
      parsedPrices = JSON.parse(prices);
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid prices format" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No media file uploaded" });
    }

    const media = {
      url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith("image") ? "image" : "video",
    };

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
    res.status(500).json({ error: error.message });
  }
});

// Update Tour
router.put("/:id", auth, admin, upload.single("media"), async (req, res) => {
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
    } = req.body;

    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    // Update media if a new file is uploaded
    if (req.file) {
      tour.media = {
        url: `${req.protocol}://${req.get("host")}/uploads/${
          req.file.filename
        }`,
        type: req.file.mimetype.startsWith("image") ? "image" : "video",
      };
    }

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

    await tour.save();
    res.json({ message: "Tour updated successfully", tour });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Tour
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    await Review.deleteMany({ tourId: tour._id });
    await Tour.findByIdAndDelete(req.params.id);

    res.json({ message: "Tour and associated reviews deleted successfully" });
  } catch (error) {
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
  try {
    const tour = await Tour.findById(req.params.id);
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

module.exports = router;
