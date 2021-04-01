require("dotenv").config();
const mongoose = require("mongoose");
const contractutils = require("./contract.utils");

require("../models/transferhistory");
const TransferHistory = mongoose.model("TransferHistory");

const trackCollectionTransfer = async (address) => {
  let contract = await contractutils.loadContractFromAddress(address);
  contract.on("Transfer", async (from, to, tokenID) => {
    let history = await TransferHistory.findOne({
      collectionAddress: address,
      tokenID: tokenID,
      to: from,
    });
    if (history) {
      history.from = from;
      history.to = to;
      await token.save();
    } else {
      let newHistory = new TransferHistory();
      newHistory.collectionAddress = address;
      newHistory.from = from;
      newHistory.to = to;
      newHistory.tokenID = tokenID;
      await newHistory.save();
    }
  });
  return contract;
};

module.exports = trackCollectionTransfer;
