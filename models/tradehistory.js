const mongoose = require("mongoose");

const TradeHistory = mongoose.Schema(
  {
    collectionAddress: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    tokenID: { type: Number, required: true }, // nft item id
    value: { type: Number, default: 1 }, // number of items tranferred
    paymentToken: { type: String, default: "ftm" }, // payment erc20 token address
    price: { type: Number, required: true }, // price in payment token
    priceInUSD: { type: Number, default: 1 },
    saleDate: { type: Date, index: true },
    isAuction: { type: Boolean, default: false },
    txHash: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
TradeHistory.index({ txHash: 1 }, { unique: true });

mongoose.model("TradeHistory", TradeHistory);
