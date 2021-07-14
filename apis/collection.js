require("dotenv").config();
const { default: axios } = require("axios");
const router = require("express").Router();
const mongoose = require("mongoose");
const Collection = mongoose.model("Collection");
const Category = mongoose.model("Category");
const ERC1155CONTRACT = mongoose.model("ERC1155CONTRACT");
const ERC721CONTRACT = mongoose.model("ERC721CONTRACT");

const auth = require("./middleware/auth");
const admin_auth = require("./middleware/auth.admin");
const toLowerCase = require("../utils/utils");
const ftmScanApiKey = process.env.FTM_SCAN_API_KEY;
const isValidERC1155 = require("../utils/1155_validator");
const isvalidERC721 = require("../services/validator");
const extractAddress = require("../services/address.utils");

const applicationMailer = require("../mailer/reviewMailer");

router.post("/collectiondetails", auth, async (req, res) => {
  let erc721Address = req.body.erc721Address;
  erc721Address = toLowerCase(erc721Address);

  let owner = extractAddress(req, res);
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
      data: "",
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
  let email = req.body.email;

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
    collection.email = email;

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
    _collection.owner = owner;
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
    _collection.status = false;
    _collection.email = email;
    let newCollection = await _collection.save();
    if (newCollection) {
      // notify admin about a new app
      applicationMailer.notifyAdminForNewCollectionApplication();
      return res.send({
        status: "success",
        data: newCollection.toJson(),
      });
    } else
      return res.send({
        status: "failed",
      });
  }
});

router.post("/getReviewApplications", admin_auth, async (req, res) => {
  try {
    let applications = await Collection.find({ status: false });
    return res.json({
      status: "success",
      data: applications,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.post("/reviewApplication", admin_auth, async (req, res) => {
  try {
    let contractAddress = toLowerCase(req.body.contractAddress);
    let status = parseInt(req.body.status);
    let collection = await Collection.findOne({
      erc721Address: contractAddress,
    });
    if (!collection)
      return res.json({
        status: "failed",
      });

    let email = collection.email;
    if (status == 0) {
      // deny -- remove from collection and send email
      let reason = req.body.reason;
      await collection.remove();
      // send deny email
      applicationMailer.sendApplicationDenyEmail({
        to: email,
        subject: "Collection Registration Failed!",
        reason: `${reason}`,
      });
      return res.json({
        status: "success",
      });
    } else if (status == 1) {
      // approve -- udpate collection and send email
      collection.status = true;
      await collection.save();
      // send email
      applicationMailer.sendApplicationReviewedEmail({
        to: email,
        subject: "Collection Registerd Successfully!",
      });
    } else {
      return res.json({
        status: "failed",
      });
    }
  } catch (error) {
    return res.json({
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
  if (collection)
    return res.json({
      status: "success",
      data: collection,
    });
  collection = await ERC721CONTRACT.findOne({
    address: address,
  });
  if (collection)
    return res.json({
      status: "success",
      data: collection,
    });
  collection = await ERC1155CONTRACT.findOne({
    address: address,
  });
  if (collection)
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
