require("dotenv").config();
const { default: axios } = require("axios");
const mongoose = require("mongoose");
const contractutils = require("./contract.utils");

require("../models/transferhistory");
require("../models/erc721token");
const TransferHistory = mongoose.model("TransferHistory");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const ftmScanApiKey = process.env.FTM_SCAN_API_KEY;

const trackCollectionTransfer = async (address) => {
  let contract = await contractutils.loadContractFromAddress(address);
  if (!contract) return null;
  contract.on("Transfer", async (from, to, tokenID) => {
    let erc721token = await ERC721TOKEN.findOne({
      contractAddress: address,
      tokenID: tokenID,
    });

    if (erc721token) {
    } else {
      let newTk = new ERC721TOKEN();
      newTk.contractAddress = address;
      newTk.tokenID = tokenID;
      await newTk.save();
    }

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

const trackERC721Distribution = async (minterAddress) => {
  let request = `https://api.ftmscan.com/api?module=account&action=tokennfttx&contractaddress=${minterAddress}&startblock=0&endblock=999999999&sort=asc&apikey=${ftmScanApiKey}`;
  let result = await axios.get(request);
  let tnxs = result.data.result;
  if (tnxs) {
    tnxs = Object.values(tnxs);
    tnxs.map(async (tnx) => {
      console.log(tnx);
      let from = tnx.from;
      let to = tnx.to;
      let tokenID = tnx.tokenID;

      let erc721token = await ERC721TOKEN.findOne({
        contractAddress: minterAddress,
        tokenID: tokenID,
      });

      if (erc721token) {
      } else {
        let newTk = new ERC721TOKEN();
        newTk.contractAddress = minterAddress;
        newTk.tokenID = tokenID;
        await newTk.save();
      }

      let history = await TransferHistory.findOne({
        collectionAddress: minterAddress,
        tokenID: tokenID,
        to: from,
      });
      if (history) {
        history.from = from;
        history.to = to;
        await token.save();
      } else {
        let newHistory = new TransferHistory();
        newHistory.collectionAddress = minterAddress;
        newHistory.from = from;
        newHistory.to = to;
        newHistory.tokenID = tokenID;
        await newHistory.save();
      }
    });
  }
};

const collectionTracker = {
  trackCollectionTransfer,
  trackERC721Distribution,
};

module.exports = collectionTracker;
