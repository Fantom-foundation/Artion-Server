const router = require("express").Router();
const mongoose = require("mongoose");

const BundleOffer = mongoose.model("BundleOffer");
const Account = mongoose.model("Account");

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
        paymentToken: offer.paymentToken,
        priceInUSD: offer.priceInUSD,
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
    return res.json({ status: "failed" });
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
