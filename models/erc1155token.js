const mongoose = require("mongoose");

const ERC1155TOKEN = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  tokenURI: { type: String, required: true },
  thumbnailPath: { type: String, default: "-" },
  symbol: { type: String },
  name: { type: String }, //for search filter
  owner: { type: Map },
  supply: { type: Number, default: 1 },
  royalty: { type: Number, default: 0 },
  category: [{ type: String }],
  price: { type: Number, default: 0 }, //for most expensive
  lastSalePrice: { type: Number, default: 0 }, //for highest last sale price
  viewed: { type: Number, default: 0 }, //for mostly viewed
  createdAt: { type: Date }, //for recently created
  listedAt: { type: Date }, //for recently listed
  soldAt: { type: Date }, //for recently sold
  saleEndsAt: { type: Date }, //for auction
});
ERC1155TOKEN.index(
  { contractAddress: 1, tokenID: 1, tokenURI: -1 },
  { unique: true }
);

mongoose.model("ERC1155TOKEN", ERC1155TOKEN);
