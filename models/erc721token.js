const mongoose = require("mongoose");

const ERC721TOKEN = mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    tokenID: { type: Number, required: true },
    symbol: { type: String },
    royalty: { type: Number, default: 0 },
    category: [{ type: String }],
    price: { type: Number, default: 0 },
    lastSalePrice: { type: Number, default: 0 },
    viewed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    listedAt: { type: Date },
    soldAt: { type: Date },
    saleEndsdAt: { type: Date },
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
    royalty: this.royalty,
    category: this.category,
    collectionID: this.collectionID,
    lastSalePrice: this.lastSalePrice,
    viewed: this.viewed,
    createdAt: this.createdAt,
    listedAt: this.listedAt,
    soldAt: this.soldAt,
    saleEndsdAt: this.saleEndsdAt,
  };
};

mongoose.model("ERC721TOKEN", ERC721TOKEN);
