const mongoose = require('mongoose')

const Event = mongoose.Schema(
  {
    eventName: { type: String, required: true },
    tkID: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
)

mongoose.model('Event', Event)
