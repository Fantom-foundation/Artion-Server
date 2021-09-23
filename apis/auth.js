require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;
const router = require("express").Router();
const ethers = require("ethers");
const mongoose = require("mongoose");
const Account = mongoose.model("Account");
const NotificationSetting = mongoose.model("NotificationSetting");
const toLowerCase = require("../utils/utils");

router.post("/getToken", async (req, res) => {
  let address = req.body.address;
  let isAddress = ethers.utils.isAddress(address);
  if (!isAddress)
    return res.json({
      status: "failed",
      token: "",
    });
  address = toLowerCase(address);
  // save a new account if not registered
  let account = await Account.findOne({ address: address });
  if (!account) {
    try {
      let newAccount = new Account();
      newAccount.address = address;
      await newAccount.save();
    } catch (error) {}
  }

  let notificationSettings = await NotificationSetting.findOne({
    address: address,
  });
  if (!notificationSettings)
    try {
      let ns = new NotificationSetting();
      ns.address = address;
      let _ns = await ns.save();
    } catch (error) {
      console.log(error);
    }
  let token = jwt.sign(
    {
      data: address,
    },
    jwt_secret,
    { expiresIn: "24h" }
  );
  return res.json({
    status: "success",
    token: token,
  });
});

module.exports = router;
