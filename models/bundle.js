const mongoose = require("mongoose");

const Bundle = mongoose.Schema(
  {
    bundleName: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    imageHash: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

Bundle.methods.toBundleJson = () => {
  return {
    id: this._id,
    bundleName: this.bundleName,
    description: this.description,
    address: this.address,
  };
};

mongoose.model("Bundle", Bundle);
