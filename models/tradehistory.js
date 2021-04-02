const mongoose = require("mongoose");

const TradeHistory = mongoose.Schema(
  {
    erc721address: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    tokenID: { type: Number, required: true },
    price: { type: Number, required: true },
    saleDate: { type: Date, default: new Date() },
  },
  {
    timestamps: true,
  }
);

mongoose.model("TradeHistory", TradeHistory);
