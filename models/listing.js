const mongoose = require("mongoose");

const Listing = mongoose.Schema({
  owner: { type: String, required: true },
  minter: { type: String, required: true },
  tokenID: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  startTime: { type: Date },
  isPrivate: { type: Boolean, default: false },
  allowedAddress: { type: String },
});
Listing.index({ minter: 1, tokenID: -1, owner: 1 }, { unique: true });

mongoose.model("Listing", Listing);
