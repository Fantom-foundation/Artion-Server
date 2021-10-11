const mongoose = require("mongoose");

const DisabledExplorerCollection = mongoose.Schema({
  minterAddress: { type: String, required: true, index: { unique: true } },
  type: { type: Number, default: 721 },
  reason: { type: String },
});

mongoose.model("DisabledExplorerCollection", DisabledExplorerCollection);
