const mongoose = require("mongoose");

const ERC1155CONTRACT = mongoose.Schema(
  {
    address: { type: String, required: true, index: { unique: true } },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAppropriate: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

mongoose.model("ERC1155CONTRACT", ERC1155CONTRACT);
