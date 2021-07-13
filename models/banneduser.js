const mongoose = require("mongoose");

const BannedUser = mongoose.Schema({
  address: { type: String, required: true },
  reason: { type: String },
});

BannedUser.index(
  {
    address: 1,
  },
  { unique: true }
);

mongoose.model("BannedUser", BannedUser);
