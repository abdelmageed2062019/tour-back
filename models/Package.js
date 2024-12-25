const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  nights: { type: Number, required: true },
  prices: {
    fiveStars: {
      single: { type: Number, required: true },
      doubleTriple: { type: Number, required: true },
    },
    fourStars: {
      single: { type: Number, required: true },
      doubleTriple: { type: Number, required: true },
    },
    threeStars: {
      single: { type: Number, required: true },
      doubleTriple: { type: Number, required: true },
    },
  },
  bookingMethod: { type: String, required: true },
  childrenPolicy: {
    infant: { type: Number, required: true },
    child: { type: Number, required: true },
  },
  itinerary: { type: [String], required: true },
  extraNotes: { type: String },
});

module.exports = mongoose.model("Package", packageSchema);
