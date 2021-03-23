const mongoose = require('mongoose')

const Collection = mongoose.Schema(
  {
    collectionName: { type: String, required: true },
    imageHash: { type: String, required: true },
    tkIds: [{ type: String }],
  },
  {
    timestamps: true,
  },
)

Collection.methods.toJsonList = () => {
  return {
    id: this._id,
    collectionName: this.collectionName,
    imageHash: this.imageHash,
  }
}

mongoose.model('Collection', Collection)
