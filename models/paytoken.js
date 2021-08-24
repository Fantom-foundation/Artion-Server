const mongoose = require("mongoose");

const PayToken = mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  address: { type: String, required: true },
  chainlinkProxyAddress: { type: String, required: true },
  decimals: { type: Number, required: true },
  isMainnet: { type: Boolean, default: true },
});

PayToken.index({ address: 1, isMainnet: -1 }, { unique: true });

mongoose.model("PayToken", PayToken);
