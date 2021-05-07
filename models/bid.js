const mongoose = require("mongoose");

const Bid = mongoose.Schema({
  minter: { type: String, required: true, index: true },
  tokenID: { type: Number, required: true, index: true },
  bidder: { type: String, required: true },
  bid: { type: Number, required: true },
});
Bid.index({ minter: 1, tokenID: -1 }, { unique: true });

mongoose.model("Bid", Bid);
