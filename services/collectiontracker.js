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
    console.log("new transfer detected");
    console.log(from, to, tokenID);

    let erc721token = await ERC721TOKEN.findOne({
      contractAddress: address,
      tokenID: tokenID,
    });

    console.log("found token is ");
    console.log(erc721token);

    let tokenURI = await contract.tokenURI(tokenID);
    console.log("tokens token uri is ", tokenURI);
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
      let _newTK = await newTk.save();
      console.log("saved new token is ");
      console.log(_newTK);
    }

    let history = await TransferHistory.findOne({
      collectionAddress: address,
      tokenID: tokenID,
      to: from,
    });
    console.log("found history is");
    console.log(history);
    if (history) {
      history.from = from;
      history.to = to;
      let _history = await history.save();
      console.log("new transfer of existing updated");
      console.log(_history);
    } else {
      let newHistory = new TransferHistory();
      newHistory.collectionAddress = address;
      newHistory.from = from;
      newHistory.to = to;
      newHistory.tokenID = tokenID;
      let _newHistory = await newHistory.save();

      console.log("new transfer of  non existing added");

      console.log(_newHistory);
    }
  });
  return contract;
};

const trackERC721Distribution = async (minterAddress) => {
  const contract = await contractutils.loadContractFromAddress(minterAddress);

  //console.log(`${minterAddress} distribution has been started`);

  let tokenID = 1;
  while (tokenID != 0) {
    try {
      let tokenURI = await contract.tokenURI(tokenID);
      //console.log(
      //   `uri of ${minterAddress}` +
      //     `with token id of ${tokenID}` +
      //     `is ${tokenURI}`
      // );
      let isValidURI = await isUrlExists(tokenURI);
      //console.log(`token uri of ${tokenURI} is `, isValidURI);
      if (!isValidURI) return;
      let erc721token = await ERC721TOKEN.findOne({
        contractAddress: minterAddress,
        tokenID: tokenID,
      });

      if (erc721token) {
        //console.log("token exists");
      } else {
        let newTk = new ERC721TOKEN();
        newTk.contractAddress = minterAddress;
        newTk.tokenID = tokenID;
        newTk.tokenURI = tokenURI;
        await newTk.save();
        //console.log("token newly saved");
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
        //console.log("already in history");
      } else {
        let newHistory = new TransferHistory();
        newHistory.collectionAddress = minterAddress;
        newHistory.from = from;
        newHistory.to = to;
        newHistory.tokenID = tokenID;
        await newHistory.save();
        //console.log("token newly saved to history");
      }
      //console.log(`tokenID is incremented to ${tokenID}`);
      tokenID++;
    } catch (error) {
      tokenID = 0;
      //console.log("exception, exiting ...");
      break;
    }
  }
};

const collectionTracker = {
  trackCollectionTransfer,
  trackERC721Distribution,
};

module.exports = collectionTracker;
