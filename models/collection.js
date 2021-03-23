const mongoose = require('mongoose')

const Collection = new mongoose.model({
  collectionName: { type: String, required: true },
  imageHash: { type: String, required: true },
  tkIds: [{ type: String }],
})
module.exports = mongoose.model('Collection', Collection)
