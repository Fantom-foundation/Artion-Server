const mongoose = require("mongoose");

const Offer = mongoose.Schema({
  creator: { type: String },
  minter: { type: String, index: true },
  tokenID: { type: Number, index: true },
  payToken: { type: String },
  quantity: { type: String },
  pricePerItem: { type: Number },
  deadline: { type: Number },
});

mongoose.model("Offer", Offer);
