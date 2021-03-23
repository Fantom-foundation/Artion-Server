const mongoose = require('mongoose')

const NFTBasics = new mongoose.Schema({
  tokenID: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  collectionID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  },
  lastSalePrice: { type: Number, required: true },
})

module.exports = mongoose.model('NFTBasics', NFTBasics)
