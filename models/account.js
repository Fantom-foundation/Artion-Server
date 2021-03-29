const mongoose = require("mongoose");

const Account = mongoose.Schema(
  {
    address: { type: String, required: true },
    alias: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String },
    assetTkIds: [
      {
        type: Number,
        // required: true,
      },
    ],
    tkIdsIn: [{ type: Number /*, required: true*/ }],
    tkIdsOut: [{ type: Number /*, required: true*/ }],
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
    assetTkIds: this.assetTkIds,
  };
};

mongoose.model("Account", Account);
