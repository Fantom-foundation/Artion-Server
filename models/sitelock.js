const mongoose = require("mongoose");

const SiteLock = mongoose.Schema({
  isLocked: { type: Boolean, required: true, default: false },
  lockTime: { type: Number, required: true, default: 0 },
});

mongoose.model("SiteLock", SiteLock);
