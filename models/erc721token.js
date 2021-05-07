const mongoose = require("mongoose");

const ERC721TOKEN = mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    tokenID: { type: Number, required: true },
    tokenURI: { type: String, required: true, index: { unique: true } },
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

//*** --- function for response JSON for record list request
ERC721TOKEN.methods.toERC721TOKENJson = function () {
  return {
    contractAddress: this.contractAddress,
    tokenID: this.tokenID,
    symbol: this.symbol,
    owner: this.owner,
    tokenURI: this.tokenURI,
    royalty: this.royalty,
    category: this.category,
    collectionID: this.collectionID,
    lastSalePrice: this.lastSalePrice,
    viewed: this.viewed,
    createdAt: this.createdAt,
    listedAt: this.listedAt,
    soldAt: this.soldAt,
    saleEndsAt: this.saleEndsAt,
  };
};

mongoose.model("ERC721TOKEN", ERC721TOKEN);
