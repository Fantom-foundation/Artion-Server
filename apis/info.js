const router = require("express").Router();
const mongoose = require("mongoose");
const ERC721TOKEN = mongoose.model("ERC721TOKEN");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");
const Collection = mongoose.model("Collection");
const TransferHistory = mongoose.model("TransferHistory");

const contractutils = require("../services/contract.utils");
// list the newly minted 10 tokens
router.get("/getNewestTokens", async (req, res) => {
  let tokens = await ERC721TOKEN.find().sort({ createdAt: 1 }).limit(10);
  return res.json({
    status: "success",
    data: tokens,
  });
});

router.get("/geterc721contracts", async (req, res) => {
  let all = await ERC721CONTRACT.find({});
  let allCollections = await Collection.find({});
  let erc721contracts = new Array();

  for (let i = 0; i < all.length; ++i) {
    let contract = all[i];
    let collection = allCollections.find(
      (col) => col.erc721Address == contract.address
    );
    console.log(collection);

    if (collection) {
      console.log("collection of address ", contract.address);
      erc721contracts.push({
        address: collection.erc721Address,
        collectionName: collection.collectionName,
        description: collection.description,
        categories: collection.categories,
        logoImageHash: collection.logoImageHash,
        siteUrl: collection.siteUrl,
        discord: collection.discord,
        twitterHandle: collection.twitterHandle,
        mediumHandle: collection.mediumHandle,
        telegram: collection.telegram,
        isVerified: true,
      });
    } else {
      erc721contracts.push({
        address: contract.address,
        name: contract.name,
        symbol: contract.symbol,
        isVerified: false,
      });
    }
  }
  return res.json({
    status: "success",
    data: erc721contracts,
  });
});

router.post("/geterc721tokensfromaddress", async (req, res) => {
  let address = req.body.address;
  let transfers = await TransferHistory.find({ to: address });
  let tokens = new Array();
  for (let i = 0; i < transfers.length; ++i) {
    let transfer = transfers[i];
    let minter = transfer.collectionAddress;
    let tokenID = transfer.tokenID;
    let tokenUri = await contractutils.getTokenInfo(minter, tokenID);
    let name;
  }

  return res.json({
    status: "success",
    data: transfers,
  });
});

module.exports = router;
