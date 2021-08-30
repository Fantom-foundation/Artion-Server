const mongoose = require("mongoose");

const UnlockableContents = mongoose.Schema({
  contractAddress: { type: String, required: true },
  tokenID: { type: Number, required: true },
  content: { type: String, required: true },
});

UnlockableContents.index({ contractAddress: 1, tokenID: -1 }, { unique: true });

mongoose.model("UnlockableContents", UnlockableContents);
