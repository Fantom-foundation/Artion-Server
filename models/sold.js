const mongoose = require('mongoose');

const Sold = mongoose.Schema(
  {
    minter: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    tokenID: { type: Number, required: true }, // nft item id
    quantity: { type: Number, default: 1 }, // number of items tranferred
    paymentToken: { type: String, default: 'ftm' }, // payment erc20 token address
    price: { type: Number, required: true }, // price in payment token
    priceInUSD: { type: Number, default: 1 },
    soldAt: { type: Date, index: true },
    txHash: { type: String, required: true }
  },
  {
    timestamps: true
  }
);
Sold.index({ txHash: 1 }, { unique: true });

mongoose.model('Sold', Sold);
