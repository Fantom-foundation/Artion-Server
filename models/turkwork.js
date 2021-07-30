const mongoose = require("mongoose");

const TurkWork = mongoose.Schema({
  contractAddress: { type: String },
  tokenID: { type: Number },
  banDate: { type: Date },
});
TurkWork.index({ contractAddress: 1, tokenID: -1 }, { unique: true });

mongoose.model("TurkWork", TurkWork);
