require("dotenv").config();

const mongoose = require("mongoose");
require("../models/tradehistory");
const ethers = require("ethers");
const SimpleNFTSellerContract = require("../constants/simpleseller.sc");

const TradeHistory = mongoose.model("TradeHistory");

const trackListing = async (isTestnet) => {
  let provider = new ethers.providers.JsonRpcProvider(
    isTestnet ? process.env.TESTNET_RPC : process.env.MAINNET_RPC,
    isTestnet ? process.env.TESTNET_CHAINID : process.env.MAINNET_CHAINID
  );
  let contract = new ethers.Contract(
    isTestnet
      ? SimpleNFTSellerContract.TESTNET_ADDRESS
      : SimpleNFTSellerContract.MAINNET_ADDRESS,
    SimpleNFTSellerContract.ABI,
    provider
  );
  contract.on(
    "ItemListed",
    (
      owner,
      nft,
      tokenID,
      quantity,
      pricePerItem,
      startingTime,
      isPrivate,
      allowedAddress
    ) => {
      console.log(
        "fired event params are ",
        owner,
        nft,
        tokenID,
        quantity,
        pricePerItem,
        startingTime,
        isPrivate,
        allowedAddress
      );
    }
  );

  contract.on("ItemSold", async (seller, buyer, nft, tokenID, price) => {
    let trade = new TradeHistory();
    trade.erc721address = nft;
    trade.from = seller;
    trade.to = buyer;
    trade.tokenID = tokenID;
    trade.price = price;
    await trade.save();
  });
};

module.exports = trackListing;
