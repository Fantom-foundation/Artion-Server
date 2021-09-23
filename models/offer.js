const mongoose = require("mongoose");

const Offer = mongoose.Schema({
  creator: { type: String },
  minter: { type: String },
  tokenID: { type: Number }, //nft item token id
  quantity: { type: String }, // number of items tranferred
  paymentToken: { type: String, default: "ftm" }, // payment erc20 token address
  pricePerItem: { type: Number }, // price in payment token
  priceInUSD: { type: Number, default: 0 },
  deadline: { type: Number, required: false },
  blockNumber: { type: Number, required: true },
});
Offer.index({ minter: 1, tokenID: -1, creator: 1 }, { unique: true });

mongoose.model("Offer", Offer);
