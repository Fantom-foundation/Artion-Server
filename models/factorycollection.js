const mongoose = require("mongoose");

const FactoryCollection = mongoose.Schema({
  deployer: { type: String, required: true },
  minter: { type: String, required: true },
});

FactoryCollection.index({ minter: 1 }, { unique: true });

mongoose.model("FactoryCollection", FactoryCollection);
