require("dotenv").config();
const router = require("express").Router();

const mongoose = require("mongoose");
const TurkWork = mongoose.model("TurkWork");

const auth = require("./middleware/auth");
const toLowerCase = require("../utils/utils");
const validateSignature = require("../apis/middleware/auth.sign");

const adminAddress = process.env.ADMINADDRESS;

const extractAddress = require("../services/address.utils");

const isAdmin = (msgSender) => {
  return toLowerCase(adminAddress) == toLowerCase(msgSender);
};

router.get("/reportForWeek/:address", auth, async (req, res) => {
  try {
    let adderss = extractAddress(req, res);
    if (!isAdmin(adderss))
      return res.json({
        status: "failed",
        data: "Only Admin can call this function",
      });
    let turkAddress = toLowerCase(req.params.address);
    // get first & last day of week
    let curr = new Date();
    let first = curr.getDate() - curr.getDay();
    let last = first + 6;

    let firstDay = new Date(curr.setDate(first));
    let lastDay = new Date(curr.setDate(last));
    let bannedNFTs = await TurkWork.find({
      banDate: {
        $gte: new Date(new Date(firstDay).setHours(0, 0, 0)),
        $lte: new Date(new Date(lastDay).setHours(23, 59, 59)),
      },
    });
    return res.json({
      status: "success",
      data: bannedNFTs,
    });
  } catch (error) {
    return res.json({
      status: "failed",
    });
  }
});

router.get("/reportForMonth/:address", auth, async (req, res) => {
  try {
  } catch (error) {}
});
module.exports = router;
