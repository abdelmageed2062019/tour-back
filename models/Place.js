const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tour" }],
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
});

module.exports = mongoose.model("Place", placeSchema);
