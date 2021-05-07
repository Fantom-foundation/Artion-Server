const mongoose = require("mongoose");

const Category = mongoose.Schema({
  minterAddress: { type: String, required: true, index: true },
  type: { type: Number, default: 721 },
});

mongoose.model("Category", Category);
