const mongoose = require("mongoose");

const BundleTradeHistory = mongoose.Schema(
  {
    bundleID: { type: String, required: true },
    creator: { type: String },
    from: { type: String },
    to: { type: String },
    price: { type: Number },
    paymentToken: { type: String },
    priceInUSD: { type: Number, default: 0 },
    activity: { type: String, required: true },
    createdAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

BundleTradeHistory.index({ bundleID: -1, createdAt: 1 }, { unique: true });

mongoose.model("BundleTradeHistory", BundleTradeHistory);
