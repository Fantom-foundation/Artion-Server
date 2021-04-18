const mongoose = require("mongoose");

const Notification = mongoose.Schema({
  address: { type: String, required: true },
  contents: [{ type: String }],
});

mongoose.model("Notification", Notification);
