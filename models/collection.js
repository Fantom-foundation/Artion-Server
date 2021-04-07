const mongoose = require("mongoose");

const Collection = mongoose.Schema({
  erc721Address: { type: String, required: true },
  collectionName: { type: String, required: true },
  description: { type: String, required: true },
  categories: [{ type: String }],
  logoImageHash: { type: String, required: true },
  siteUrl: { type: String, required: true },
  discord: { type: String },
  twitterHandle: { type: String },
  mediumHandle: { type: String },
  telegram: { type: String },
});

mongoose.model("Collection", Collection);
