const mongoose = require("mongoose");

const ERC1155TOKEN = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  tokenURI: { type: String, required: true },
  symbol: { type: String },
  owner: { type: Map },
  supply: { type: Number, default: 1 },
  royalty: { type: Number, default: 0 },
  category: [{ type: String }],
  price: { type: Number, default: 0 },
  lastSalePrice: { type: Number, default: 0 },
  viewed: { type: Number, default: 0 },
  listedAt: { type: Date },
  soldAt: { type: Date },
  saleEndsAt: { type: Date },
});
ERC1155TOKEN.index({ tokenID: 1, tokenURI: -1 }, { unique: true });

mongoose.model("ERC1155TOKEN", ERC1155TOKEN);
