// routes/packageRoutes.js
const express = require("express");
const Package = require("../models/Package"); // Adjust the path according to your project structure
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Create a new package
router.post("/", auth, admin, async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      nights,
      prices,
      bookingMethod,
      childrenPolicy,
      itinerary,
      extraNotes,
    } = req.body;

    const package = new Package({
      title,
      description,
      duration,
      nights,
      prices,
      bookingMethod,
      childrenPolicy,
      itinerary,
      extraNotes,
    });

    await package.save();

    res.status(201).json({
      success: true,
      message: "Package created successfully!",
      package,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export the router
module.exports = router;
