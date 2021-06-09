const mongoose = require("mongoose");

const BannedNFT = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
});

BannedNFT.index({ contractAddress: 1, tokenID: 1 }, { unique: true });

mongoose.model("BannedNFT", BannedNFT);
