require("dotenv").config();
const mongoose = require("mongoose");
const router = require("express").Router();
const service_auth = require("./middleware/auth.tracker");
const sendEmail = require("../mailer/bundleMailer");

const toLowerCase = (val) => {
  if (val) return val.toLowerCase();
  else return val;
};
const parseToFTM = (inWei) => {
  return parseFloat(inWei.toString()) / 10 ** 18;
};

const getUserAlias = async (walletAddress) => {
  try {
    let account = await Account.findOne({ address: walletAddress });
    if (account) return account.alias;
    else return walletAddress;
  } catch (error) {
    return walletAddress;
  }
};

router.post("itemListed", service_auth, async (req, res) => {
  try {
    let bundleID = req.body.bundleID;
    let owner = toLowerCase(req.body.owner);
    let price = parseToFTM(req.body.price);
    let startingTime = req.body.startingTime;
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/itemSold", service_auth, async (req, res) => {
  try {
    let seller = toLowerCase(req.body.seller);
    let buyer = toLowerCase(req.body.buyer);
    let bundleID = req.body.bundleID;
    let price = parseToFTM(req.body.price);
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/itemUpdated", service_auth, async (req, res) => {
  try {
    let owner = toLowerCase(req.body.owner);
    let bundleID = req.body.bundleID;
    let nfts = req.body.nft;
    let tokenIDs = req.body.tokenID;
    let quantities = req.body.quantity;
    let newPrice = req.body.newPRice;
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/itemCalceled", service_auth, async (req, res) => {
  try {
    let owner = toLowerCase(req.body.owner);
    let bundleID = req.body.bundleID;
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/offerCreated", service_auth, async (req, res) => {
  try {
    let creator = toLowerCase(req.body.creator);
    let bundleID = req.body.bundleID;
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});

router.post("/offerCanceled", service_auth, async (req, res) => {
  try {
    let creator = toLowerCase(req.body.creator);
    let bundleID = req.body.bundleID;
  } catch (error) {
    return res.status(400).json({});
  } finally {
    return res.json({});
  }
});
