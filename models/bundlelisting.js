const mongoose = require("mongoose");

const BundleListing = mongoose.Schema({
  bundleID: { type: String, required: true },
  owner: { type: String, required: true },
  paymentToken: { type: String, default: "ftm" }, // payment erc20 token address
  priceInUSD: { type: Number, default: 0 },
  price: { type: Number, required: true },
  startTime: { type: Date },
  isPrivate: { type: Boolean, default: false },
  allowedAddress: { type: String },
});
BundleListing.index({ bundleID: 1 }, { unique: true });
mongoose.model("BundleListing", BundleListing);
