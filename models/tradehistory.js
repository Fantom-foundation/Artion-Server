const mongoose = require("mongoose");

const History = mongoose.Schema(
  {
    nftBasicID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NFTBasics",
    },
    eventID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    collectionID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
    history_7: [mongoose.Schema.Types.Mixed],
    history_14: [mongoose.Schema.Types.Mixed],
    history_30: [mongoose.Schema.Types.Mixed],
    history_60: [mongoose.Schema.Types.Mixed],
    history_90: [mongoose.Schema.Types.Mixed],
    history_lastYear: [mongoose.Schema.Types.Mixed],
    history_all: [mongoose.Schema.Types.Mixed],
  },
  {
    timestamps: true,
  }
);

mongoose.model("History", History);
