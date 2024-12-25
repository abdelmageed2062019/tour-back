const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comment: { type: String },
  media: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true },
    },
  ],
  visible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
