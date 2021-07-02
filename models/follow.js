const mongoose = require("mongoose");

const Follow = mongoose.Schema({
  address: { type: String, required: true },
  follower: { type: String, required: true },
});

Follow.index({ address: 1, follower: 1 }, { unique: true });

mongoose.model("Follow", Follow);
