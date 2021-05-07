const mongoose = require("mongoose");

const Offer = mongoose.Schema({
  creator: { type: String },
  minter: { type: String },
  tokenID: { type: Number },
  payToken: { type: String },
  quantity: { type: String },
  pricePerItem: { type: Number },
  deadline: { type: Number },
});
Offer.index({ minter: 1, tokenID: -1 }, { unique: true });

mongoose.model("Offer", Offer);
