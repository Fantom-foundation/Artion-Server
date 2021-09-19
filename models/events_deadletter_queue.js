const mongoose = require('mongoose')

const EventDeadLetterQueue = mongoose.Schema(
  {
    blockNumber: { type: Number, required: true },
    eventName: { type: String, required: true },
    transactionHash: { type: String, required: true },
    transactionIndex: { type: Number, required: true },
    logIndex: { type: Number, required: true },
    args: { type: Array, required: true },
  },
  {
    timestamps: true,
  },
)
EventDeadLetterQueue.index({ transactionHash: 1 }, { unique: true })

mongoose.model('EventDeadLetterQueue', EventDeadLetterQueue)
