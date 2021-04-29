require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const ethers = require("ethers");
const validatorAddress = process.env.VALIDATORADDRESS;

require("../models/erc721contract");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");

require("../models/highestblock");
const BlockHeight = mongoose.model("BlockHeight");

const Validator = require("./validator");
const contractutils = require("./contract.utils");
const collectionTracker = require("./collectiontracker");

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpcapi.fantom.network",
  250
);

const erc721scanner = async () => {
  console.log("erc721 detector started");
  let currentBlock = await provider.getBlockNumber();

  let lastBlockScanned = await BlockHeight.findOne({ network: "Opera" });
  if (lastBlockScanned == null) lastBlockScanned = 0;
  //   for (let blkNo = lastBlockScanned; blkNo <= currentBlock; ++blkNo) {
  let blockWithTnxs = await provider.getBlock(3515573);
  let tnxs = blockWithTnxs.transactions;
  console.log(blockWithTnxs);
  console.log(tnxs);
  if (tnxs.length == 0) return;
  tnxs.map((tnxHash) => {
    console.log(tnxHash);
  });
  //   }
};

const erc721detector = async () => {
  console.log("history detector has been started");
  let currentBlock = await provider.getBlockNumber();

  //   save the last check block height
  let newBH = new BlockHeight();
  newBH.height = currentBlock;
  //   await newBH.save();

  //   start detection
  for (let height = 0; height < currentBlock; ++height) {
    let blockWithTnxs = await provider.getBlockWithTransactions(height);
    let tnxs = blockWithTnxs.transactions;
    tnxs.map(async (tnx) => {
      if (tnx.creates != null) {
        let newSCAddress = tnx.creates;
        let isERC721 = await Validator.isERC721(newSCAddress);
        if (isERC721) {
          let contract = contractutils.loadContractFromAddress(newSCAddress);
          let name = await contract.name();
          let symbol = await contract.symbol();
          let erc721 = await ERC721CONTRACT.findOne({
            address: contract.address,
          });
          if (!erc721) {
            //   when the new contract is not registered yet
            let minter = new ERC721CONTRACT();
            minter.address = newSCAddress;
            minter.name = name;
            minter.symbol = symbol;
            let _minter = await minter.save();
            console.log(_minter);

            // track collection transfer
            // await collectionTracker.trackCollectionTransfer(newSCAddress);

            // track nft distribution
            // await collectionTracker.trackERC721Distribution(newSCAddress);
          }
        }
      }
    });
    console.log(height);
  }
};

const ERC721Detector = {
  erc721scanner,
  erc721detector,
};

module.exports = ERC721Detector;
