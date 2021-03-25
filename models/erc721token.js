const mongoose = require('mongoose')

const ERC721TOKEN = mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    tokenID: { type: Number, required: true },
    collectionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    lastSalePrice: { type: Number, required: true },
    viewed: { type: Number, default: 0, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    listedAt: { type: Date, default: Date.now, required: true },
    soldAt: { type: Date, default: Date.now, required: true },
    saleEndsdAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
  },
)

mongoose.model('ERC721TOKEN', ERC721TOKEN)
