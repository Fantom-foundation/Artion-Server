require("dotenv").config();

const ethers = require("ethers");
const SimpleNFTSellerContract = require("../constants/simpleseller.sc");
const simeNFTSellerSC = require("../constants/simpleseller.sc");

const trackListing = async (isTestnet) => {
  let provider = new ethers.providers.JsonRpcProvider(
    isTestnet ? process.env.TESTNET_RPC : process.env.MAINNET_RPC,
    isTestnet ? process.env.TESTNET_CHAINID : process.env.MAINNET_CHAINID
  );
  let contract = new ethers.Contract(
    isTestnet
      ? SimpleNFTSellerContract.TESTNET_ADDRESS
      : SimpleNFTSellerContract.MAINNET_ADDRESS,
    simeNFTSellerSC.ABI,
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
};

module.exports = trackListing;
