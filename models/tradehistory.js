const mongoose = require('mongoose')

const TradeHistory = mongoose.Schema(
  {
    collectionAddress: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    tokenID: { type: Number, required: true },
    price: { type: Number, required: true },
    value: { type: Number, default: 1 },
    saleDate: { type: Date, default: new Date() },
    isAuction: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

mongoose.model('TradeHistory', TradeHistory)
