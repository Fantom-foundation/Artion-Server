const mongoose = require("mongoose");

const Follow = mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
});

Follow.index({ from: 1, to: 1 }, { unique: true });

mongoose.model("Follow", Follow);
