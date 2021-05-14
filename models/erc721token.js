const mongoose = require("mongoose");

const ERC721TOKEN = mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    tokenID: { type: Number, required: true },
    tokenURI: { type: String, required: true },
    symbol: { type: String },
    owner: { type: String, required: true },
    royalty: { type: Number, default: 0 },
    category: [{ type: String }],
    price: { type: Number, default: 0 },
    lastSalePrice: { type: Number, default: 0 },
    viewed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    listedAt: { type: Date },
    soldAt: { type: Date },
    saleEndsAt: { type: Date },
  },
  {
    timestamps: true,
  }
);
ERC721TOKEN.index(
  { tokenURI: 1, tokenID: -1, contractAddress: -1 },
  { unique: true }
);

ERC721TOKEN.methods.toSimpleJson = function () {
  return {
    contractAddress: this.contractAddress,
    tokenID: this.tokenID,
    owner: this.owner,
    tokenURI: this.tokenURI,
    price: this.price,
    viewed: this.viewed,
  };
};

mongoose.model("ERC721TOKEN", ERC721TOKEN);
