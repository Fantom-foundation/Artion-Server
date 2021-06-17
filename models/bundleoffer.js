const mongoose = require("mongoose");

const BundleOffer = mongoose.Schema({
  bundleID: { type: String, required: true },
  creator: { type: String, required: true },
  payToken: { type: String },
  price: { type: Number, required: true },
  deadline: { type: Number },
});
BundleOffer.index({ bundleID: 1 }, { unique: true });

mongoose.model("BundleOffer", BundleOffer);
