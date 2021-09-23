const mongoose = require("mongoose");

const Listing = mongoose.Schema({
  owner: { type: String, required: true },
  minter: { type: String, required: true },
  tokenID: { type: Number, required: true }, //nft item id
  quantity: { type: Number, default: 1 }, // number of nft items transferred
  paymentToken: { type: String, default: "ftm" }, // payment erc20 token address
  price: { type: Number, required: true }, // price in payment token
  priceInUSD: { type: Number, default: 0 },
  startTime: { type: Date },
  isPrivate: { type: Boolean, default: false },
  allowedAddress: { type: String },
  blockNumber: { type: Number, required: true },
});
Listing.index({ minter: 1, tokenID: -1, owner: 1 }, { unique: true });

mongoose.model("Listing", Listing);
