const mongoose = require('mongoose')

const Account = new mongoose.Schema({
  address: { type: String, required: true },
  alias: { type: String, required: true },
  assetTkIds: [
    {
      type: Number,
      required: true,
    },
  ],
  tkIdsIn: [{ type: Number, required: true }],
  tkIdsOut: [{ type: Number, required: true }],
})

module.exports = mongoose.model('Account', Account)
