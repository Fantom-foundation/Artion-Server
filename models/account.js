const mongoose = require("mongoose");

const Account = mongoose.Schema(
  {
    address: { type: String, required: true },
    alias: { type: String, required: true },
    email: { type: String, required: true },
    assetTkIds: [
      {
        type: Number,
      },
    ],
    tkIdsIn: [{ type: Number }],
    tkIdsOut: [{ type: Number }],
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
    assetTkIds: this.assetTkIds,
  };
};

mongoose.model("Account", Account);
