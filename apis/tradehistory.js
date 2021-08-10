const mongoose = require("mongoose");
const { getPrice } = require("../services/price.feed");
const toLowerCase = require("../utils/utils");
const router = require("express").Router();

const Account = mongoose.model("Account");
const BundleTradeHistory = mongoose.model("BundleTradeHistory");

const service_auth = require("./middleware/auth.tracker");

const getAccountInfo = async (address) => {
  if (!address) return null;
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

const parseToFTM = (inWei) => {
  return parseFloat(inWei.toString()) / 10 ** 18;
};

router.post("/addBundleHistory", service_auth, async (req, res) => {
  try {
    let newHistory = new BundleTradeHistory();
    newHistory.bundleID = req.body.bundleID;
    newHistory.activity = req.body.activity;
    newHistory.creator = toLowerCase(req.body.creator);
    newHistory.from = toLowerCase(req.body.from);
    newHistory.to = toLowerCase(req.body.to);
    newHistory.price = parseToFTM(req.body.price);
    newHistory.paymentToken = parseToFTM(req.body.paymentToken);
    let unitTkPrice = getPrice(req.body.paymentToken);
    newHistory.priceInUSD = parseToFTM(req.body.price) * unitTkPrice;
    newHistory.createdAt = new Date();
    await newHistory.save();
    return res.json({
      status: "success",
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
    });
  }
});

router.post("/getBundleTradeHistory", async (req, res) => {
  try {
    let bundleID = req.body.bundleID;
    let _history = await BundleTradeHistory.find({
      bundleID: { $regex: new RegExp(bundleID, "i") },
      activity: "Sale",
    })
      .select([
        "bundleID",
        "creator",
        "from",
        "to",
        "price",
        "paymentToken",
        "priceInUSD",
        "activity",
        "createdAt",
      ])
      .sort({ createdAt: "desc" });
    let history = [];

    let promise = _history.map(async (hist) => {
      let sender = await getAccountInfo(hist.from);
      let receiver = await getAccountInfo(hist.to);
      let creator = await getAccountInfo(hist.creator);
      history.push({
        bundleID: hist.bundleID,
        from: hist.from,
        to: hist.to,
        price: hist.price,
        paymentToken: hist.paymentToken,
        priceInUSD: hist.priceInUSD,
        createdAt: hist.createdAt,
        activity: hist.activity,
        creatorAlias: creator ? creator[0] : null,
        creatorImage: creator ? creator[1] : null,
        fromAlias: sender ? sender[0] : null,
        fromImage: sender ? sender[1] : null,
        toAlias: receiver ? receiver[0] : null,
        toImage: receiver ? receiver[1] : null,
      });
    });
    await Promise.all(promise);
    return res.send({
      status: "success",
      data: history,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

module.exports = router;
