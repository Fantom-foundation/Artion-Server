const mongoose = require("mongoose");

const Auction = mongoose.Schema({
  minter: { type: String, required: true },
  tokenID: { type: Number, required: true },
  bidder: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  paymentToken: {type: String, required: true},
  transactionHash: {type: String, required: true},
  reservePrice: {type: String, required: true},
});

Auction.index({ minter: 1, tokenID: -1 }, { unique: true });

mongoose.model("Auction", Auction);
