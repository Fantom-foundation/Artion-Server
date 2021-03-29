const mongoose = require("mongoose");

const ERC721TOKEN = mongoose.Schema(
  {
    contractAddress: { type: String, default: "", required: true },
    tokenID: { type: Number, required: true },
    symbol: { type: String, required: true },
    royalty: { type: Number, required: true },
    category: { type: String, required: true },
    imageHash: { type: String, required: true },
    jsonHash: { type: String, required: true },
    collectionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
    lastSalePrice: { type: Number },
    viewed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, required: true },
    listedAt: { type: Date },
    soldAt: { type: Date },
    saleEndsdAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

//*** --- function for response JSON for record list request
ERC721TOKEN.methods.toERC721TOKENJson = () => {
  return {
    contractAddress: this.contractAddress,
    tokenID: this.tokenID,
    symbol: this.symbol,
    royalty: this.royalty,
    category: this.category,
    imageHash: this.imageHash,
    jsonHash: this.jsonHash,
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
