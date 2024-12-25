const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const nileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  pickUpAndDropOff: { type: String, required: true },
  details: { type: String, required: true },
  fullDay: { type: String, required: true },
  note: { type: String },
  description: { type: String, required: true },
  media: { type: mediaSchema, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  type: { type: String },
  availability: { type: String },
  price: { type: String, required: true },
  city: { type: String, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = mongoose.model("Nile", nileSchema);
