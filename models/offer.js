const mongoose = require('mongoose')

const Offer = mongoose.Schema({
  creator: { type: String },
  nft: { type: String },
  tokenId: { type: Number },
  payToken: { type: String },
  quantity: { type: String },
  pricePerItem: { type: Number },
  deadline: { type: Number },
})

mongoose.model('Offer', Offer)
