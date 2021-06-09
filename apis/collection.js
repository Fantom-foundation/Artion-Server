require("dotenv").config();
const { default: axios } = require("axios");
const router = require("express").Router();
const mongoose = require("mongoose");
const Collection = mongoose.model("Collection");
const Category = mongoose.model("Category");
const ERC1155CONTRACT = mongoose.model("ERC1155CONTRACT");
const auth = require("./middleware/auth");
const toLowerCase = require("../utils/utils");
const ftmScanApiKey = process.env.FTM_SCAN_API_KEY;
const isValidERC1155 = require("../utils/1155_validator");
const isvalidERC721 = require("../services/validator");

router.post("/collectiondetails", auth, async (req, res) => {
  let erc721Address = req.body.erc721Address;
  erc721Address = toLowerCase(erc721Address);

  // validate to see whether the contract is either 721 or 1155, otherwise, reject

  try {
    let is721 = await isvalidERC721(erc721Address);
    if (!is721) {
      let is1155 = await isValidERC1155(erc721Address);
      if (!is1155)
        return res.status(400).json({
          status: "failed",
          data: "Invalid NFT Collection Address",
        });
    }
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }

  let collectionName = req.body.collectionName;
  let description = req.body.description;
  let categories = req.body.categories;
  categories = categories.split(",");
  let logoImageHash = req.body.logoImageHash;
  let siteUrl = req.body.siteUrl;
  let discord = req.body.discord;
  let twitterHandle = req.body.twitterHandle;
  let mediumHandle = req.body.mediumHandle;
  let telegram = req.body.telegram;
  let instagram = req.body.instagram;

  let collection = await Collection.findOne({ erc721Address: erc721Address });
  if (collection) {
    collection.erc721Address = erc721Address;
    collection.collectionName = collectionName;
    collection.description = description;
    collection.categories = categories;
    collection.logoImageHash = logoImageHash;
    collection.siteUrl = siteUrl;
    collection.discord = discord;
    collection.twitterHandle = twitterHandle;
    collection.mediumHandle = mediumHandle;
    collection.telegram = telegram;
    collection.instagramHandle = instagram;

    let _collection = await collection.save();
    if (_collection)
      return res.send({
        status: "success",
        data: _collection.toJson(),
      });
    else
      return res.send({
        status: "failed",
      });
  } else {
    // verify if 1155 smart contracts
    let is1155 = await isValidERC1155(erc721Address);
    if (is1155) {
      // need to add a new 1155 collection
      let sc_1155 = new ERC1155CONTRACT();
      sc_1155.address = erc721Address;
      sc_1155.name = collectionName;
      sc_1155.symbol = "Symbol";
      sc_1155.isVerified = true;
      await sc_1155.save();
      // save new category
      let category = new Category();
      category.minterAddress = erc721Address;
      category.type = 1155;
      await category.save();
    }
    // add a new collection
    let _collection = new Collection();
    _collection.erc721Address = erc721Address;
    _collection.collectionName = collectionName;
    _collection.description = description;
    _collection.categories = categories;
    _collection.logoImageHash = logoImageHash;
    _collection.siteUrl = siteUrl;
    _collection.discord = discord;
    _collection.twitterHandle = twitterHandle;
    _collection.mediumHandle = mediumHandle;
    _collection.telegram = telegram;
    _collection.instagramHandle = instagram;
    let newCollection = await _collection.save();
    if (newCollection)
      return res.send({
        status: "success",
        data: newCollection.toJson(),
      });
    else
      return res.send({
        status: "failed",
      });
  }
});

router.post("/searchCollection", auth, async (req, res) => {
  let erc721Address = req.body.erc721Address;
  erc721Address = toLowerCase(erc721Address);
  let collection = await Collection.findOne({ erc721Address: erc721Address });
  if (collection)
    return res.send({
      status: "success",
      data: collection.toJson(),
    });
  else
    return res.send({
      status: "failed",
    });
});

router.get("/fetchAllCollections", auth, async (req, res) => {
  let all = await Collection.find().sort({ collectionName: 1 });
  return res.json({
    status: "success",
    data: all,
  });
});

router.post("/getCollectionInfo", async (req, res) => {
  let address = toLowerCase(req.body.contractAddress);
  let collection = await Collection.findOne({ erc721Address: address });
  return res.json({
    status: "success",
    data: collection,
  });
});

router.post("/isValidated", auth, async (req, res) => {
  try {
    let erc721Address = req.body.erc721Address;
    erc721Address = toLowerCase(erc721Address);
    let request = `https://api.ftmscan.com/api?module=contract&action=getsourcecode&address=${erc721Address}&apikey=${ftmScanApiKey}`;
    let response = await axios.get(request);
    if (
      response.status != "1" ||
      response.result.ABI == "Contract source code not verified"
    )
      return res.json({
        status: "success",
        isValidated: "no",
      });
    return res.json({
      status: "success",
      isValidated: "yes",
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

module.exports = router;
