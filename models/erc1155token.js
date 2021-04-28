const mongoose = require("mongoose");

const ERC1155TOKEN = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  tokenURI: { type: String, required: true },
  symbol: { type: String },
  supply: { type: Number, default: 0 },
  royalty: { type: Number, default: 0 },
  category: [{ type: String }],
  price: { type: Number, default: 0 },
  lastSalePrice: { type: Number, default: 0 },
  viewed: { type: Number, default: 0 },
});

mongoose.model("ERC1155TOKEN", ERC1155TOKEN);
