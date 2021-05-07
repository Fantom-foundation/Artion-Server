const mongoose = require("mongoose");

const Listing = mongoose.Schema({
  owner: { type: String, required: true },
  minter: { type: String, required: true, index: true },
  tokenID: { type: Number, required: true, index: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  startTime: { type: Date, default: new Date() },
  isPrivate: { type: Boolean, default: false },
  allowedAddress: { type: String },
});

mongoose.model("Listing", Listing);
