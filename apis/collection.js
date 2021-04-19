require("dotenv").config();
const { default: axios } = require("axios");
const router = require("express").Router();
const mongoose = require("mongoose");

const auth = require("./middleware/auth");

const Collection = mongoose.model("Collection");

const ftmScanApiKey = process.env.FTM_SCAN_API_KEY;

router.post("/collectiondetails", auth, async (req, res) => {
  let erc721Address = req.body.erc721Address;
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
        data: _collection,
      });
    else
      return res.send({
        status: "failed",
      });
  } else {
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
        data: newCollection,
      });
    else
      return res.send({
        status: "failed",
      });
  }
});

router.post("/searchCollection", auth, async (req, res) => {
  let erc721Address = req.body.erc721Address;
  let collection = await Collection.findOne({ erc721Address: erc721Address });
  if (collection)
    return res.send({
      status: "success",
      data: collection,
    });
  else
    return res.send({
      status: "failed",
    });
});

router.get("/fetchAllCollections", auth, async (req, res) => {
  let all = await Collection.find();
  return res.json({
    status: "success",
    data: all,
  });
});

router.post("/isValidated", auth, async (req, res) => {
  try {
    let erc721Address = req.body.erc721Address;
    let request = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${erc721Address}&apikey=${ftmScanApiKey}`;
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
