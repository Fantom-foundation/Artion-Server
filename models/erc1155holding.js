const mongoose = require("mongoose");

const ERC1155HOLDING = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  holderAddress: { type: String, required: true },
  supplyPerHolder: { type: Number, default: 0 },
});

ERC1155HOLDING.index(
  { contractAddress: 1, tokenID: 1, holderAddress: -1 },
  { unique: true }
);

mongoose.model("ERC1155HOLDING", ERC1155HOLDING);
