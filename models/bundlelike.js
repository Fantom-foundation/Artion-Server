const mongoose = require("mongoose");

const BundleLike = mongoose.Schema({
  bundleID: { type: String, required: true },
  follower: { type: String, required: true },
});

BundleLike.index({ bundleID: 1, follower: -1 }, { unique: true });

mongoose.model("BundleLike", BundleLike);
