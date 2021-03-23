const mongoose = require('mongoose')

const Event = new mongoose.Schema({
  eventName: { type: String, required: true },
  tkID: { type: Number, required: true },
})

module.exports = mongoose.model('Event', Event)
