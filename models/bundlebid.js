const mongoose = require("mongoose");

const BundleBid = mongoose.Schema({
  bundleID: { type: String, required: true },
  bidder: { type: String, required: true },
  bid: { type: Number, required: true },
});
BundleBid.index({ bundleID: 1 }, { unique: true });

mongoose.model("BundleBid", BundleBid);
