require("dotenv").config();

const mongoose = require("mongoose");
require("../models/tradehistory");
require("../models/listing");
require("../models/erc721token")
const ethers = require("ethers");
const SimpleNFTSellerContract = require("../constants/simpleseller.sc");

const TradeHistory = mongoose.model("TradeHistory");
const Listing = mongoose.model("Listing");
const ERC721TOKEN = mongoose.model("ERC721TOKEN")

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
      let listing = new Listing();
      listing.owner = owner;
      listing.minter = nft;
      listing.tokenID = tokenID;
      listing.quantity = quantity;
      listing.price = pricePerItem;
      listing.startTime = new Date(startingTime);
      listing.isPrivate = isPrivate;
      listing.allowedAddress = allowedAddress;
      await listing.save()

      // update the price of nft when listed
      let token = await ERC721TOKEN.findOne({
        contractAddress : nft, tokenID : tokenID
      })
      if(token){
      token.price = pricePerItem
      await token.save()}
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

    // update the last sale price
    let token = await ERC721TOKEN.findOne({
      contractAddress : nft, tokenID : tokenID
    })
    if(token){
      token.lastSalePrice = price
      await token.save()
    }
  });

  contract.on("ItemCanceled", async (owner, nft, tokenID) => {
    await Listing.deleteOne({
      owner : owner,
      minter : nft,
      tokenID : tokenID
    })
  });
};

module.exports = trackListing;
