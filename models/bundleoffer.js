const mongoose = require("mongoose");

const BundleOffer = mongoose.Schema({
  bundleID: { type: String, required: true },
  creator: { type: String, required: true },
  paymentToken: { type: String, default: "ftm" }, // payment erc20 token address
  price: { type: Number, required: true }, // price in payment token
  priceInUSD: { type: Number, default: 0 }, // price in usd
  deadline: { type: Number },
});
BundleOffer.index({ bundleID: 1 }, { unique: true });

mongoose.model("BundleOffer", BundleOffer);
