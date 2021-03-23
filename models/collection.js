const mongoose = require('mongoose')

const Collection = new mongoose.model({
  collectionName: { type: String, required: true },
  imageUrl: { type: String, required: true },
})
module.exports = mongoose.model('Collection', Collection)
