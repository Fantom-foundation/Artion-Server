const mongoose = require("mongoose");

const ABI = mongoose.Schema({
  address: { type: String, required: true },
  abi: { type: String },
});

mongoose.model("ABI", ABI);
