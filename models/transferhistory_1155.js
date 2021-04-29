const mongoose = require("mongoose");

const TransferHistory1155 = mongoose.Schema(
  {
    collectionAddress: { type: String, required: true },
    holderAddress: { type: String, required: true },
    tokenID: { type: Number, required: true },
    value: { type: Number, default: 0 },
    transferDate: { type: Date, default: new Date() },
  },
  {
    timestamps: true,
  }
);

mongoose.model("TransferHistory1155", TransferHistory1155);
