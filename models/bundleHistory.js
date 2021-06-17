const mongoose = require("mongoose");

const BundleTradeHistory = mongoose.Schema(
  {
    bundleID: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    price: { type: Number, required: true },
    isAuction: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

mongoose.model("BundleTradeHistory", BundleTradeHistory);
