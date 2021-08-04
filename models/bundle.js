const mongoose = require("mongoose");

const Bundle = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    viewed: { type: Number, default: 0 },
    price: { type: Number, default: 0 }, //for most expensive
    paymentToken: { type: String, default: "ftm" }, // payment erc20 token address
    priceInUSD: { type: Number, default: 0 },
    lastSalePrice: { type: Number, default: 0 }, //for highest last sale price
    lastSalePricePaymentToken: { type: String, default: "ftm" }, // payment erc20 token address
    lastSalePriceInUSD: { type: Number, default: 0 },
    category: [{ type: String }],
    owner: { type: String, required: true },
    creator: { type: String, required: true },
    createdAt: { type: Date, required: true },
    listedAt: { type: Date, default: new Date(1970, 1, 1) },
    soldAt: { type: Date, default: new Date(1970, 1, 1) },
    saleEndsAt: { type: Date, default: new Date(1970, 1, 1) },
    liked: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

mongoose.model("Bundle", Bundle);
