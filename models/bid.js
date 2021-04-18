const mongoose = require("mongoose");

const Bid = mongoose.Schema({
  minter: { type: String, required: true },
  tokenID: { type: Number, required: true },
  bidder: { type: String, required: true },
  bid: { type: Number, required: true },
});

mongoose.model("Bid", Bid);
