const mongoose = require("mongoose");

const FactoryCollection = mongoose.Schema({
  deployer: { type: String, required: true },
  minter: { type: String, required: true },
});

mongoose.model("FactoryCollection", FactoryCollection);
