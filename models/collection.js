const mongoose = require("mongoose");

const Collection = mongoose.Schema(
  {
    collectionName: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    imageHash: { type: String, required: true },
    tkIds: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

Collection.methods.toCollectionJson = () => {
  return {
    id: this._id,
    collectionName: this.collectionName,
    description: this.description,
    address: this.address,
    imageHash: this.imageHash,
  };
};

mongoose.model("Collection", Collection);
