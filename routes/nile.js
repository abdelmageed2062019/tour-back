const express = require("express");
const Nile = require("../models/Nile"); // Ensure this points to the correct model
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const upload = require("../middleware/multer");

const router = express.Router();

// Route to get the Nile tour
router.get("/", async (req, res) => {
  try {
    const tour = await Nile.findOne(); // Fetch the single Nile tour
    if (!tour) {
      return res.status(404).json({ message: "Nile Tour not found." });
    }
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to create a Nile Tour
router.post(
  "/create",
  auth,
  admin,
  upload.single("media"), // Allow multiple media uploads
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

    // Check if the Nile tour already exists
    const existingTour = await Nile.findOne();
    if (existingTour) {
      return res.status(400).json({ message: "Nile Tour already exists." });
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
      const newTour = new Nile({
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

// Route to update the Nile Tour
router.put(
  "/update",
  auth,
  admin,
  upload.single("media"), // Allow multiple media uploads
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

    let media = null;
    if (req.file) {
      // Validate file type and construct the URL
      if (
        !req.file.mimetype.startsWith("image") &&
        !req.file.mimetype.startsWith("video")
      ) {
        return res.status(400).json({ error: "Unsupported file type." });
      }
      media = {
        url: `${req.protocol}://${req.get(
          "host"
        )}/uploads/${req.file.filename.replace(/\\/g, "/")}`,
        type: req.file.mimetype.startsWith("image") ? "image" : "video",
      };
    }

    try {
      const updatedTour = await Nile.findOneAndUpdate(
        {}, // Update the single Nile tour
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
        return res.status(404).json({ message: "Nile Tour not found" });
      }

      res.json(updatedTour);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
