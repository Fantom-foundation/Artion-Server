const mongoose = require("mongoose");

const Bundle = mongoose.Schema(
  {
    bundleName: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    imageHash: { type: String, required: true },
    tokens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
  },
  {
    timestamps: true,
  }
);

Bundle.methods.toBundleJson = function () {
  return {
    id: this._id,
    bundleName: this.bundleName,
    description: this.description,
    address: this.address,
    tokens: this.tokens.toString(),
  };
};

mongoose.model("Bundle", Bundle);
