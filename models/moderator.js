const mongoose = require("mongoose");

const Moderator = mongoose.Schema({
  address: { type: String, required: true },
  name: { type: String, required: true },
});
Moderator.index({ address: 1 }, { unique: true });

mongoose.model("Moderator", Moderator);
