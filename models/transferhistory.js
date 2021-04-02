const mongoose = require("mongoose");

const TransferHistory = mongoose.Schema(
  {
    collectionAddress: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    tokenID: { type: Number, required: true },
    trasferDate: { type: Date, default: new Date() },
  },
  {
    timestamps: true,
  }
);

mongoose.model("TransferHistory", TransferHistory);
