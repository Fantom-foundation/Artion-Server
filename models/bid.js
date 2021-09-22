const mongoose = require("mongoose");

const Bid = mongoose.Schema(
  {
    minter: { type: String, required: true, index: true },
    tokenID: { type: Number, required: true, index: true },
    bidder: { type: String, required: true, index: true },
    bid: { type: Number, required: true },
    paymentToken: { type: String, required: true },
    auctionActive: { type: Boolean, required: true },
    winningBid: { type: Boolean, required: true },
    withdrawn: { type: Boolean, required: false },
    blockNumber: { type: Number, required: true },
    txHash: {type: String, required: true },
  },{
    timestamps: true,
  },
);

mongoose.model("Bid", Bid);
