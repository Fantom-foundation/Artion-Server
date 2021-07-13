const mongoose = require("mongoose");

const BlockHeight = mongoose.Schema({
  network: { type: String, default: "Opera" },
  height: { type: Number, default: 0 },
  epoch: { type: Date },
});

mongoose.model("BlockHeight", BlockHeight);
