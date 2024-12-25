const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  pickUpAndDropOff: { type: String, required: true },
  details: { type: String, required: true },
  fullDay: { type: String, required: true },
  viewPrice: { type: String, required: true },
  note: { type: String },
  description: { type: String, required: true },
  media: { type: [mediaSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  type: { type: String },
  availability: { type: String },
  languages: [String],
  prices: {
    privateTourWithLunch: {
      single: { type: Number, required: true },
      twoPeople: { type: Number, required: true },
      threeToFive: { type: Number, required: true },
      aboveSix: { type: Number, required: true },
      childSixToEleven: { type: Number, required: true },
      childUnderSix: { type: Number, required: true },
    },
    privateTourWithoutLunch: {
      single: { type: Number, required: true },
      twoPeople: { type: Number, required: true },
      threeToFive: { type: Number, required: true },
      aboveSix: { type: Number, required: true },
      childSixToEleven: { type: Number, required: true },
      childUnderSix: { type: Number, required: true },
    },
    privateTourGuide: {
      single: { type: Number, required: true },
      twoPeople: { type: Number, required: true },
      threeToFive: { type: Number, required: true },
      aboveSix: { type: Number, required: true },
      childSixToEleven: { type: Number, required: true },
      childUnderSix: { type: Number, required: true },
    },
    privateCarWithDriver: {
      single: { type: Number, required: true },
      twoPeople: { type: Number, required: true },
      threeToFive: { type: Number, required: true },
      aboveSix: { type: Number, required: true },
      childSixToEleven: { type: Number, required: true },
      childUnderSix: { type: Number, required: true },
    },
  },
  city: { type: String, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = mongoose.model("Tour", tourSchema);
