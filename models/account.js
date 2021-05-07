const mongoose = require("mongoose");

const Account = mongoose.Schema(
  {
    address: { type: String, required: true, index: { unique: true } },
    alias: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, required: true },
    imageHash: { type: String },
    bundleIDs: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

//*** --- function for response JSON for record list request
Account.methods.toAccountJSON = function () {
  return {
    address: this.address,
    alias: this.alias,
    email: this.email,
    bio: this.bio,
    imgHash: this.imgHash,
    assetTkIds: this.bundleIDs,
  };
};

mongoose.model("Account", Account);
