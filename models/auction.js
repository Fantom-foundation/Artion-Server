const mongoose = require("mongoose");

const Auction = mongoose.Schema({
  minter: { type: String, required: true, index: true },
  tokenID: { type: Number, required: true, index: true },
  startTime: { type: Number, default: Date.now },
  endTime: { type: Date, default: Date.now },
});

mongoose.model("Auction", Auction);
