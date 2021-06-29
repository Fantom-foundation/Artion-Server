const router = require("express").Router();
const auth = require("./middleware/auth");
const mongoose = require("mongoose");

const Offer = mongoose.model("Offer");
const BundleOffer = mongoose.model("BundleOffer");
const Account = mongoose.model("Account");

const toLowerCase = require("../utils/utils");

router.post("/getOffers", async (req, res) => {
  let nft = req.body.contractAddress;
  nft = toLowerCase(nft);
  let tokenID = parseInt(req.body.tokenID);
  let offers = [];

  try {
    let _offers = await Offer.find({
      minter: { $regex: new RegExp(nft, "i") },
      tokenID: tokenID,
    });
    let promise = _offers.map(async (offer) => {
      let account = await getAccountInfo(offer.creator);
      offers.push({
        creator: offer.creator,
        minter: offer.minter,
        tokenID: offer.tokenID,
        quantity: offer.quantity,
        pricePerItem: offer.pricePerItem,
        deadline: offer.deadline,
        alias: account ? account[0] : null,
        image: account ? account[1] : null,
      });
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data: offers,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.post("/getBundleOffer", async (req, res) => {
  try {
    let bundleID = req.body.bundleID;
    let bundleOffers = await BundleOffer.find({
      bundleID: bundleID,
    });
    let offers = [];
    let promise = bundleOffers.map(async (offer) => {
      let account = await getAccountInfo(offer.creator);
      offers.push({
        creator: offer.creator,
        bundleID,
        price: offer.price,
        deadline: offer.deadline,
        alias: account ? account[0] : null,
        image: account ? account[1] : null,
      });
    });
    await Promise.all(promise);
    return res.json({
      status: "success",
      data: offers,
    });
  } catch (error) {
    return res.status(400).json({});
  }
});

const getAccountInfo = async (address) => {
  try {
    let account = await Account.findOne({ address: address });
    if (account) {
      return [account.alias, account.imageHash];
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

module.exports = router;
