const mongoose = require("mongoose");

const TradeHistory1155 = mongoose.Schema(
  {
    erc1155address: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    tokenID: { type: Number, required: true },
    value: { type: Number, default: 1 },
    price: { type: Number, required: true },
    saleDate: { type: Date, default: new Date() },
  },
  {
    timestamps: true,
  }
);

mongoose.model("TradeHistory1155", TradeHistory1155);
