require("dotenv").config();
const { default: axios } = require("axios");
const mongoose = require("mongoose");
const contractutils = require("./contract.utils");

require("../models/transferhistory");
require("../models/erc721token");
const TransferHistory = mongoose.model("TransferHistory");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");

const isUrlExists = require("url-exists-nodejs");

const trackCollectionTransfer = async (address) => {
  let contract = await contractutils.loadContractFromAddress(address);
  if (!contract) return null;
  contract.on("Transfer", async (from, to, tokenID) => {
    let erc721token = await ERC721TOKEN.findOne({
      contractAddress: address,
      tokenID: tokenID,
    });

    let tokenURI = await contract.tokenURI(tokenID);
    let isValidURI = await isUrlExists(tokenURI);
    if (!isValidURI) {
      return;
    }
    console.log(`uri ${tokenURI} is valid`);

    if (erc721token) {
    } else {
      let newTk = new ERC721TOKEN();
      newTk.contractAddress = address;
      newTk.tokenID = tokenID;
      newTk.tokenURI = tokenURI;
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
  const contract = await contractutils.loadContractFromAddress(minterAddress);
  let tokenID = 1;
  while (tokenID != 0) {
    try {
      let tokenURI = await contract.tokenURI(tokenID);
      let isValidURI = await isUrlExists(tokenURI);
      if (!isValidURI) return;
      let erc721token = await ERC721TOKEN.findOne({
        contractAddress: minterAddress,
        tokenID: tokenID,
      });

      if (erc721token) {
      } else {
        let newTk = new ERC721TOKEN();
        newTk.contractAddress = minterAddress;
        newTk.tokenID = tokenID;
        newTk.tokenURI = tokenURI;
        await newTk.save();
      }

      // say from is the minter, to is the current owner
      let from = minterAddress;
      let to = await contract.ownerOf(tokenID);

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
      console.log(`tokenID is incremented to ${tokenID}`);
      tokenID++;
    } catch (error) {
      tokenID = 0;
      console.log("exception, exiting ...");
      break;
    }
  }
};

const collectionTracker = {
  trackCollectionTransfer,
  trackERC721Distribution,
};

module.exports = collectionTracker;
