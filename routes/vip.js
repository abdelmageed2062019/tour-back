const express = require("express");
const VIP = require("../models/Vip"); // Ensure this points to the correct model
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const upload = require("../middleware/multer");

const router = express.Router();

// Route to get the VIP tour
router.get("/", async (req, res) => {
  try {
    const tour = await VIP.findOne(); // Fetch the single VIP tour
    if (!tour) {
      return res.status(404).json({ message: "VIP Tour not found." });
    }
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to create a VIP Tour
router.post(
  "/create",
  auth,
  admin,
  upload.array("media", 10), // Allow multiple media uploads
  [
    body("title").notEmpty().withMessage("Title is required."),
    body("duration").notEmpty().withMessage("Duration is required."),
    body("pickUpAndDropOff")
      .notEmpty()
      .withMessage("Pick Up and Drop Off is required."),
    body("details").notEmpty().withMessage("Details are required."),
    body("fullDay").notEmpty().withMessage("Full Day information is required."),
    body("description").notEmpty().withMessage("Description is required."),
    body("type").notEmpty().withMessage("Type is required."),
    body("availability").notEmpty().withMessage("Availability is required."),
    body("price").notEmpty().withMessage("Price is required."),
    body("city").notEmpty().withMessage("City is required."),
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if the VIP tour already exists
    const existingTour = await VIP.findOne();
    if (existingTour) {
      return res.status(400).json({ message: "VIP Tour already exists." });
    }

    const {
      title,
      duration,
      pickUpAndDropOff,
      details,
      fullDay,
      note,
      description,
      type,
      availability,
      price,
      city,
    } = req.body;

    const media = req.files.map((file) => {
      // Additional validation for file type (optional)
      if (
        !file.mimetype.startsWith("image") &&
        !file.mimetype.startsWith("video")
      ) {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Construct the URL using forward slashes
      return {
        url: `${req.protocol}://${req.get(
          "host"
        )}/uploads/${file.filename.replace(/\\/g, "/")}`,
        type: file.mimetype.startsWith("image") ? "image" : "video",
      };
    });

    try {
      const newTour = new VIP({
        title,
        duration,
        pickUpAndDropOff,
        details,
        fullDay,
        note,
        description,
        media,
        type,
        availability,
        price,
        city,
      });

      await newTour.save();
      res.status(201).json(newTour);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Route to update the VIP Tour
router.put(
  "/update",
  auth,
  admin,
  upload.array("media", 10), // Allow multiple media uploads
  [
    body("title").notEmpty().withMessage("Title is required."),
    body("duration").notEmpty().withMessage("Duration is required."),
    body("pickUpAndDropOff")
      .notEmpty()
      .withMessage("Pick Up and Drop Off is required."),
    body("details").notEmpty().withMessage("Details are required."),
    body("fullDay").notEmpty().withMessage("Full Day information is required."),
    body("description").notEmpty().withMessage("Description is required."),
    body("type").notEmpty().withMessage("Type is required."),
    body("availability").notEmpty().withMessage("Availability is required."),
    body("price").notEmpty().withMessage("Price is required."),
    body("city").notEmpty().withMessage("City is required."),
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      duration,
      pickUpAndDropOff,
      details,
      fullDay,
      note,
      description,
      type,
      availability,
      price,
      city,
    } = req.body;

    const media = req.files.map((file) => {
      // Additional validation for file type (optional)
      if (
        !file.mimetype.startsWith("image") &&
        !file.mimetype.startsWith("video")
      ) {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Construct the URL using forward slashes
      return {
        url: `${req.protocol}://${req.get(
          "host"
        )}/uploads/${file.filename.replace(/\\/g, "/")}`,
        type: file.mimetype.startsWith("image") ? "image" : "video",
      };
    });

    try {
      const updatedTour = await VIP.findOneAndUpdate(
        {}, // Update the single VIP tour
        {
          title,
          duration,
          pickUpAndDropOff,
          details,
          fullDay,
          note,
          description,
          media,
          type,
          availability,
          price,
          city,
        },
        { new: true, runValidators: true } // Return the updated document and run validators
      );

      if (!updatedTour) {
        return res.status(404).json({ message: "VIP Tour not found" });
      }

      res.json(updatedTour);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;