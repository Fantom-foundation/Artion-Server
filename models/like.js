const mongoose = require("mongoose");

const Like = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  follower: { type: String, required: true },
});

Like.index({ contractAddress: 1, tokenID: 1, follower: -1 }, { unique: true });

mongoose.model("Like", Like);
