const mongoose = require("mongoose");

const NFTITEM = mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    tokenID: { type: Number, required: true },
    tokenURI: { type: String, required: true },
    imageURL: { type: String },
    thumbnailPath: { type: String, default: "-" },
    symbol: { type: String },
    name: { type: String }, //for search filter
    owner: { type: String },
    supply: { type: Number, default: 1 },
    royalty: { type: Number, default: 0 },
    category: [{ type: String }],
    price: { type: Number, default: 0, nullable: true }, //for most expensive in payment token
    paymentToken: { type: String, default: null, nullable: true }, // payment erc20 token address
    priceInUSD: { type: Number, default: null, nullable: true },
    lastSalePrice: { type: Number, default: null, nullable: true }, //for highest last sale price
    lastSalePricePaymentToken: { type: String, default: null, nullable: true }, // payment erc20 token address
    lastSalePriceInUSD: { type: Number, default: null, nullable: true },
    viewed: { type: Number, default: 0 }, //for mostly viewed
    createdAt: { type: Date }, //for recently created
    listedAt: { type: Date, nullable: true }, //for recently listed
    soldAt: { type: Date }, //for recently sold
    saleEndsAt: { type: Date }, //for auction
    tokenType: { type: Number, default: 721 },
    liked: { type: Number, default: 0, index: true },
    contentType: { type: String, default: "image" },
    isAppropriate: { type: Boolean, default: true },
    isFiltered: { type: Boolean, default: false },
    blockNumber: { type: Number, default: 0},
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
    liked: this.liked,
    contentType: this.contentType,
  };
};

mongoose.model("NFTITEM", NFTITEM);
