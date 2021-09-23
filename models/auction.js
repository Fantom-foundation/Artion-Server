const mongoose = require("mongoose");

const Auction = mongoose.Schema({
  minter: { type: String, required: true },
  tokenID: { type: Number, required: true },
  bidder: { type: Number, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Date, required: true },
  paymentToken: {type: String, required: true},
  txHash: {type: String, required: true},
  reservePrice: {type: String, required: true},
  blockNumber: {type: Number, required: true },
});

Auction.index({ minter: 1, tokenID: -1 }, { unique: true });

mongoose.model("Auction", Auction);
