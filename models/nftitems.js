const mongoose = require("mongoose");

const NFTITEM = mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    tokenID: { type: Number, required: true },
    tokenURI: { type: String, required: true },
    thumbnailPath: { type: String, default: "-" },
    symbol: { type: String },
    name: { type: String }, //for search filter
    owner: { type: String },
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
    tokenType: { type: Number, default: 721 },
  },
  {
    timestamps: true,
  }
);
NFTITEM.index(
  { tokenURI: 1, tokenID: -1, contractAddress: -1 },
  { unique: true }
);

NFTITEM.methods.toSimpleJson = function () {
  return {
    contractAddress: this.contractAddress,
    tokenID: this.tokenID,
    owner: this.owner,
    tokenURI: this.tokenURI,
    price: this.price,
    viewed: this.viewed,
  };
};

mongoose.model("NFTITEM", NFTITEM);
