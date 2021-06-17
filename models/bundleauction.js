const mongoose = require("mongoose");

const BundleAuction = mongoose.Schema({
  bundleID: { type: String, required: true },
  bidder: { type: Number, required: true },
  startTime: { type: Number, default: Date.now },
  endTime: { type: Date, default: Date.now },
});

BundleAuction.index({ bundleID: 1 }, { unique: true });
mongoose.model("BundleAuction", BundleAuction);
